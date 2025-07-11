import React from 'react'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Dashboard from '../components/layout/Dashboard'
const Home = () => {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div>

          <h1 className='text-2xl font-bold underline'>Home</h1>
        </div>
      </Dashboard>
    </ProtectedRoute>
  )
}

export default Home
