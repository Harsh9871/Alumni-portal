const BASE_URL = "https://alumni-project-backend.onrender.com/"
import axios from "axios"
import LocalStorage from "../utils/localStorage"

class Student {
    // Helper method to get auth headers
    getAuthHeaders() {
        const token = LocalStorage.getItem("token")
        return token ? { 'Authorization': `Bearer ${token}` } : {}
    }

    async signup(user_id, password, role) {
        try {
            const response = await axios.post(`${BASE_URL}/auth/signup`, {
                user_id,
                password,
                role
            }, {
                headers: this.getAuthHeaders()
            });
            
            if (response.status === 201) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error signing up user:', error);
            throw error;
        }
    }

    async getAllStudents(filter = {}) {
        try {
            const page = filter.page || 1;
            const limit = filter.limit || 10;
            const role = filter.role || '';
            const search = filter.search || '';
            const gender = filter.gender || '';
            
            const params = { page, limit };

            // Add optional filters
            if (role && role !== 'ALL') {
                params.role = role.toLowerCase();
            }
            if (search) {
                params.search = search;
            }
            if (gender && gender !== 'ALL') {
                params.gender = gender;
            }
            
            const response = await axios.get(`${BASE_URL}/user/all`, { 
                params,
                headers: this.getAuthHeaders()
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    }

    async getStudentById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/user/${id}`, {
                headers: this.getAuthHeaders()
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching student:', error);
            throw error;
        }
    }

    async updateStudent(id, updateData) {
        try {
            const response = await axios.put(`${BASE_URL}/user/${id}`, updateData, {
                headers: this.getAuthHeaders()
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    }

    async deleteStudent(id) {
        try {
            const response = await axios.delete(`${BASE_URL}/user/${id}`, {
                headers: this.getAuthHeaders()
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }

    async login(user_id, password) {
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                user_id,
                password
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    }

    async bulkDelete(ids) {
        try {
            const response = await axios.post(`${BASE_URL}/user/bulk-delete`, {
                ids
            }, {
                headers: this.getAuthHeaders()
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error bulk deleting students:', error);
            throw error;
        }
    }

    async exportStudents(format = 'csv') {
        try {
            const response = await axios.get(`${BASE_URL}/user/export`, {
                params: { format },
                headers: this.getAuthHeaders(),
                responseType: 'blob'
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error exporting students:', error);
            throw error;
        }
    }

    async getStudentStats() {
        try {
            const response = await axios.get(`${BASE_URL}/user/stats`, {
                headers: this.getAuthHeaders()
            });
            
            if (response.status === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching student stats:', error);
            throw error;
        }
    }
}

export default Student;