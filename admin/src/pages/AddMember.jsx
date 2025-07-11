import React from 'react'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Dashboard from '../components/layout/Dashboard'

const AddMember = () => {
  return (
    <ProtectedRoute>
        <Dashboard>
            <div>
                <h1>Add Member</h1>
            </div>
        </Dashboard>    
    </ProtectedRoute>
  )
}

export default AddMember
