const userService = require('../services/user.service');
const getAllUsers = async (req, res) => {
    try {
        
        // Extract query parameters
        const {
            role: filterRole,
            search,
            page = 1,
            limit = 10
        } = req.query;
        
        // Validate pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (pageNum < 1) {
            return res.status(400).json({
                success: false,
                message: "Page number must be greater than 0"
            });
        }
        
        if (limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }
        
        // Validate role filter
        const validRoles = ['student', 'alumni', 'admin'];
        if (filterRole && !validRoles.includes(filterRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role filter. Must be one of: student, alumni, admin"
            });
        }
        
        // Prepare filters
        const filters = {
            role: filterRole,
            search: search?.trim(),
            page: pageNum,
            limit: limitNum
        };
        
        // Call service
        const result = await userService.getAllUsers(filters);
        
        if (result.success) {
            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
        
    } catch (error) {
        console.error("Error in getAllUsers controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
const getUserById = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await userService.getUserById(id);

        if (user.role === "STUDENT" && user.studentDetails) {
            const details = user.studentDetails;
            res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    role: user.role,
                    full_name: details.full_name,
                    bio: details.bio,
                    mobile_number: details.mobile_number,
                    gender: details.gender,
                    email_address: details.email_address,
                    linked_in: details.linked_in,
                    github: details.github,
                    about_us: details.about_us,
                    dob: details.dob,
                    profile_picture_url: details.profile_picture_url,
                    resume: details.resume
                }
            });
        } else if (user.role === "ALUMNI" && user.alumniDetails) {
            const details = user.alumniDetails;
            res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    role: user.role,
                    full_name: details.full_name,
                    bio: details.bio,
                    mobile_number: details.mobile_number,
                    gender: details.gender,
                    email_address: details.email_address,
                    dob: details.dob,
                    profile_picture_url: details.profile_picture_url,
                    passing_batch: details.passing_batch,
                    degree_certificate: details.degree_certificate
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User details not found"
            });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


const createUser = async (req, res) => {
    const userData = req.body;
    let id = req.user.id;
    let role = req.user.role;
    try {
        const result = await userService.createUser(userData, id , role);
        console.log("User created controller :", result);
        if (result.success) {
            res.status(201).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error("Unexpected error creating user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const updateUser = async (req, res) =>{
    let id = req.user.id;
    let role = req.user.role;
    const reqBody = req.body;
    try {
        const result = await userService.updateUser(reqBody, id , role);
        console.log("User updated controller :", result);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
    }catch (error) {
        console.error("Unexpected error updating user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const deleteUser = async (req, res) =>{
    let id = req.user.id;
    try {
        const result = await userService.deleteUser(id);
        console.log("User deleted controller :", result);
        if (result.success) {
            res.status(200).json({
                success: true,
            })
        }
        else{
            res.status(500).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    }catch (error) {
        console.error("Unexpected error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
}