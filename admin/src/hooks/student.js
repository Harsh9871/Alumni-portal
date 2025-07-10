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
                admin_email: email,
                admin_password: adminPassword
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
            
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const params = { 
                page, 
                limit, 
                admin_email: email, 
                admin_password: password
            };

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
            
            const response = await axios.get(`${BASE_URL}/user/all`, { params });
            
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
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.get(`${BASE_URL}/user/${id}`, {
                params: { 
                    admin_email: email, 
                    admin_password: password
                }
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
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.put(`${BASE_URL}/user/${id}`, {
                ...updateData,
                admin_email: email,
                admin_password: password
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
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.delete(`${BASE_URL}/user/${id}`, {
                data: {
                    admin_email: email,
                    admin_password: password
                }
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
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.post(`${BASE_URL}/user/bulk-delete`, {
                ids,
                admin_email: email,
                admin_password: password
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
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.get(`${BASE_URL}/user/export`, {
                params: {
                    format,
                    admin_email: email,
                    admin_password: password
                },
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
            const email = LocalStorage.getItem("email");
            const password = LocalStorage.getItem("password");
            
            const response = await axios.get(`${BASE_URL}/user/stats`, {
                params: {
                    admin_email: email,
                    admin_password: password
                }
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