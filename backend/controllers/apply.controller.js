const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const applyService = require("../services/apply.service");

class ApplyController {
    async getApplyController(req, res) {
        try {
            const { id: jobId } = req.params;
            const { role } = req.user;

            // Only alumni can view applications for their job posts
            if (role !== 'alumni') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Only alumni can view job applications."
                });
            }

            // Verify that the job belongs to the requesting alumni
            const job = await prisma.job.findUnique({
                where: {
                    id: jobId,
                    user_id: req.user.id,
                    is_deleted: false
                }
            });

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found or you don't have permission to view applications."
                });
            }

            const result = await applyService.getApplyService(jobId);

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
            console.error("Error in getApplyController:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
    
    async applyForJobController(req, res) {
        try {
            const { id: jobId } = req.params;
            const { id: userId, role } = req.user;

            // Only students can apply for jobs
            if (role !== 'student') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Only students can apply for jobs."
                });
            }

            // Verify that the user has student details
            const studentDetails = await prisma.studentDetails.findUnique({
                where: {
                    user_id: userId
                }
            });

            if (!studentDetails) {
                return res.status(400).json({
                    success: false,
                    message: "Please complete your student profile before applying for jobs."
                });
            }

            const result = await applyService.applyForJobService(userId, jobId);

            if (result.success) {
                return res.status(201).json({
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
            console.error("Error in applyForJobController:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
    
    async deleteApplyController(req, res) {
        try {
            const { id: jobId } = req.params;
            const { id: userId, role } = req.user;

            // Only students can delete their job applications
            if (role !== 'student') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Only students can delete their job applications."
                });
            }

            const result = await applyService.deleteApplyService(userId, jobId);

            if (result.success) {
                return res.status(200).json({
                    success: true,
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
            console.error("Error in deleteApplyController:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}
    
module.exports = new ApplyController();