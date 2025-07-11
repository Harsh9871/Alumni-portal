const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class JobsService {
  async getJobs({ filter = {} }) {
    try {
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
        open_till,
        user_id
      } = filter;

      // Build where clause dynamically, only including non-empty filters
      const whereClause = {
        is_deleted: false, // Always exclude deleted jobs
      };

      if (job_title) {
        whereClause.job_title = {
          contains: job_title,
          mode: 'insensitive'
        };
      }

      if (job_description) {
        whereClause.job_description = {
          contains: job_description,
          mode: 'insensitive'
        };
      }

      if (designation) {
        whereClause.designation = {
          contains: designation,
          mode: 'insensitive'
        };
      }

      if (location) {
        whereClause.location = {
          contains: location,
          mode: 'insensitive'
        };
      }

      if (mode) {
        whereClause.mode = {
          contains: mode,
          mode: 'insensitive'
        };
      }

      if (experience) {
        whereClause.experience = {
          contains: experience,
          mode: 'insensitive'
        };
      }

      if (salary) {
        whereClause.salary = {
          contains: salary,
          mode: 'insensitive'
        };
      }

      if (vacancy) {
        whereClause.vacancy = parseInt(vacancy);
      }

      if (joining_date) {
        whereClause.joining_date = new Date(joining_date);
      }

      if (status) {
        whereClause.status = status;
      }

      if (open_till) {
        whereClause.open_till = {
          gte: new Date(open_till)
        };
      }

      if (user_id) {
        whereClause.user_id = user_id;
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          user: {
            include: {
              alumni: {
                select: {
                  full_name: true,
                  email_address: true,
                  mobile_number: true,
                  passing_batch: true
                }
              }
            }
          }
        },
        orderBy: {
          joining_date: 'desc'
        }
      });

      return jobs;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  }

  async getJobById(id) {
    try {
      const job = await prisma.job.findUnique({
        where: {
          id,
          is_deleted: false
        },
        include: {
          user: {
            include: {
              alumni: {
                select: {
                  full_name: true,
                  email_address: true,
                  mobile_number: true,
                  passing_batch: true,
                  bio: true
                }
              }
            }
          },
          applications: {
            include: {
              user: {
                include: {
                  student: {
                    select: {
                      full_name: true,
                      email_address: true,
                      mobile_number: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!job) {
        throw new Error("Job not found");
      }

      return job;
    } catch (error) {
      console.error("Error fetching job by ID:", error);
      throw error;
    }
  }

  async createJob(jobData) {
    try {
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
        open_till,
        user_id
      } = jobData;

      // Validate required fields
      if (!job_title || !job_description || !designation || !location || !mode || !experience || !salary || !vacancy || !joining_date || !status || !open_till || !user_id) {
        throw new Error("All fields are required");
      }

      // Validate that user exists and is an alumni
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        include: { alumni: true }
      });

      if (!user || user.is_deleted) {
        throw new Error("User not found or deactivated");
      }

      if (user.role !== "ALUMNI") {
        throw new Error("Only alumni can create jobs");
      }

      if (!user.alumni) {
        throw new Error("Alumni details not found");
      }

      const newJob = await prisma.job.create({
        data: {
          job_title,
          job_description,
          designation,
          location,
          mode,
          experience,
          salary,
          vacancy: parseInt(vacancy),
          joining_date: new Date(joining_date),
          status,
          open_till: new Date(open_till),
          user_id
        },
        include: {
          user: {
            include: {
              alumni: {
                select: {
                  full_name: true,
                  email_address: true,
                  mobile_number: true,
                  passing_batch: true
                }
              }
            }
          }
        }
      });

      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  }

  async updateJob(id, jobData, userId) {
    try {
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
      } = jobData;

      // Check if job exists and user owns it
      const existingJob = await prisma.job.findUnique({
        where: { id, is_deleted: false }
      });

      if (!existingJob) {
        throw new Error("Job not found");
      }

      if (existingJob.user_id !== userId) {
        throw new Error("Unauthorized: You can only update your own jobs");
      }

      // Build update data object, only including provided fields
      const updateData = {};
      
      if (job_title !== undefined) updateData.job_title = job_title;
      if (job_description !== undefined) updateData.job_description = job_description;
      if (designation !== undefined) updateData.designation = designation;
      if (location !== undefined) updateData.location = location;
      if (mode !== undefined) updateData.mode = mode;
      if (experience !== undefined) updateData.experience = experience;
      if (salary !== undefined) updateData.salary = salary;
      if (vacancy !== undefined) updateData.vacancy = parseInt(vacancy);
      if (joining_date !== undefined) updateData.joining_date = new Date(joining_date);
      if (status !== undefined) updateData.status = status;
      if (open_till !== undefined) updateData.open_till = new Date(open_till);

      const updatedJob = await prisma.job.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            include: {
              alumni: {
                select: {
                  full_name: true,
                  email_address: true,
                  mobile_number: true,
                  passing_batch: true
                }
              }
            }
          }
        }
      });

      return updatedJob;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  }

  async deleteJob(id, userId) {
    try {
      // Check if job exists and user owns it
      const existingJob = await prisma.job.findUnique({
        where: { id, is_deleted: false }
      });

      if (!existingJob) {
        throw new Error("Job not found");
      }

      if (existingJob.user_id !== userId) {
        throw new Error("Unauthorized: You can only delete your own jobs");
      }

      const deletedJob = await prisma.job.update({
        where: { id },
        data: { is_deleted: true }
      });

      return deletedJob;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  }
}

module.exports = new JobsService();