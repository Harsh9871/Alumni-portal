const prisma = require('../config/db');


const getAllUsers = async (filters = {}) => {
    try {
        const { role, search, page = 1, limit = 10 } = filters;
        
        // Build where clause
        const whereClause = {
            is_deleted: false
        };
        
        if (role) {
            whereClause.role = role;
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Build search conditions
        let searchConditions = {};
        if (search) {
            searchConditions = {
                OR: [
                    { user_id: { contains: search, mode: 'insensitive' } },
                    { 
                        student: {
                            OR: [
                                { full_name: { contains: search, mode: 'insensitive' } },
                                { email_address: { contains: search, mode: 'insensitive' } }
                            ]
                        }
                    },
                    { 
                        alumni: {
                            OR: [
                                { full_name: { contains: search, mode: 'insensitive' } },
                                { email_address: { contains: search, mode: 'insensitive' } }
                            ]
                        }
                    }
                ]
            };
        }
        
        // Combine where conditions
        const finalWhereClause = search ? 
            { AND: [whereClause, searchConditions] } : 
            whereClause;
        
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
        
        // Get total count for pagination
        const totalUsers = await prisma.user.count({
            where: finalWhereClause
        });
        
        // Format response
        const formattedUsers = users.map(user => ({
            id: user.id,
            user_id: user.user_id,
            role: user.role,
            profile: user.role === 'student' ? user.student : user.alumni,
            stats: {
                jobs_posted: user._count.jobs,
                applications_made: user._count.applications
            },
            created_at: user.created_at || null
        }));
        
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
const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { user_id:id }
    });

    if (!user) {
        throw new Error('User not found');
    }

    let detailedUser = { ...user };

    if (user.role === "STUDENT") {
        detailedUser.studentDetails = await prisma.studentDetails.findUnique({
            where: { user_id: user.id }
        });
    } else if (user.role === "ALUMNI") {
        detailedUser.alumniDetails = await prisma.alumniDetails.findUnique({
            where: { user_id: user.id }
        });
    }

    return detailedUser;
};


const createUser = async (user , id , role) => {
  
    console.log("Creating user with data:", user , id, role);
    try {
        if (role === "STUDENT") {
            const studentData = {
                user_id: id,
                full_name: user.full_name,
                bio: user.bio,
                mobile_number: user.mobile_number,
                gender: user.gender,
                email_address: user.email_address,
                linked_in: user.linked_in,
                github: user.github,
                about_us: user.about_us,
                dob: new Date(user.dob),
                profile_picture_url: user.profile_picture_url,
                resume: user.resume,
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
                bio: user.bio,
                mobile_number: user.mobile_number,
                gender: user.gender,
                email_address: user.email_address,
                dob: new Date(user.dob),
                profile_picture_url: user.profile_picture_url,
                passing_batch: user.passing_batch,
                degree_certificate: user.degree_certificate,
            };
            console.log("Creating ALUMNI with data:", alumniData);

            await prisma.alumniDetails.create({
                data: alumniData
            });
        }
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: "Failed to create user", error };
    }
    
    return { success: true, message: "User created successfully" };
}


const updateUser = async (reqBody, id,role) => {
    

    try {
        if (role === "STUDENT") {
            await prisma.studentDetails.update({
                where: {
                    user_id: id
                },
                data: {
                    full_name: reqBody.full_name,
                    bio: reqBody.bio,
                    mobile_number: reqBody.mobile_number,
                    gender: reqBody.gender,
                    email_address: reqBody.email_address,
                    linked_in: reqBody.linked_in,
                    github: reqBody.github,
                    about_us: reqBody.about_us,
                    dob: reqBody.dob ? new Date(reqBody.dob) : undefined,
                    profile_picture_url: reqBody.profile_picture_url,
                    resume: reqBody.resume
                }
            });
        }

        if (role === "ALUMNI") {
            await prisma.alumniDetails.update({
                where: {
                    user_id: id
                },
                data: {
                    full_name: reqBody.full_name,
                    bio: reqBody.bio,
                    mobile_number: reqBody.mobile_number,
                    gender: reqBody.gender,
                    email_address: reqBody.email_address,
                    dob: reqBody.dob ? new Date(reqBody.dob) : undefined,
                    profile_picture_url: reqBody.profile_picture_url,
                    passing_batch: reqBody.passing_batch,
                    degree_certificate: reqBody.degree_certificate
                }
            });
        }

        return { success: true, message: "User details updated successfully" };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, message: "Failed to update user", error };
    }
};


const deleteUser = async (id) => {
    
    const newUser =await prisma.user.update({
        where: {
            id: id
        },
        data: {
            is_deleted: true
        }
    });
    return { success: true, message: "User deleted successfully" };
}

module.exports = {
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
}