import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Dashboard from '../components/layout/Dashboard'
import Student from '../hooks/student'

const StudentPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const studentService = new Student()

  // Get all students
  const getAllStudents = async (filter = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await studentService.getAllStudents(filter)
      if (result) {
        setData(result)
        console.log(result)
      } else {
        setError('Failed to fetch students')
      }
    } catch (err) {
      setError(err.message || 'Error fetching students')
    } finally {
      setLoading(false)
    }
  }

  // Get student by ID
  const getStudentById = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await studentService.getStudentById(id)
      if (result) {
        setData(result)
      } else {
        setError('Student not found')
      }
    } catch (err) {
      setError(err.message || 'Error fetching student')
    } finally {
      setLoading(false)
    }
  }

  // Signup new user
  const signupUser = async (user_id, password, role) => {
    setLoading(true)
    setError(null)
    try {
      const result = await studentService.signup(user_id, password, role)
      if (result) {
        return result
      } else {
        setError('Failed to create user')
        return null
      }
    } catch (err) {
      setError(err.message || 'Error creating user')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const loginUser = async (user_id, password) => {
    setLoading(true)
    setError(null)
    try {
      const result = await studentService.login(user_id, password)
      if (result) {
        return result
      } else {
        setError('Invalid credentials')
        return null
      }
    } catch (err) {
      setError(err.message || 'Error logging in')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Load all students on component mount
  useEffect(() => {
    getAllStudents()
  }, [])

  return (
    <ProtectedRoute>
      <Dashboard>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        
        {/* Your UI components here */}
        <div>
          {/* Example: Display students data */}
          {Array.isArray(data) ? (
            data.map(student => (
              <div key={student.id}>
                {student.user_id} - {student.role}
              </div>
            ))
          ) : (
            data && <div>Student: {data.user_id}</div>
          )}
        </div>
      </Dashboard>
    </ProtectedRoute>
  )
}

export default StudentPage