const jobsService = require("../services/jobs.service");

class JobsController {
  async getJobsController(req, res) {
    try {
      // Get filter from query params for GET requests
      const filter = req.query;
      
      const jobs = await jobsService.getJobs({ filter });
      
      res.status(200).json({
        success: true,
        message: "Jobs fetched successfully",
        data: jobs,
        count: jobs.length,
        filters_applied: Object.keys(filter).length > 0 ? filter : null
      });
    } catch (error) {
      console.error("Error in getJobsController:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch jobs",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getJobByIdController(req, res) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Valid Job ID is required"
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
        message: "Failed to fetch job",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async createJobController(req, res) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please authenticate first"
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
        status = "OPEN", // Default status
        open_till
      } = req.body;

      // Validation schema
      const requiredFields = {
        job_title: job_title?.trim(),
        job_description: job_description?.trim(),
        designation: designation?.trim(),
        location: location?.trim(),
        mode: mode?.trim(),
        experience: experience?.trim(),
        salary: salary?.trim(),
        vacancy: vacancy ? parseInt(vacancy) : undefined,
        joining_date,
        open_till
      };

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || (typeof value === 'number' && isNaN(value)))
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          missing_fields: missingFields
        });
      }

      // Validate status enum
      const validStatuses = ["OPEN", "CLOSED", "ON_HOLD"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: OPEN, CLOSED, ON_HOLD",
          valid_options: validStatuses
        });
      }

      // Validate dates
      const joiningDate = new Date(joining_date);
      const openTillDate = new Date(open_till);
      const currentDate = new Date();

      if (isNaN(joiningDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid joining date format. Use ISO 8601 format"
        });
      }

      if (isNaN(openTillDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid open till date format. Use ISO 8601 format"
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
        message: "Failed to create job",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updateJobController(req, res) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Valid Job ID is required"
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please authenticate first"
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
        const currentDate = new Date();
        if (isNaN(openTillDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid open till date format"
          });
        }
        if (openTillDate <= currentDate) {
          return res.status(400).json({
            success: false,
            message: "Open till date must be in the future"
          });
        }
      }

      if (status) {
        const validStatuses = ["OPEN", "CLOSED", "ON_HOLD"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status. Must be one of: OPEN, CLOSED, ON_HOLD",
            valid_options: validStatuses
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
        message: "Failed to update job",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async deleteJobController(req, res) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Valid Job ID is required"
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please authenticate first"
        });
      }

      const deletedJob = await jobsService.deleteJob(id, req.user.id);

      res.status(200).json({
        success: true,
        message: "Job deleted successfully",
        data: {
          id: deletedJob.id,
          message: "Job marked as deleted"
        }
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
        message: "Failed to delete job",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new JobsController();