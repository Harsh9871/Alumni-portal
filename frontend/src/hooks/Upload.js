const BASE_URL = import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import axios from "axios"
import Auth from "./Auth"

class Upload {
    constructor() {
        this.auth = new Auth()
    }

    // Upload file (profile picture, resume, certificate)
    async uploadFile(file, type = 'profile') {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)

            const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
                headers: {
                    ...this.auth.getAuthHeaders(),
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            if (response.status === 200) {
                console.log('File uploaded:', response.data)
                return { success: true, data: response.data }
            }
            return { success: false, error: response.data.message }
        } catch (error) {
            console.error('Upload file error:', error)
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to upload file' 
            }
        }
    }

    // Upload profile picture
    async uploadProfilePicture(file) {
        return this.uploadFile(file, 'profile')
    }

    // Upload resume (for students)
    async uploadResume(file) {
        return this.uploadFile(file, 'resume')
    }

    // Upload degree certificate (for alumni)
    async uploadCertificate(file) {
        return this.uploadFile(file, 'certificate')
    }

    // Validate file type and size
    validateFile(file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'], maxSizeMB = 5) {
        const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes
        
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` }
        }
        
        if (file.size > maxSize) {
            return { valid: false, error: `File too large. Maximum size: ${maxSizeMB}MB` }
        }
        
        return { valid: true }
    }
}

export default Upload