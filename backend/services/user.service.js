const prisma = require('../config/db');

const getAllUsers = async (filters = {}) => {
    try {
        const { role, search, page = 1, limit = 10 } = filters;

        console.log("=== getAllUsers Debug Info ===");
        console.log("Filters received:", filters);
        console.log("Role filter:", role);
        console.log("Search term:", search);
        console.log("Page:", page, "Limit:", limit);

        // Build where clause
        const whereClause = {
            is_deleted: false
        };

        if (role) {
            whereClause.role = role.toUpperCase(); // Ensure role is uppercase to match enum
            console.log("Role filter applied:", whereClause.role);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        console.log("Skip:", skip, "Take:", limit);

        // Build search conditions
        let searchConditions = {};
        if (search) {
            const baseSearch = [
                { user_id: { contains: search, mode: 'insensitive' } }
            ];

            // Only include student search if role is STUDENT or not specified
            if (!role || role.toUpperCase() === 'STUDENT') {
                baseSearch.push({
                    student: {
                        OR: [
                            { full_name: { contains: search, mode: 'insensitive' } },
                            { email_address: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                });
            }

            // Only include alumni search if role is ALUMNI or not specified
            if (!role || role.toUpperCase() === 'ALUMNI') {
                baseSearch.push({
                    alumni: {
                        OR: [
                            { full_name: { contains: search, mode: 'insensitive' } },
                            { email_address: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                });
            }

            searchConditions = { OR: baseSearch };
            console.log("Search conditions:", JSON.stringify(searchConditions, null, 2));
        }

        // Combine where conditions
        const finalWhereClause = search ?
            { AND: [whereClause, searchConditions] } :
            whereClause;

        console.log("Final where clause:", JSON.stringify(finalWhereClause, null, 2));

        // Get users with their details
        const users = await prisma.user.findMany({
            where: finalWhereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        email_address: true,
                        mobile_number: true,
                        gender: true,
                        profile_picture_url: true,
                        bio: true,
                        linked_in: true,
                        github: true
                    }
                },
                alumni: {
                    select: {
                        id: true,
                        full_name: true,
                        email_address: true,
                        mobile_number: true,
                        gender: true,
                        profile_picture_url: true,
                        bio: true,
                        passing_batch: true
                    }
                },
                _count: {
                    select: {
                        jobs: true,
                        applications: true
                    }
                }
            },
            orderBy: {
                user_id: 'asc'
            },
            skip: skip,
            take: parseInt(limit)
        });

        console.log("Users found:", users.length);
        console.log("Users data:", users.map(u => ({
            id: u.id,
            user_id: u.user_id,
            role: u.role,
            student: u.student,
            alumni: u.alumni
        })));

        // Get total count for pagination
        const totalUsers = await prisma.user.count({
            where: finalWhereClause
        });

        console.log("Total users matching filters:", totalUsers);

        // Format response
        const formattedUsers = users.map(user => ({
            id: user.id,
            user_id: user.user_id,
            role: user.role,
            profile: user.role === 'STUDENT' ? user.student : user.alumni,
            stats: {
                jobs_posted: user._count.jobs,
                applications_made: user._count.applications
            }
        }));

        console.log("Formatted users:", formattedUsers);

        return {
            success: true,
            data: {
                users: formattedUsers,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: totalUsers,
                    total_pages: Math.ceil(totalUsers / limit)
                }
            },
            message: "Users retrieved successfully"
        };

    } catch (error) {
        console.error("Error in getAllUsers service:", error);
        return {
            success: false,
            error: error.message,
            message: "Failed to retrieve users"
        };
    }
};
const getUserById = async (userId) => {
    try {
        console.log("User ID received:", userId);
        const user = await prisma.user.findFirst({
            where: {
              OR: [
                { id: userId },
                { user_id: userId }
              ]
            },
            include: {
              student: true,
              alumni: true
            }
          });
          
        if (!user) {
            throw new Error('User not found');
        }

        let detailedUser = { ...user };

        if (user.role === "STUDENT" && user.student) {
            detailedUser.studentDetails = user.student;
        } else if (user.role === "ALUMNI" && user.alumni) {
            detailedUser.alumniDetails = user.alumni;
        }

        return detailedUser;
    } catch (error) {
        console.error("Error in getUserById service:", error);
        throw error;
    }
};

const createUser = async (user, id, role) => {
    console.log("Creating user with data:", user, id, role);

    try {
        if (role === "STUDENT") {
            const studentData = {
                user_id: id,
                full_name: user.full_name,
                bio: user.bio || '',
                mobile_number: user.mobile_number,
                gender: user.gender,
                email_address: user.email_address,
                linked_in: user.linked_in || '',
                github: user.github || '',
                about_us: user.about_us || '',
                dob: new Date(user.dob),
                profile_picture_url: user.profile_picture_url || '',
                resume: user.resume || '',
            };
            console.log("Creating STUDENT with data:", studentData);

            await prisma.studentDetails.create({
                data: studentData
            });
        }

        if (role === "ALUMNI") {
            const alumniData = {
                user_id: id,
                full_name: user.full_name,
                bio: user.bio || '',
                mobile_number: user.mobile_number,
                gender: user.gender,
                email_address: user.email_address,
                dob: new Date(user.dob),
                profile_picture_url: user.profile_picture_url || '',
                passing_batch: parseInt(user.passing_batch),
                degree_certificate: user.degree_certificate || '',
            };
            console.log("Creating ALUMNI with data:", alumniData);

            await prisma.alumniDetails.create({
                data: alumniData
            });
        }

        return { success: true, message: "User created successfully" };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: "Failed to create user", error: error.message };
    }
}

const updateUser = async (reqBody, id, role) => {
    try {
        if (role === "STUDENT") {
            const updateData = {};

            // Only update fields that are provided
            if (reqBody.full_name !== undefined) updateData.full_name = reqBody.full_name;
            if (reqBody.bio !== undefined) updateData.bio = reqBody.bio;
            if (reqBody.mobile_number !== undefined) updateData.mobile_number = reqBody.mobile_number;
            if (reqBody.gender !== undefined) updateData.gender = reqBody.gender;
            if (reqBody.email_address !== undefined) updateData.email_address = reqBody.email_address;
            if (reqBody.linked_in !== undefined) updateData.linked_in = reqBody.linked_in;
            if (reqBody.github !== undefined) updateData.github = reqBody.github;
            if (reqBody.about_us !== undefined) updateData.about_us = reqBody.about_us;
            if (reqBody.dob !== undefined) updateData.dob = new Date(reqBody.dob);
            if (reqBody.profile_picture_url !== undefined) updateData.profile_picture_url = reqBody.profile_picture_url;
            if (reqBody.resume !== undefined) updateData.resume = reqBody.resume;

            await prisma.studentDetails.upsert({
                where: { user_id: id },
                update: updateData,
                create: {
                    user_id: id,
                    ...updateData,
                    // Add required fields with defaults if not provided
                    full_name: updateData.full_name || '',
                    bio: updateData.bio || '',
                    mobile_number: updateData.mobile_number || '',
                    gender: updateData.gender || '',
                    email_address: updateData.email_address || '',
                    linked_in: updateData.linked_in || '',
                    github: updateData.github || '',
                    about_us: updateData.about_us || '',
                    dob: updateData.dob || new Date(),
                    profile_picture_url: updateData.profile_picture_url || '',
                    resume: updateData.resume || ''
                }
            });
        }

        if (role === "ALUMNI") {
            const updateData = {};
            
            // Only update fields that are provided
            if (reqBody.full_name !== undefined) updateData.full_name = reqBody.full_name;
            if (reqBody.bio !== undefined) updateData.bio = reqBody.bio;
            if (reqBody.mobile_number !== undefined) updateData.mobile_number = reqBody.mobile_number;
            if (reqBody.gender !== undefined) updateData.gender = reqBody.gender;
            if (reqBody.email_address !== undefined) updateData.email_address = reqBody.email_address;
            if (reqBody.dob !== undefined) updateData.dob = new Date(reqBody.dob);
            if (reqBody.profile_picture_url !== undefined) updateData.profile_picture_url = reqBody.profile_picture_url;
            if (reqBody.passing_batch !== undefined) updateData.passing_batch = parseInt(reqBody.passing_batch);
            if (reqBody.degree_certificate !== undefined) updateData.degree_certificate = reqBody.degree_certificate;

            await prisma.alumniDetails.upsert({
                where: { user_id: id },
                update: updateData,
                create: {
                    user_id: id,
                    ...updateData,
                    // Add required fields with defaults if not provided
                    full_name: updateData.full_name || '',
                    bio: updateData.bio || '',
                    mobile_number: updateData.mobile_number || '',
                    gender: updateData.gender || '',
                    email_address: updateData.email_address || '',
                    dob: updateData.dob || new Date(),
                    profile_picture_url: updateData.profile_picture_url || '',
                    passing_batch: updateData.passing_batch || 0,
                    degree_certificate: updateData.degree_certificate || ''
                }
            });
        }

        return { success: true, message: "User details updated successfully" };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, message: "Failed to update user", error: error.message };
    }
};

const deleteUser = async (id) => {
    try {
        await prisma.user.update({
            where: { user_id: id },
            data: { is_deleted: true }
        });

        return { success: true, message: "User deleted successfully" };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: "Failed to delete user", error: error.message };
    }
}

module.exports = {
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
}