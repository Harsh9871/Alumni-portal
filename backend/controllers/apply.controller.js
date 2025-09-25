// controllers/apply.controller.js
const prisma = require("../config/db");
const applyService = require("../services/apply.service");

class ApplyController {
  async getApplyController(req, res) {
    try {
      const { id: jobId } = req.params;
      const { role, id: userId } = req.user;

      // Only alumni can view applications
      if (role !== 'ALUMNI') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only alumni can view job applications."
        });
      }

      // Verify job ownership
      const job = await prisma.job.findUnique({
        where: {
          id: jobId,
          user_id: userId,
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

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getApplyController:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async applyForJobController(req, res) {
    try {
      const { id: jobId } = req.params;
      const { id: userId, role } = req.user;

      // Only students can apply
      if (role !== 'STUDENT') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only students can apply for jobs."
        });
      }

      // Verify student details
      const studentDetails = await prisma.studentDetails.findUnique({
        where: { user_id: userId }
      });

      if (!studentDetails) {
        return res.status(400).json({
          success: false,
          message: "Please complete your student profile before applying for jobs."
        });
      }

      const result = await applyService.applyForJobService(userId, jobId);

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error in applyForJobController:", error);
      
      if (error.message.includes("not found") || error.message.includes("already applied")) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes("deadline") || error.message.includes("not currently open")) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async deleteApplyController(req, res) {
    try {
      const { id: jobId } = req.params;
      const { id: userId, role } = req.user;

      // Only students can delete applications
      if (role !== 'STUDENT') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only students can delete their job applications."
        });
      }

      const result = await applyService.deleteApplyService(userId, jobId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in deleteApplyController:", error);
      
      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ApplyController();