const BASE_URL = import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import axios from "axios"
import Auth from "./auth"

class Jobs {
    constructor() {
        this.auth = new Auth()
    }

    // Get all jobs with optional filters
    async getJobs(filters = {}) {
        try {
            const params = new URLSearchParams()
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== '') {
                    params.append(key, filters[key])
                }
            })

            const response = await axios.get(`${BASE_URL}/jobs?${params}`, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Get jobs error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to fetch jobs' 
            }
        }
    }

    // Get job by ID
    async getJobById(jobId) {
        try {
            const response = await axios.get(`${BASE_URL}/jobs/${jobId}`, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Get job by ID error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to fetch job details' 
            }
        }
    }

    // Create new job (Alumni only)
    async createJob(jobData) {
        try {
            const response = await axios.post(`${BASE_URL}/jobs`, jobData, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 201) {
                console.log('Job created:', response.data)
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Create job error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to create job' 
            }
        }
    }

    // Update job (Job owner only)
    async updateJob(jobId, jobData) {
        try {
            const response = await axios.put(`${BASE_URL}/jobs/${jobId}`, jobData, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Update job error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to update job' 
            }
        }
    }

    // Delete job (Job owner only)
    async deleteJob(jobId) {
        try {
            const response = await axios.delete(`${BASE_URL}/jobs/${jobId}`, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Delete job error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to delete job' 
            }
        }
    }

    // Get jobs created by current alumni
    async getMyJobs() {
        try {
            const response = await axios.get(`${BASE_URL}/jobs/my`, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Get my jobs error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to fetch your jobs' 
            }
        }
    }
}

export default Jobs