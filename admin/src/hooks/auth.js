const BASE_URL = "http://localhost:5000"
import axios from "axios"
import LocalStorage from "../utils/localStorage"
class Auth{
    async login(email, password){
        const response = await axios.post(`${BASE_URL}/auth/admin/login`, { email, password })
        if(response.status === 200){
            LocalStorage.setItem("email", email)
            LocalStorage.setItem("password", password)
            return true
        }
        return false
    }
    async registerStudent(user_id, password , role){
        const response = await axios.post(`${BASE_URL}/auth/register`, { user_id, password , role })
        if(response.status === 200 || response.status === 201){
            return true
        }
        return false
    }
}

export default Auth
