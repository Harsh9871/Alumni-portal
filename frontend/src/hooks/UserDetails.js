const BASE_URL = import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import axios from "axios"
import LocalStorage from "../utils/localStorage"
import Auth from "./auth"

class UserDetails {
    constructor() {
        this.auth = new Auth()
    }

    // Smart profile creation that tries update if create fails
    async createStudentProfile(profileData) {
        try {
            // Remove user_id from data since backend gets it from token
            const { user_id, ...cleanData } = profileData;
            
            // First try to create
            const createResponse = await axios.post(`${BASE_URL}/user`, cleanData, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (createResponse.status === 201 || createResponse.status === 200) {
                console.log('Student profile created:', createResponse.data)
                return { success: true, data: createResponse.data }
            }
            return { success: false, error: createResponse.data.message }
        } catch (error) {
            console.error('Create student profile error:', error)
            
            // If create fails with "already exists" error, try update instead
            if (error.response?.status === 400 && 
                (error.response.data.error?.includes('Unique constraint') || 
                 error.response.data.error?.includes('already exists'))) {
                
                console.log('Profile already exists, trying update...')
                return await this.updateStudentProfile(profileData)
            }
            
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create student profile'
            return { 
                success: false, 
                error: errorMessage
            }
        }
    }

    // Smart alumni profile creation
    async createAlumniProfile(profileData) {
        try {
            // Remove user_id from data since backend gets it from token
            const { user_id, ...cleanData } = profileData;
            
            // First try to create
            const createResponse = await axios.post(`${BASE_URL}/user`, cleanData, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (createResponse.status === 201 || createResponse.status === 200) {
                console.log('Alumni profile created:', createResponse.data)
                return { success: true, data: createResponse.data }
            }
            return { success: false, error: createResponse.data.message }
        } catch (error) {
            console.error('Create alumni profile error:', error)
            
            // If create fails with "already exists" error, try update instead
            if (error.response?.status === 400 && 
                (error.response.data.error?.includes('Unique constraint') || 
                 error.response.data.error?.includes('already exists'))) {
                
                console.log('Profile already exists, trying update...')
                return await this.updateAlumniProfile(profileData)
            }
            
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create alumni profile'
            return { 
                success: false, 
                error: errorMessage
            }
        }
    }

    // Update Student Profile
    async updateStudentProfile(profileData) {
        try {
            const { user_id, ...cleanData } = profileData;
            
            const response = await axios.put(`${BASE_URL}/user`, cleanData, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Update student profile error:', error)
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update student profile'
            return { 
                success: false, 
                error: errorMessage
            }
        }
    }

    // Update Alumni Profile
    async updateAlumniProfile(profileData) {
        try {
            const { user_id, ...cleanData } = profileData;
            
            const response = await axios.put(`${BASE_URL}/user`, cleanData, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Update alumni profile error:', error)
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update alumni profile'
            return { 
                success: false, 
                error: errorMessage
            }
        }
    }

    // Get User Profile
    async getUserProfile() {
        try {
            const currentUser = this.auth.getCurrentUser()
            if (!currentUser || !currentUser.id) {
                return { success: false, error: 'No user logged in' }
            }

            const response = await axios.get(`${BASE_URL}/user/${currentUser.id}`, {
                headers: this.auth.getAuthHeaders()
            })
            
            if (response.status === 200) {
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Get profile error:', error)
            // Don't throw error for 404 - just return no profile
            if (error.response?.status === 404) {
                return { success: false, error: 'Profile not found' }
            }
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to fetch profile' 
            }
        }
    }

    // Check if user has profile
    async checkProfileExists() {
        try {
            const result = await this.getUserProfile()
            return result.success
        } catch (error) {
            return false
        }
    }
}

export default UserDetails