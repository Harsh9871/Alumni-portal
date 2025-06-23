const prisma = require('../config/db');



const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id }
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
    deleteUser
}