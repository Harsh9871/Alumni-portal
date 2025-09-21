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
        user_id,
        page = 1,
        limit = 10,
        sortBy = 'joining_date',
        sortOrder = 'desc'
      } = filter;

      // Build where clause dynamically
      const whereClause = {
        is_deleted: false, // Always exclude deleted jobs
        ...(status && { status }),
        ...(user_id && { user_id })
      };

      // Text search filters
      const searchFilters = {
        job_title: job_title?.trim(),
        job_description: job_description?.trim(),
        designation: designation?.trim(),
        location: location?.trim(),
        mode: mode?.trim(),
        experience: experience?.trim(),
        salary: salary?.trim()
      };

      // Add text search conditions
      Object.entries(searchFilters).forEach(([field, value]) => {
        if (value) {
          whereClause[field] = {
            contains: value,
            mode: 'insensitive'
          };
        }
      });

      // Numeric filter for vacancy
      if (vacancy) {
        whereClause.vacancy = {
          equals: parseInt(vacancy)
        };
      }

      // Date filters
      if (joining_date) {
        whereClause.joining_date = {
          gte: new Date(joining_date)
        };
      }

      if (open_till) {
        whereClause.open_till = {
          gte: new Date(open_till)
        };
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [jobs, totalCount] = await Promise.all([
        prisma.job.findMany({
          where: whereClause,
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
              },
              select: {
                id: true,
                role: true
              }
            },
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limitNum
        }),
        prisma.job.count({ where: whereClause })
      ]);

      return {
        jobs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPrevPage: pageNum > 1
        },
        filters: Object.keys(filter).reduce((acc, key) => {
          if (filter[key] && filter[key] !== '1' && filter[key] !== '10') {
            acc[key] = filter[key];
          }
          return acc;
        }, {})
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }

  async getJobById(id) {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error("Invalid job ID");
      }
  
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
                  id: true,
                  full_name: true,
                  email_address: true,
                  mobile_number: true,
                  passing_batch: true,
                  bio: true,
                  profile_picture_url: true
                }
              }
            }
          },
          applications: {
            where: {
              user: {
                is_deleted: false
              }
            },
            include: {
              user: {
                select: {
                  id: true,
                  role: true,
                  is_deleted: true,
                  student: {
                    select: {
                      id: true,
                      full_name: true,
                      email_address: true,
                      mobile_number: true,
                      profile_picture_url: true,
                      github: true,
                      linked_in: true
                    }
                  }
                }
              }
            },
            orderBy: {
              applied_at: 'desc'
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
      if (!job_title?.trim() || !job_description?.trim() || !designation?.trim() || 
          !location?.trim() || !mode?.trim() || !experience?.trim() || !salary?.trim() || 
          !vacancy || !joining_date || !status || !open_till || !user_id) {
        throw new Error("All job fields are required");
      }

      // Validate that user exists and is an alumni
      const user = await prisma.user.findUnique({
        where: { 
          id: user_id,
          is_deleted: false
        },
        include: { 
          alumni: true 
        }
      });

      if (!user) {
        throw new Error("User not found or deactivated");
      }

      if (user.role !== "ALUMNI") {
        throw new Error("Only alumni can create jobs");
      }

      if (!user.alumni) {
        throw new Error("Alumni details not found for user");
      }

      const newJob = await prisma.job.create({
        data: {
          job_title: job_title.trim(),
          job_description: job_description.trim(),
          designation: designation.trim(),
          location: location.trim(),
          mode: mode.trim(),
          experience: experience.trim(),
          salary: salary.trim(),
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
                  passing_batch: true,
                  profile_picture_url: true
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
      if (!id || typeof id !== 'string') {
        throw new Error("Invalid job ID");
      }

      // Check if job exists and user owns it
      const existingJob = await prisma.job.findFirst({
        where: { 
          id, 
          is_deleted: false,
          user_id: userId
        }
      });

      if (!existingJob) {
        throw new Error("Job not found or unauthorized");
      }

      // Build update data object, only including provided fields
      const updateData = {};
      
      const updatableFields = [
        'job_title', 'job_description', 'designation', 'location', 
        'mode', 'experience', 'salary', 'vacancy', 'joining_date', 
        'status', 'open_till'
      ];

      updatableFields.forEach(field => {
        if (jobData[field] !== undefined) {
          if (['job_title', 'job_description', 'designation', 'location', 'mode', 'experience', 'salary']
              .includes(field)) {
            updateData[field] = jobData[field].trim();
          } else if (field === 'vacancy') {
            updateData[field] = parseInt(jobData[field]);
          } else if (['joining_date', 'open_till'].includes(field)) {
            updateData[field] = new Date(jobData[field]);
          } else {
            updateData[field] = jobData[field];
          }
        }
      });

      // Validate updated dates
      if (updateData.joining_date) {
        const currentDate = new Date();
        if (updateData.joining_date <= currentDate) {
          throw new Error("Joining date must be in the future");
        }
      }

      if (updateData.open_till) {
        const currentDate = new Date();
        if (updateData.open_till <= currentDate) {
          throw new Error("Open till date must be in the future");
        }
      }

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
                  passing_batch: true,
                  profile_picture_url: true
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
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
      if (!id || typeof id !== 'string') {
        throw new Error("Invalid job ID");
      }

      // Check if job exists and user owns it
      const existingJob = await prisma.job.findFirst({
        where: { 
          id, 
          is_deleted: false,
          user_id: userId
        }
      });

      if (!existingJob) {
        throw new Error("Job not found or unauthorized");
      }

      const deletedJob = await prisma.job.update({
        where: { id },
        data: { 
          is_deleted: true,
          job_description: `DELETED_JOB_${id}` // Mark as deleted
        },
        select: {
          id: true,
          job_title: true
        }
      });

      return deletedJob;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  }
}

module.exports = new JobsService();