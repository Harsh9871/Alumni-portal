const BASE_URL = import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import axios from "axios"
import LocalStorage from "../utils/localStorage"
import UserDetails from "./UserDetails"

class Auth {
    async login(user_id, password) {
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, { user_id, password })
            if (response.status === 200) {
                // Store the JWT token and user data
                console.log(response.data)
                LocalStorage.setItem("token", response.data.token)
                LocalStorage.setItem("user_id", response.data.user.user_id)
                LocalStorage.setItem("role", response.data.user.role)
                LocalStorage.setItem("user_data", response.data.user)
                
                // Check if user has profile
                const userDetails = new UserDetails()
                const hasProfile = await userDetails.checkProfileExists()
                LocalStorage.setItem("has_profile", hasProfile)
                
                return { 
                    success: true, 
                    hasProfile: hasProfile,
                    user: response.data.user 
                }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Login error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            }
        }
    }

    // Method to get auth headers for API calls
    getAuthHeaders() {
        const token = LocalStorage.getItem("token")
        return token ? { 'Authorization': `Bearer ${token}` } : {}
    }

    // Method to check if user is authenticated
    isAuthenticated() {
        return !!LocalStorage.getItem("token")
    }

    // Method to check if user has profile
    hasProfile() {
        return LocalStorage.getItem("has_profile") === true
    }

    // Method to get current user role
    getCurrentUserRole() {
        return LocalStorage.getItem("role")
    }

    // Method to get current user data
    getCurrentUser() {
        return LocalStorage.getItem("user_data")
    }

    // Method to logout
    logout() {
        LocalStorage.removeItem("token")
        LocalStorage.removeItem("user_id")
        LocalStorage.removeItem("role")
        LocalStorage.removeItem("user_data")
        LocalStorage.removeItem("has_profile")
    }

    // Update profile status after profile creation
    updateProfileStatus(hasProfile) {
        LocalStorage.setItem("has_profile", hasProfile)
    }
}

export default Auth