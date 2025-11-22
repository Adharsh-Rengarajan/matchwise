import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/recruiter-dashboard.css'

interface Job {
  avgMatchScore: number
  id: string
  title: string
  location: string
  status: string
  created_at: string
  applications_count?: number
}

interface DashboardStats {
  activeJobs: number
  pendingApplications: number
  shortlistedCandidates: number
  avgMatchScore: number
}

const RecruiterDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    pendingApplications: 0,
    shortlistedCandidates: 0,
    avgMatchScore: 0
  })
  const [topPerformingJobs, setTopPerformingJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.GET_JOBS_BY_RECRUITER(user.id))
      const data = await response.json()
      
      if (response.ok && data.data) {
        const jobs = data.data
        
        const activeJobs = jobs.filter((job: any) => job.status === 'active').length
        const totalApplications = jobs.reduce((sum: number, job: any) => {
          return sum + (job.applications_count || 0)
        }, 0)
        
        const jobsWithApplications = await Promise.all(
          jobs.slice(0, 4).map(async (job: any) => {
            try {
              const candidatesRes = await apiRequest(API_ENDPOINTS.GET_TOP_CANDIDATES(job.id))
              const candidatesData = await candidatesRes.json()
              
              if (candidatesRes.ok && candidatesData.data) {
                const applications = candidatesData.data
                const avgScore = applications.length > 0
                  ? applications.reduce((sum: number, app: any) => sum + (app.match_result?.score || 0), 0) / applications.length
                  : 0
                
                return {
                  ...job,
                  applications_count: applications.length,
                  avgMatchScore: avgScore
                }
              }
            } catch {
              return { ...job, applications_count: 0, avgMatchScore: 0 }
            }
          })
        )
        
        const totalMatchScores = jobsWithApplications.reduce((sum: number, job: any) => sum + (job.avgMatchScore || 0), 0)
        const avgMatchScore = jobsWithApplications.length > 0 ? totalMatchScores / jobsWithApplications.length : 0
        
        setStats({
          activeJobs,
          pendingApplications: totalApplications,
          shortlistedCandidates: Math.floor(totalApplications * 0.48),
          avgMatchScore: Math.round(avgMatchScore)
        })
        
        setTopPerformingJobs(jobsWithApplications)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleViewJobs = () => {
    navigate('/recruiter/jobs')
  }
  
  const handlePostJob = () => {
    navigate('/recruiter/post-job')
  }
  
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }
  
  return (
    <div className="recruiter-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your overview</p>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M20 6H4C3.45 6 3 6.45 3 7V19C3 19.55 3.45 20 4 20H20C20.55 20 21 19.55 21 19V7C21 6.45 20.55 6 20 6ZM20 8L12 13L4 8V7L12 12L20 7V8Z" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Jobs</p>
            <h2 className="stat-value">{stats.activeJobs}</h2>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3Z" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Applications</p>
            <h2 className="stat-value">{stats.pendingApplications}</h2>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Shortlisted Candidates</p>
            <h2 className="stat-value">{stats.shortlistedCandidates}</h2>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg Match Score</p>
            <h2 className="stat-value">{stats.avgMatchScore}%</h2>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <button className="action-btn primary" onClick={handleViewJobs}>
            View Jobs & Review Candidates
          </button>
          <button className="action-btn secondary" onClick={handlePostJob}>
            Post a New Job
          </button>
        </div>
        
        <div className="top-performing-jobs">
          <h3>Top Performing Jobs</h3>
          <div className="jobs-list">
            {topPerformingJobs.map((job, index) => (
              <div key={job.id} className="job-item" onClick={() => navigate(`/recruiter/jobs/${job.id}`)}>
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <p className="job-applications">{job.applications_count || 0} applications</p>
                </div>
                <div className="job-stats">
                  <span className="match-score">{Math.round(job.avgMatchScore || 0)}%</span>
                  <span className="match-label">avg match</span>
                </div>
              </div>
            ))}
            {topPerformingJobs.length === 0 && (
              <p className="no-jobs">No jobs posted yet. Post your first job to see statistics.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruiterDashboard