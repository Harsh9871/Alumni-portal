const BASE_URL =import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import axios from "axios"
import LocalStorage from "../utils/localStorage"

class Auth{
    async login(user_id, password){
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, { user_id, password })
            if(response.status === 200){
                // Store the JWT token instead of credentials
                console.log(response.data)
                LocalStorage.setItem("token", response.data.token)
                LocalStorage.setItem("user_id", response.data.user.user_id)
                LocalStorage.setItem("role", response.data.user.role)
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error);
            return false
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

    // Method to logout
    logout() {
        LocalStorage.removeItem("token")
        LocalStorage.removeItem("email")
    }
}

export default Auth