const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ApplyService {
    async getApplyService(jobId) {
        try {
            // Get all applications for a specific job
            const applications = await prisma.jobApplied.findMany({
                where: {
                    job_id: jobId
                },
                include: {
                    user: {
                        include: {
                            student: true
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
                orderBy: {
                    applied_at: 'desc'
                }
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
        }
    }
    
    async applyForJobService(studentId, jobId) {
        try {
            // Check if job exists and is open
            const job = await prisma.job.findUnique({
                where: {
                    id: jobId,
                    is_deleted: false
                }
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

            // Check if application deadline has passed
            if (new Date() > job.open_till) {
                return {
                    success: false,
                    message: "Application deadline has passed"
                };
            }

            // Check if student has already applied
            const existingApplication = await prisma.jobApplied.findFirst({
                where: {
                    user_id: studentId,
                    job_id: jobId
                }
            });

            if (existingApplication) {
                return {
                    success: false,
                    message: "You have already applied for this job"
                };
            }

            // Create new application
            const newApplication = await prisma.jobApplied.create({
                data: {
                    user_id: studentId,
                    job_id: jobId,
                    applied_at: new Date()
                },
                include: {
                    job: {
                        select: {
                            id: true,
                            job_title: true,
                            designation: true,
                            location: true,
                            salary: true
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
        }
    }
    
    async deleteApplyService(studentId, jobId) {
        try {
            // Check if application exists
            const application = await prisma.jobApplied.findFirst({
                where: {
                    user_id: studentId,
                    job_id: jobId
                }
            });

            if (!application) {
                return {
                    success: false,
                    message: "Application not found"
                };
            }

            // Delete the application
            await prisma.jobApplied.delete({
                where: {
                    id: application.id
                }
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
        }
    }   
}

module.exports = new ApplyService();