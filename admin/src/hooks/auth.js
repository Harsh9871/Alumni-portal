const BASE_URL = "https://alumni-project-backend.onrender.com/"
import axios from "axios"
import LocalStorage from "../utils/localStorage"

class Auth{
    async login(email, password){
        try {
            const response = await axios.post(`${BASE_URL}/auth/admin/login`, { email, password })
            if(response.status === 200){
                // Store the JWT token instead of credentials
                console.log(response.data)
                LocalStorage.setItem("token", response.data.token)
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error);
            return false
        }
    }

    async registerStudent(user_id, password , role){
        try {
            const token = LocalStorage.getItem("token")
            const response = await axios.post(`${BASE_URL}/auth/register`, 
                { user_id, password , role },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )
            if(response.status === 200 || response.status === 201){
                return true
            }
            return false
        } catch (error) {
            console.error('Register error:', error);
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