const BASE_URL = import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import axios from "axios"
import LocalStorage from "../utils/localStorage"
import Auth from "./auth"

class Applications {
    constructor() {
        this.auth = new Auth()
    }

    // Apply for a job (Student only) - ENDPOINT IS CORRECT
    async applyForJob(jobId) {
        try {
            const response = await axios.post(`${BASE_URL}/apply/${jobId}`, {}, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 201) {
                console.log('Application submitted:', response.data)
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Apply for job error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to apply for job' 
            }
        }
    }

    // Get applications for a job (Alumni only) - ENDPOINT IS CORRECT
    async getJobApplications(jobId) {
        try {
            const response = await axios.get(`${BASE_URL}/apply/${jobId}`, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Get job applications error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to fetch applications' 
            }
        }
    }

    // Delete application (Student only) - ENDPOINT IS CORRECT
    async deleteApplication(jobId) {
        try {
            const response = await axios.delete(`${BASE_URL}/apply/${jobId}`, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Delete application error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to delete application' 
            }
        }
    }

    // Get my applications (Student only) - REMOVED THIS ENDPOINT (doesn't exist)
    async getMyApplications() {
        // This endpoint doesn't exist in your backend
        return { success: false, error: 'Endpoint not available' }
    }

    // Check if already applied to a job - SIMPLIFIED
    async checkApplicationStatus(jobId) {
        // Since we don't have a "my applications" endpoint, we can't check this easily
        return { success: false, applied: false }
    }
}

export default Applications