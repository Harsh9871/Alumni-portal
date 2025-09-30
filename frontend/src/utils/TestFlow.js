const BASE_URL = import.meta.env.VITE_BASE_URL || "https://alumni-project-backend.onrender.com"
import Auth from "../hooks/auth"
import UserDetails from "../hooks/UserDetails"
import Jobs from "../hooks/Jobs"
import Applications from "../hooks/Applications"

class TestFlow {
    constructor() {
        this.auth = new Auth()
        this.userDetails = new UserDetails()
        this.jobs = new Jobs()
        this.applications = new Applications()
        this.testResults = []
        this.createdJobIds = []
    }

    async runAllTests() {
        console.log('🚀 Starting Complete Flow Test...\n')
        console.log('📝 Testing with your actual backend endpoints\n')
        
        try {
            // Test 1: Alumni Login
            await this.testAlumniLogin()
            
            // Test 2: Create Alumni Profile
            await this.testAlumniProfileCreation()
            
            // Test 3: Alumni Creates Jobs
            await this.testAlumniJobCreation()
            
            // Test 4: Student Login
            await this.testStudentLogin()
            
            // Test 5: Create Student Profile
            await this.testStudentProfileCreation()
            
            // Test 6: Student Applies for Jobs (if jobs were created)
            if (this.createdJobIds.length > 0) {
                await this.testStudentJobApplications()
            } else {
                console.log('📝 Test 6: Student Job Applications - SKIPPED (no jobs created)')
                this.testResults.push({ test: 'Student Job Applications', status: 'SKIPPED' })
            }
            
            // Test 7: Job Search and Filtering
            await this.testJobSearch()
            
            this.printResults()
            
        } catch (error) {
            console.error('❌ Test flow failed:', error)
        }
    }

    async testAlumniLogin() {
        console.log('📝 Test 1: Alumni Login')
        try {
            const result = await this.auth.login('alumni', 'alumni1234')
            
            if (result.success) {
                console.log('✅ Alumni login successful')
                console.log('   User ID:', result.user.user_id)
                console.log('   Role:', result.user.role)
                this.testResults.push({ test: 'Alumni Login', status: 'PASSED' })
            } else {
                console.log('❌ Alumni login failed:', result.error)
                this.testResults.push({ test: 'Alumni Login', status: 'FAILED', error: result.error })
            }
        } catch (error) {
            console.log('❌ Alumni login error:', error)
            this.testResults.push({ test: 'Alumni Login', status: 'FAILED', error: error.message })
        }
        console.log('')
    }

    async testAlumniProfileCreation() {
        console.log('📝 Test 2: Alumni Profile Creation')
        try {
            const profileData = {
                full_name: "Test Alumni User",
                bio: "Experienced software engineer with 5+ years in web development",
                mobile_number: "+91-9876543210",
                gender: "Male",
                email_address: "alumni.test@example.com",
                dob: "1990-01-15T00:00:00.000Z",
                profile_picture_url: "https://example.com/profile.jpg",
                passing_batch: 2015,
                degree_certificate: "https://example.com/degree.pdf"
            }

            console.log('   Profile data being sent:', profileData)
            const result = await this.userDetails.createAlumniProfile(profileData)
            
            if (result.success) {
                console.log('✅ Alumni profile created successfully')
                this.auth.updateProfileStatus(true)
                this.testResults.push({ test: 'Alumni Profile Creation', status: 'PASSED' })
            } else {
                console.log('❌ Alumni profile creation failed:', result.error)
                console.log('   Using endpoint: POST /user')
                console.log('   Note: Backend uses user_id from token, not from request body')
                this.testResults.push({ test: 'Alumni Profile Creation', status: 'FAILED', error: result.error })
            }
        } catch (error) {
            console.log('❌ Alumni profile creation error:', error)
            this.testResults.push({ test: 'Alumni Profile Creation', status: 'FAILED', error: error.message })
        }
        console.log('')
    }

    async testAlumniJobCreation() {
        console.log('📝 Test 3: Alumni Job Creation')
        
        try {
            const futureDate1 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            const futureDate2 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()

            // Job 1: Frontend Developer
            const job1Data = {
                job_title: "Senior Frontend Developer React",
                job_description: "We are looking for an experienced Frontend Developer with React expertise. You will be responsible for building modern web applications using React, TypeScript, and modern frontend tools.",
                designation: "Senior Frontend Developer",
                location: "Bangalore, Karnataka",
                mode: "Hybrid",
                experience: "3-5 years",
                salary: "₹12-18 LPA",
                vacancy: 2,
                joining_date: futureDate1,
                status: "OPEN",
                open_till: futureDate2
            }

            console.log('   Creating job 1...')
            const result1 = await this.jobs.createJob(job1Data)
            
            if (result1.success) {
                const jobId = result1.data.data.id
                this.createdJobIds.push(jobId)
                console.log('✅ Job 1 created successfully')
                console.log('   Job ID:', jobId)
                console.log('   Title:', result1.data.data.job_title)
            } else {
                console.log('❌ Job 1 creation failed:', result1.error)
            }

            // Job 2: Backend Developer
            const job2Data = {
                job_title: "Backend Developer Node.js",
                job_description: "Join our backend team to build scalable APIs and microservices. Experience with Node.js, Express, and databases like MongoDB or PostgreSQL required.",
                designation: "Backend Developer",
                location: "Remote",
                mode: "Remote",
                experience: "2-4 years",
                salary: "₹8-15 LPA",
                vacancy: 3,
                joining_date: futureDate1,
                status: "OPEN",
                open_till: futureDate2
            }

            console.log('   Creating job 2...')
            const result2 = await this.jobs.createJob(job2Data)
            
            if (result2.success) {
                const jobId = result2.data.data.id
                this.createdJobIds.push(jobId)
                console.log('✅ Job 2 created successfully')
                console.log('   Job ID:', jobId)
                console.log('   Title:', result2.data.data.job_title)
                this.testResults.push({ 
                    test: 'Alumni Job Creation', 
                    status: 'PASSED', 
                    jobsCreated: this.createdJobIds.length 
                })
            } else {
                console.log('❌ Job 2 creation failed:', result2.error)
                if (this.createdJobIds.length > 0) {
                    this.testResults.push({ 
                        test: 'Alumni Job Creation', 
                        status: 'PARTIAL', 
                        jobsCreated: this.createdJobIds.length,
                        error: 'Some jobs failed to create'
                    })
                } else {
                    this.testResults.push({ 
                        test: 'Alumni Job Creation', 
                        status: 'FAILED', 
                        error: 'All job creations failed' 
                    })
                }
            }

        } catch (error) {
            console.log('❌ Job creation error:', error)
            this.testResults.push({ test: 'Alumni Job Creation', status: 'FAILED', error: error.message })
        }
        
        console.log('')
    }

    async testStudentLogin() {
        console.log('📝 Test 4: Student Login')
        // Logout alumni first
        this.auth.logout()
        
        try {
            const result = await this.auth.login('student1', 'student1234')
            
            if (result.success) {
                console.log('✅ Student login successful')
                console.log('   User ID:', result.user.user_id)
                console.log('   Role:', result.user.role)
                this.testResults.push({ test: 'Student Login', status: 'PASSED' })
            } else {
                console.log('❌ Student login failed:', result.error)
                this.testResults.push({ test: 'Student Login', status: 'FAILED', error: result.error })
            }
        } catch (error) {
            console.log('❌ Student login error:', error)
            this.testResults.push({ test: 'Student Login', status: 'FAILED', error: error.message })
        }
        console.log('')
    }

    async testStudentProfileCreation() {
        console.log('📝 Test 5: Student Profile Creation')
        try {
            const profileData = {
                full_name: "Test Student User",
                bio: "Final year Computer Science student looking for internship opportunities",
                mobile_number: "+91-9123456780",
                gender: "Female",
                email_address: "student.test@example.com",
                linked_in: "https://linkedin.com/in/teststudent",
                github: "https://github.com/teststudent",
                about_us: "Referred by college professor",
                dob: "2000-05-20T00:00:00.000Z",
                profile_picture_url: "https://example.com/student-profile.jpg",
                resume: "https://example.com/resume.pdf"
            }

            console.log('   Profile data being sent:', profileData)
            const result = await this.userDetails.createStudentProfile(profileData)
            
            if (result.success) {
                console.log('✅ Student profile created successfully')
                this.auth.updateProfileStatus(true)
                this.testResults.push({ test: 'Student Profile Creation', status: 'PASSED' })
            } else {
                console.log('❌ Student profile creation failed:', result.error)
                console.log('   Using endpoint: POST /user')
                console.log('   Note: Backend uses user_id from token, not from request body')
                this.testResults.push({ test: 'Student Profile Creation', status: 'FAILED', error: result.error })
            }
        } catch (error) {
            console.log('❌ Student profile creation error:', error)
            this.testResults.push({ test: 'Student Profile Creation', status: 'FAILED', error: error.message })
        }
        console.log('')
    }

    async testStudentJobApplications() {
        console.log('📝 Test 6: Student Job Applications')
        try {
            let applicationsSubmitted = 0

            for (const jobId of this.createdJobIds) {
                console.log(`   Applying for job: ${jobId}`)
                const result = await this.applications.applyForJob(jobId)
                
                if (result.success) {
                    console.log('✅ Application submitted successfully')
                    applicationsSubmitted++
                } else {
                    console.log('❌ Failed to apply:', result.error)
                }
            }

            if (applicationsSubmitted > 0) {
                this.testResults.push({ 
                    test: 'Student Job Applications', 
                    status: 'PASSED', 
                    applications: applicationsSubmitted 
                })
            } else {
                this.testResults.push({ 
                    test: 'Student Job Applications', 
                    status: 'FAILED', 
                    error: 'No applications could be submitted' 
                })
            }

        } catch (error) {
            console.log('❌ Job application error:', error)
            this.testResults.push({ test: 'Student Job Applications', status: 'FAILED', error: error.message })
        }
        console.log('')
    }

    async testJobSearch() {
        console.log('📝 Test 7: Job Search and Filtering')
        try {
            // Test get all jobs first
            console.log('   Getting all jobs...')
            const allJobsResult = await this.jobs.getJobs()
            
            if (allJobsResult.success) {
                const jobs = allJobsResult.data.data.jobs || []
                console.log('✅ Get all jobs successful')
                console.log('   Total jobs found:', jobs.length)
                
                // Test search with filters if we have jobs
                if (jobs.length > 0) {
                    console.log('   Testing filters...')
                    const filters = {
                        location: 'Remote',
                        mode: 'Remote'
                    }

                    const filteredResult = await this.jobs.getJobs(filters)
                    
                    if (filteredResult.success) {
                        const filteredJobs = filteredResult.data.data.jobs || []
                        console.log('✅ Job search with filters successful')
                        console.log('   Filtered jobs found:', filteredJobs.length)
                        this.testResults.push({ 
                            test: 'Job Search', 
                            status: 'PASSED', 
                            totalJobs: jobs.length,
                            filteredJobs: filteredJobs.length 
                        })
                    } else {
                        console.log('❌ Filtered search failed:', filteredResult.error)
                        this.testResults.push({ 
                            test: 'Job Search', 
                            status: 'PARTIAL', 
                            totalJobs: jobs.length,
                            error: 'Filter search failed but all jobs retrieved' 
                        })
                    }
                } else {
                    console.log('⚠️ No jobs available for filtering test')
                    this.testResults.push({ 
                        test: 'Job Search', 
                        status: 'PASSED', 
                        totalJobs: 0,
                        note: 'No jobs available' 
                    })
                }
            } else {
                console.log('❌ Get all jobs failed:', allJobsResult.error)
                this.testResults.push({ test: 'Job Search', status: 'FAILED', error: allJobsResult.error })
            }

        } catch (error) {
            console.log('❌ Job search error:', error)
            this.testResults.push({ test: 'Job Search', status: 'FAILED', error: error.message })
        }
        console.log('')
    }

    printResults() {
        console.log('🎯 TEST RESULTS SUMMARY')
        console.log('=' .repeat(50))
        
        this.testResults.forEach((result, index) => {
            const status = result.status === 'PASSED' ? '✅' : 
                          result.status === 'FAILED' ? '❌' : '⚠️'
            console.log(`${status} ${index + 1}. ${result.test}: ${result.status}`)
            
            if (result.error) {
                console.log(`   Error: ${result.error}`)
            }
            if (result.jobsCreated) {
                console.log(`   Jobs Created: ${result.jobsCreated}`)
            }
            if (result.applications) {
                console.log(`   Applications Submitted: ${result.applications}`)
            }
            if (result.totalJobs !== undefined) {
                console.log(`   Total Jobs: ${result.totalJobs}`)
            }
        })

        const passed = this.testResults.filter(r => r.status === 'PASSED').length
        const total = this.testResults.length
        
        console.log('=' .repeat(50))
        console.log(`📊 Final Score: ${passed}/${total} tests passed`)
        
        if (passed === total) {
            console.log('🎉 All tests passed! Your system is working correctly.')
        } else if (passed >= total * 0.7) {
            console.log('✅ Most tests passed! Core functionality is working.')
        } else {
            console.log('⚠️ Several tests failed. Check backend endpoints and data.')
        }

        console.log('\n📋 Backend Endpoints Used:')
        console.log('   POST /auth/login')
        console.log('   POST /user (profile creation)')
        console.log('   GET /user/:id (profile fetch)')
        console.log('   PUT /user (profile update)')
        console.log('   POST /jobs (job creation)')
        console.log('   GET /jobs (job search)')
        console.log('   POST /apply/:id (apply for job)')
    }
}

export default TestFlow