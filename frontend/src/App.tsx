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
import Messages from './pages/Messages'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import JobSeekerSearch from './pages/JobSeekerSearch'
import JobSeekerJobDetail from './pages/JobSeekerJobDetail'
import JobSeekerMessages from './pages/JobSeekerMessages'
import JobSeekerApplications from './pages/JobSeekerApplications'
import JobSeekerProfile from './pages/JobSeekerProfile'
import NotFound from './pages/NotFound'
import RecruiterLayout from './components/RecruiterLayout'
import JobSeekerLayout from './components/JobSeekerLayout'
import ProtectedRoute from './components/ProtectedRoute'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
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
          <Route path="/recruiter/messages" element={<Messages />} />
          <Route path="messages" element={<Messages />} />
        </Route>
        
        <Route path="/jobseeker" element={
          <ProtectedRoute userType="jobseeker">
            <JobSeekerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/jobseeker/dashboard" replace />} />
          <Route path="dashboard" element={<JobSeekerDashboard />} />
          <Route path="search" element={<JobSeekerSearch />} />
          <Route path="job/:jobId" element={<JobSeekerJobDetail />} />
          <Route path="applications" element={<JobSeekerApplications />} />
          <Route path="applications/:applicationId" element={<JobSeekerJobDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<JobSeekerProfile />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App;