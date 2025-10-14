import React from 'react'
import { useNavigate } from 'react-router-dom'

const MyApplications = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col align-center justify-center items-center h-[calc(100vh-350px)]'>
      <h1 className='text-2xl font-bold text-gray-800'>This page us under Developement </h1>
      <p className='text-gray-600 mt-2'>We are working hard to provide you with the best possible experience.</p>
      <button onClick={() => navigate('/')} className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4'>Back to Home</button>
    </div>
  )
}

export default MyApplications
