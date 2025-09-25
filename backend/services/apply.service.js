// services/apply.service.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ApplyService {
  async getApplyService(jobId) {
    try {
      if (!jobId || typeof jobId !== 'string') {
        throw new Error("Invalid job ID");
      }

      const applications = await prisma.jobApplied.findMany({
        where: { job_id: jobId },
        select: {
          id: true,
          applied_at: true,
          user: {
            select: {
              id: true,
              user_id: true,
              role: true,
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
              },
              alumni: {
                select: {
                  id: true,
                  full_name: true,
                  email_address: true,
                  mobile_number: true,
                  passing_batch: true
                }
              }
            }
          },
          job: {
            select: {
              id: true,
              job_title: true,
              designation: true,
              location: true,
              salary: true,
              status: true
            }
          }
        },
        orderBy: { applied_at: 'desc' }
      });

      return {
        success: true,
        data: applications,
        message: "Applications retrieved successfully"
      };
    } catch (error) {
      console.error("Error in getApplyService:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve applications"
      };
    } finally {
      await prisma.$disconnect().catch(console.error);
    }
  }

  async applyForJobService(studentId, jobId) {
    try {
      if (!studentId || !jobId) {
        throw new Error("Invalid student or job ID");
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId, is_deleted: false }
      });

      if (!job) {
        return {
          success: false,
          message: "Job not found or has been deleted"
        };
      }

      if (job.status !== 'OPEN') {
        return {
          success: false,
          message: "Job is not currently open for applications"
        };
      }

      if (new Date() > job.open_till) {
        return {
          success: false,
          message: "Application deadline has passed"
        };
      }

      const existingApplication = await prisma.jobApplied.findFirst({
        where: { user_id: studentId, job_id: jobId }
      });

      if (existingApplication) {
        return {
          success: false,
          message: "You have already applied for this job"
        };
      }

      const newApplication = await prisma.jobApplied.create({
        data: {
          user_id: studentId,
          job_id: jobId,
          applied_at: new Date()
        },
        select: {
          id: true,
          applied_at: true,
          job: {
            select: {
              id: true,
              job_title: true,
              designation: true,
              location: true,
              salary: true
            }
          },
          user: {
            select: {
              id: true,
              user_id: true,
              role: true,
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
        }
      });

      return {
        success: true,
        data: newApplication,
        message: "Application submitted successfully"
      };
    } catch (error) {
      console.error("Error in applyForJobService:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to submit application"
      };
    } finally {
      await prisma.$disconnect().catch(console.error);
    }
  }

  async deleteApplyService(studentId, jobId) {
    try {
      if (!studentId || !jobId) {
        throw new Error("Invalid student or job ID");
      }

      const application = await prisma.jobApplied.findFirst({
        where: { user_id: studentId, job_id: jobId }
      });

      if (!application) {
        return {
          success: false,
          message: "Application not found"
        };
      }

      await prisma.jobApplied.delete({
        where: { id: application.id }
      });

      return {
        success: true,
        message: "Application deleted successfully"
      };
    } catch (error) {
      console.error("Error in deleteApplyService:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete application"
      };
    } finally {
      await prisma.$disconnect().catch(console.error);
    }
  }
}

module.exports = new ApplyService();