const BASE_URL = import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import Auth from "../hooks/auth"
import UserDetails from "../hooks/UserDetails"
import Jobs from "../hooks/Jobs"
import Applications from "../hooks/Applications"

class TestFlowDebug {
    constructor() {
        this.auth = new Auth()
        this.userDetails = new UserDetails()
        this.jobs = new Jobs()
        this.applications = new Applications()
    }

    async runDebugTests() {
        console.log('🔍 DEBUG MODE: Testing Individual Endpoints\n')
        
        // Test 1: Check if student profile endpoint exists
        await this.debugStudentProfileEndpoint()
        
        // Test 2: Check apply endpoint structure
        await this.debugApplyEndpoint()
        
        // Test 3: Debug job search
        await this.debugJobSearch()
        
        // Test 4: Test student profile with minimal data
        await this.debugStudentProfileMinimal()
    }

    async debugStudentProfileEndpoint() {
        console.log('🔍 DEBUG 1: Student Profile Endpoint')
        console.log('   Testing POST /user with student data...')
        
        // First login as student
        this.auth.logout()
        const loginResult = await this.auth.login('student1', 'student1234')
        
        if (!loginResult.success) {
            console.log('❌ Cannot login as student')
            return
        }

        // Try minimal student data
        const minimalStudentData = {
            full_name: "Debug Student",
            mobile_number: "+91-9000000000",
            email_address: "debug.student@test.com",
            gender: "Male",
            dob: "2000-01-01T00:00:00.000Z"
        }

        try {
            const response = await fetch(`${BASE_URL}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getAuthHeaders().Authorization}`
                },
                body: JSON.stringify(minimalStudentData)
            })
            
            console.log('   Response Status:', response.status)
            console.log('   Response Headers:', Object.fromEntries(response.headers.entries()))
            
            const text = await response.text()
            console.log('   Response Body:', text)
            
            if (response.status === 400) {
                console.log('❌ 400 Bad Request - Check the exact error message above')
            }
            
        } catch (error) {
            console.log('❌ Fetch error:', error)
        }
        console.log('')
    }

    async debugApplyEndpoint() {
        console.log('🔍 DEBUG 2: Apply Endpoint Structure')
        
        // First get a job ID to test with
        this.auth.logout()
        await this.auth.login('alumni', 'alumni1234')
        
        const jobsResult = await this.jobs.getJobs()
        let testJobId = null
        
        if (jobsResult.success && jobsResult.data.data.jobs && jobsResult.data.data.jobs.length > 0) {
            testJobId = jobsResult.data.data.jobs[0].id
            console.log('   Using job ID:', testJobId)
        } else {
            // Create a test job
            const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            const jobData = {
                job_title: "Debug Test Job",
                job_description: "Job for debugging applications",
                designation: "Debug Developer",
                location: "Debug City",
                mode: "Remote",
                experience: "0-1 years",
                salary: "₹1-2 LPA",
                vacancy: 1,
                joining_date: futureDate,
                status: "OPEN",
                open_till: futureDate
            }
            
            const createResult = await this.jobs.createJob(jobData)
            if (createResult.success) {
                testJobId = createResult.data.data.id
                console.log('   Created test job ID:', testJobId)
            }
        }

        if (!testJobId) {
            console.log('❌ No job available for testing')
            return
        }

        // Test apply endpoint
        this.auth.logout()
        await this.auth.login('student1', 'student1234')
        
        console.log('   Testing POST /apply/' + testJobId)
        
        try {
            const response = await fetch(`${BASE_URL}/apply/${testJobId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getAuthHeaders().Authorization}`
                },
                body: JSON.stringify({})
            })
            
            console.log('   Response Status:', response.status)
            const text = await response.text()
            console.log('   Response Body:', text)
            
        } catch (error) {
            console.log('❌ Fetch error:', error)
        }
        console.log('')
    }

    async debugJobSearch() {
        console.log('🔍 DEBUG 3: Job Search Endpoint')
        
        this.auth.logout()
        await this.auth.login('alumni', 'alumni1234')
        
        console.log('   Testing GET /jobs')
        
        try {
            const response = await fetch(`${BASE_URL}/jobs`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.auth.getAuthHeaders().Authorization}`
                }
            })
            
            console.log('   Response Status:', response.status)
            console.log('   Response Headers:', Object.fromEntries(response.headers.entries()))
            
            const text = await response.text()
            console.log('   Response Body (first 500 chars):', text.substring(0, 500))
            
            if (response.status === 500) {
                console.log('❌ 500 Internal Server Error - Check backend logs')
            }
            
        } catch (error) {
            console.log('❌ Fetch error:', error)
        }
        console.log('')
    }

    async debugStudentProfileMinimal() {
        console.log('🔍 DEBUG 4: Student Profile - Minimal Data Test')
        
        this.auth.logout()
        await this.auth.login('student1', 'student1234')
        
        // Test different data combinations
        const testCases = [
            {
                name: "Only required fields",
                data: {
                    full_name: "Test Student",
                    mobile_number: "+91-9111111111",
                    email_address: "test1@student.com",
                    gender: "Male",
                    dob: "2000-01-01T00:00:00.000Z"
                }
            },
            {
                name: "With bio",
                data: {
                    full_name: "Test Student",
                    mobile_number: "+91-9111111112",
                    email_address: "test2@student.com",
                    gender: "Female",
                    dob: "2000-01-01T00:00:00.000Z",
                    bio: "Test bio"
                }
            },
            {
                name: "Complete data",
                data: {
                    full_name: "Complete Test Student",
                    bio: "Computer Science Student",
                    mobile_number: "+91-9111111113",
                    gender: "Male",
                    email_address: "complete@student.com",
                    linked_in: "https://linkedin.com/in/test",
                    github: "https://github.com/test",
                    about_us: "Testing",
                    dob: "2000-01-01T00:00:00.000Z",
                    profile_picture_url: "https://example.com/photo.jpg",
                    resume: "https://example.com/resume.pdf"
                }
            }
        ];

        for (const testCase of testCases) {
            console.log(`   Testing: ${testCase.name}`)
            
            try {
                const response = await fetch(`${BASE_URL}/user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.auth.getAuthHeaders().Authorization}`
                    },
                    body: JSON.stringify(testCase.data)
                })
                
                console.log(`   Status: ${response.status}`)
                const text = await response.text()
                console.log(`   Response: ${text}`)
                
                if (response.status === 201 || response.status === 200) {
                    console.log('✅ SUCCESS with this data format!')
                    break
                }
                
            } catch (error) {
                console.log('❌ Error:', error)
            }
            console.log('   ---')
        }
        console.log('')
    }
}

export default TestFlowDebug    