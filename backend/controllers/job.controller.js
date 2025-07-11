const jobsService = require("../services/jobs.service");

class JobsController {
  async getJobsController(req, res) {
    try {
      // Get filter from query params or body
      const filter = req.method === 'GET' ? req.query : req.body?.filter || {};
      
      const jobs = await jobsService.getJobs({ filter });
      
      res.status(200).json({
        success: true,
        message: "Jobs fetched successfully",
        data: jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error("Error in getJobsController:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  async getJobByIdController(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Job ID is required"
        });
      }

      const job = await jobsService.getJobById(id);
      
      res.status(200).json({
        success: true,
        message: "Job fetched successfully",
        data: job
      });
    } catch (error) {
      console.error("Error in getJobByIdController:", error);
      
      if (error.message === "Job not found") {
        return res.status(404).json({
          success: false,
          message: "Job not found"
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  async createJobController(req, res) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user found"
        });
      }

      // Check if user is an alumni
      if (req.user.role !== "ALUMNI") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only alumni can create jobs"
        });
      }

      const {
        job_title,
        job_description,
        designation,
        location,
        mode,
        experience,
        salary,
        vacancy,
        joining_date,
        status,
        open_till
      } = req.body;

      // Validate required fields
      if (!job_title || !job_description || !designation || !location || !mode || !experience || !salary || !vacancy || !joining_date || !status || !open_till) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
          required_fields: [
            "job_title",
            "job_description", 
            "designation",
            "location",
            "mode",
            "experience",
            "salary",
            "vacancy",
            "joining_date",
            "status",
            "open_till"
          ]
        });
      }

      // Validate status enum
      const validStatuses = ["OPEN", "CLOSED", "ON_HOLD"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: OPEN, CLOSED, ON_HOLD"
        });
      }

      // Validate dates
      const joiningDate = new Date(joining_date);
      const openTillDate = new Date(open_till);
      const currentDate = new Date();

      if (isNaN(joiningDate.getTime()) || isNaN(openTillDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)"
        });
      }

      if (openTillDate <= currentDate) {
        return res.status(400).json({
          success: false,
          message: "Open till date must be in the future"
        });
      }

      if (joiningDate <= currentDate) {
        return res.status(400).json({
          success: false,
          message: "Joining date must be in the future"
        });
      }

      // Validate vacancy
      if (isNaN(vacancy) || vacancy <= 0) {
        return res.status(400).json({
          success: false,
          message: "Vacancy must be a positive number"
        });
      }

      console.log("Creating job:", {
        joining_date: joiningDate,
        open_till: openTillDate,
        status,
        user_id: req.user.id,
        user_role: req.user.role
      });

      const newJob = await jobsService.createJob({
        job_title,
        job_description,
        designation,
        location,
        mode,
        experience,
        salary,
        vacancy,
        joining_date: joiningDate,
        status,
        open_till: openTillDate,
        user_id: req.user.id
      });

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: newJob
      });
    } catch (error) {
      console.error("Error in createJobController:", error);

      if (error.message.includes("required") || error.message.includes("Invalid")) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes("Unauthorized") || error.message.includes("alumni")) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  async updateJobController(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Job ID is required"
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user found"
        });
      }

      // Validate dates if provided
      const { joining_date, open_till, status, vacancy } = req.body;
      
      if (joining_date) {
        const joiningDate = new Date(joining_date);
        if (isNaN(joiningDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid joining date format"
          });
        }
      }

      if (open_till) {
        const openTillDate = new Date(open_till);
        if (isNaN(openTillDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid open till date format"
          });
        }
      }

      if (status) {
        const validStatuses = ["OPEN", "CLOSED", "ON_HOLD"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status. Must be one of: OPEN, CLOSED, ON_HOLD"
          });
        }
      }

      if (vacancy !== undefined) {
        if (isNaN(vacancy) || vacancy <= 0) {
          return res.status(400).json({
            success: false,
            message: "Vacancy must be a positive number"
          });
        }
      }

      const updatedJob = await jobsService.updateJob(id, req.body, req.user.id);

      res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data: updatedJob
      });
    } catch (error) {
      console.error("Error in updateJobController:", error);

      if (error.message === "Job not found") {
        return res.status(404).json({
          success: false,
          message: "Job not found"
        });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes("Invalid")) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  async deleteJobController(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Job ID is required"
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user found"
        });
      }

      const deletedJob = await jobsService.deleteJob(id, req.user.id);

      res.status(200).json({
        success: true,
        message: "Job deleted successfully",
        data: deletedJob
      });
    } catch (error) {
      console.error("Error in deleteJobController:", error);

      if (error.message === "Job not found") {
        return res.status(404).json({
          success: false,
          message: "Job not found"
        });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

module.exports = new JobsController();