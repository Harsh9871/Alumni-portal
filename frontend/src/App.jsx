// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import TestComponent from './components/TestComponent';
import SearchJobs from './pages/SearchJobs';
import CreateJob from './pages/CreateJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import CreateProfile from './pages/CreateProfile';
import JobDetails from './pages/JobDetails';
import JobApplications from './pages/JobApplications';
import ProtectedRoute from './components/common/ProtectedRoute';
import EditJob from './pages/EditJob';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar rendered once at the top level */}
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>

        {/* Main content area - flex-1 makes it take available space */}
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchJobs />
              </ProtectedRoute>
            } />
            
            <Route path="/jobs/:id" element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            } />

            {/* Student only routes */}
            <Route path="/my-applications" element={
              <ProtectedRoute requireProfile={true}>
                <MyApplications />
              </ProtectedRoute>
            } />
            
            <Route path="/jobs/:id/edit" element={
              <ProtectedRoute requireProfile={true}>
                <EditJob />
              </ProtectedRoute>
            } />
            
            {/* Alumni only routes */}
            <Route path="/jobs/create" element={
              <ProtectedRoute requireProfile={true}>
                <CreateJob />
              </ProtectedRoute>
            } />
            
            <Route path="/my-jobs" element={
              <ProtectedRoute requireProfile={true}>
                <MyJobs />
              </ProtectedRoute>
            } />
            
            <Route path="/jobs/:id/applications" element={
              <ProtectedRoute requireProfile={true}>
                <JobApplications />
              </ProtectedRoute>
            } />

            {/* Profile routes */}
            <Route path="/profile" element={
              <ProtectedRoute requireProfile={true}>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/profile/create" element={
              <ProtectedRoute>
                <CreateProfile />
              </ProtectedRoute>
            } />

            {/* Test route */}
            <Route path="/test" element={<TestComponent />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Sticky Footer */}
        <footer className="bg-gray-800 text-white py-6 mt-auto border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">EduConnect</h3>
                <p className="text-gray-400 max-w-md">
                  Bridging the gap between students and alumni through meaningful career opportunities and mentorship.
                </p>
                <div className="flex space-x-4 mt-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="/search" className="text-gray-400 hover:text-white transition-colors">Find Jobs</a></li>
                  <li><a href="/jobs/create" className="text-gray-400 hover:text-white transition-colors">Post a Job</a></li>
                  <li><a href="/profile" className="text-gray-400 hover:text-white transition-colors">My Profile</a></li>
                  <li><a href="/my-applications" className="text-gray-400 hover:text-white transition-colors">My Applications</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 EduConnect. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;