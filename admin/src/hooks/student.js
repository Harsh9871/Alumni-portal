const BASE_URL = "http://localhost:5000"
import axios from "axios"
import LocalStorage from "../utils/localStorage"

class Student {
    async signup(user_id, password, role) {
        try {
            const email = LocalStorage.getItem("email");
            const adminPassword = LocalStorage.getItem("password");
            
            const response = await axios.post(`${BASE_URL}/auth/signup`, {
                user_id,
                password,
                role,
                admin_email:email,
                password: adminPassword
            });
            
            if (response.status === 201) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error signing up user:', error);
            return null;
        }
    }

    async getAllStudents(filter = {}) {
        try {
            const page = filter.page || 1;
            const limit = filter.limit || 10;
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.get(`${BASE_URL}/user/all`, { 
                page, limit , admin_email:email, admin_password:password,role:"student" }
            );
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching students:', error);
            return null;
        }
    }

    async getStudentById(id) {
        try {
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.get(`${BASE_URL}/user/${id}`, {
                data: { admin_email:email, admin_password:password,role:"student" }
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching student:', error);
            return null;
        }
    }
}

export default Student;