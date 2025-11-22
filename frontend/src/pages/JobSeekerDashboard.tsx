import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/jobseeker-dashboard.css'

interface Application {
  id: string
  _id?: string
  job_id: string
  jobseeker_id: string
  application_status: string
  created_at: string
  match_result?: {
    score: number
  }
  job?: {
    title: string
    company?: string
    location?: string
  }
}

interface DashboardStats {
  totalApplications: number
  avgMatchScore: number
  pendingStatus: number
  profileStrength: number
}

const JobSeekerDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id || user._id || user.userId
  
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    avgMatchScore: 0,
    pendingStatus: 0,
    profileStrength: 0
  })
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchDashboardData()
    }
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch applications
      const response = await apiRequest(API_ENDPOINTS.GET_APPLICATIONS_BY_JOBSEEKER(userId))
      
      if (response.ok) {
        const data = await response.json()
        const applications = data.data || []
        
        // Calculate statistics
        const totalApplications = applications.length
        const pendingApplications = applications.filter((app: any) => 
          ['APPLIED', 'REVIEWING'].includes(app.application_status)
        ).length
        
        const avgScore = applications.length > 0
          ? applications.reduce((sum: number, app: any) => 
              sum + (app.match_result?.score || 0), 0) / applications.length
          : 0
        
        setStats({
          totalApplications,
          avgMatchScore: Math.round(avgScore),
          pendingStatus: pendingApplications,
          profileStrength: calculateProfileStrength()
        })
        
        // Get recent applications with job details
        const recentApps = await Promise.all(
          applications.slice(0, 3).map(async (app: any) => {
            try {
              // Fetch job details for each application
              const jobResponse = await apiRequest(API_ENDPOINTS.GET_JOB_BY_ID(app.job_id))
              let jobData = null
              
              if (jobResponse.ok) {
                const job = await jobResponse.json()
                jobData = job.data
              }
              
              return {
                id: app.id || app._id,
                job_id: app.job_id,
                jobseeker_id: app.jobseeker_id,
                application_status: app.application_status,
                created_at: app.created_at,
                match_result: app.match_result,
                job: jobData ? {
                  title: jobData.title,
                  company: jobData.company,
                  location: jobData.location
                } : {
                  title: 'Job Position',
                  company: 'Company',
                  location: 'Location'
                }
              }
            } catch (error) {
              return {
                ...app,
                id: app.id || app._id,
                job: {
                  title: 'Job Position',
                  company: 'Company',
                  location: 'Location'
                }
              }
            }
          })
        )
        
        setRecentApplications(recentApps)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setStats({
        totalApplications: 0,
        avgMatchScore: 0,
        pendingStatus: 0,
        profileStrength: 0
      })
      setRecentApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProfileStrength = () => {
    // Fetch profile and calculate completeness
    // For now, return a default value
    return 75
  }

  const handleSearchJobs = () => {
    navigate('/jobseeker/search')
  }

  const handleViewApplications = () => {
    navigate('/jobseeker/applications')
  }

  const handleUpdateProfile = () => {
    navigate('/jobseeker/profile')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SHORTLISTED': return '#10b981'
      case 'INTERVIEW': return '#3b82f6'
      case 'OFFER': return '#8b5cf6'
      case 'HIRED': return '#22c55e'
      case 'REJECTED': return '#ef4444'
      case 'REVIEWING': return '#f59e0b'
      case 'APPLIED': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'Applied'
      case 'REVIEWING': return 'Under Review'
      case 'SHORTLISTED': return 'Shortlisted'
      case 'INTERVIEW': return 'Interview'
      case 'OFFER': return 'Offer'
      case 'HIRED': return 'Hired'
      case 'REJECTED': return 'Not Selected'
      default: return status
    }
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
    <div className="jobseeker-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your job search overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M9 12H7V10H9V12ZM13 12H11V10H13V12ZM17 12H15V10H17V12ZM19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Applications</p>
            <h2 className="stat-value">{stats.totalApplications}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Average Match Score</p>
            <h2 className="stat-value">{stats.avgMatchScore}%</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 11.75V7Z"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Status</p>
            <h2 className="stat-value">{stats.pendingStatus}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8S13.66 11 12 11 9 9.66 9 8 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9S17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Profile Strength</p>
            <h2 className="stat-value">{stats.profileStrength}%</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <button className="action-btn primary" onClick={handleSearchJobs}>
            Search Jobs
          </button>
          <button className="action-btn secondary" onClick={handleViewApplications}>
            View Applications
          </button>
          <button className="action-btn secondary" onClick={handleUpdateProfile}>
            Update Profile
          </button>
        </div>

        <div className="recent-applications">
          <h3>Recent Applications</h3>
          <div className="applications-list">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div 
                  key={app.id} 
                  className="application-item"
                  onClick={() => navigate(`/jobseeker/job/${app.job_id}`)}
                >
                  <div className="application-info">
                    <h4>{app.job?.title}</h4>
                    <p className="company-name">{app.job?.company} • {app.job?.location}</p>
                  </div>
                  <div className="application-stats">
                    {app.match_result?.score && (
                      <div className="match-score-container">
                        <span className="match-score">{app.match_result.score}%</span>
                      </div>
                    )}
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(app.application_status)}20`,
                        color: getStatusColor(app.application_status) 
                      }}
                    >
                      {getStatusText(app.application_status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-applications">
                No applications yet. Start searching for jobs to begin your journey!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="quick-tip">
        <div className="tip-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#5b5fc7">
            <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"/>
          </svg>
        </div>
        <div className="tip-content">
          <h4>Quick Tip</h4>
          <p>Complete your profile to improve match scores! A complete profile can increase your visibility to recruiters by up to 40%.</p>
        </div>
      </div>
    </div>
  )
}

export default JobSeekerDashboard