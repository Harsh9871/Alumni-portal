// src/components/TestComponent.jsx
import React from 'react'
import TestFlow from '../utils/TestFlow'
import TestFlowDebug from '../utils/TestFlowDebug'

const TestComponent = () => {
    const runTests = async () => {
        const testFlow = new TestFlow()
        await testFlow.runAllTests()
    }

    const runDebugTests = async () => {
        const testDebug = new TestFlowDebug()
        await testDebug.runDebugTests()
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">System Testing</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button 
                    onClick={runTests}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
                >
                    Run Complete Flow Test
                </button>
                
                <button 
                    onClick={runDebugTests}
                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded"
                >
                    Run Debug Tests
                </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
                <p className="text-sm text-gray-700">
                    Check browser console for detailed test results and errors.
                    The debug mode will help identify exact endpoint issues.
                </p>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-semibold text-yellow-800">Current Issues:</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                        <li>Student profile creation returns 400 (Bad Request)</li>
                        <li>Apply endpoint returns 404 (Not Found)</li>
                        <li>Job search returns 500 (Internal Server Error)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default TestComponent