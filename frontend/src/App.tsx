import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import RecruiterDashboard from './pages/RecruiterDashboard'
import ViewJobs from './pages/ViewJobs'
import PostJob from './pages/PostJob'
import JobDetails from './pages/JobDetails'
import TopCandidates from './pages/TopCandidates'
import ApplicationDetail from './pages/ApplicationDetail'
import NotFound from './pages/NotFound'
import Messages from './pages/Messages'
import RecruiterLayout from './components/RecruiterLayout'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/recruiter" element={
        <ProtectedRoute userType="recruiter">
          <RecruiterLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<ViewJobs />} />
        <Route path="jobs/:jobId" element={<JobDetails />} />
        <Route path="jobs/:jobId/candidates" element={<TopCandidates />} />
        <Route path="applications/:applicationId" element={<ApplicationDetail />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="messages" element={<Messages />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App