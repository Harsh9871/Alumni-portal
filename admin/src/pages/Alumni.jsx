import React from 'react'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Dashboard from '../components/layout/Dashboard'
const Alumni = () => {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div>
          <h1>Alumni</h1>
        </div>
      </Dashboard>
    </ProtectedRoute>
  )
}

export default Alumni
