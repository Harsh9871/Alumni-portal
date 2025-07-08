import React from 'react'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Dashboard from '../components/layout/Dashboard'
const Student = () => {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div>
          <h1>Student</h1>
        </div>
      </Dashboard>
    </ProtectedRoute>
  )
}

export default Student
