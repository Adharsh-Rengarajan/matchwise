import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/jobseeker-applications.css'

interface Application {
  id: string
  job_id: string
  jobseeker_id: string
  application_status: string
  created_at: string
  updated_at: string
  match_result?: {
    score: number
  }
  job?: {
    title: string
    company?: string
    location?: string
    salary_range?: {
      min: number
      max: number
    }
  }
}

const JobSeekerApplications = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterAndSortApplications()
  }, [applications, filterStatus, sortBy])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const userId = user.id || user._id || user.userId
      const response = await apiRequest(API_ENDPOINTS.GET_APPLICATIONS_BY_JOBSEEKER(userId))
      
      if (response.ok) {
        const data = await response.json()
        const applicationsList = data.data || []
        
        // Fetch job details for each application
        const applicationsWithJobs = await Promise.all(
          applicationsList.map(async (app: any) => {
            try {
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
                updated_at: app.updated_at || app.created_at,
                match_result: app.match_result,
                job: jobData ? {
                  title: jobData.title,
                  company: jobData.company,
                  location: jobData.location,
                  salary_range: jobData.salary_range
                } : undefined
              }
            } catch (error) {
              return {
                ...app,
                id: app.id || app._id
              }
            }
          })
        )
        
        setApplications(applicationsWithJobs)
      } else {
        setApplications([])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      setApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortApplications = () => {
    let filtered = [...applications]

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.application_status === filterStatus)
    }

    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'match') {
        return (b.match_result?.score || 0) - (a.match_result?.score || 0)
      }
      return 0
    })

    setFilteredApplications(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return '#6b7280'
      case 'REVIEWING': return '#f59e0b'
      case 'SHORTLISTED': return '#10b981'
      case 'INTERVIEW': return '#3b82f6'
      case 'OFFER': return '#8b5cf6'
      case 'HIRED': return '#22c55e'
      case 'REJECTED': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'Applied'
      case 'REVIEWING': return 'Under Review'
      case 'SHORTLISTED': return 'Shortlisted'
      case 'INTERVIEW': return 'Interview Scheduled'
      case 'OFFER': return 'Offer Received'
      case 'HIRED': return 'Hired'
      case 'REJECTED': return 'Not Selected'
      default: return status
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min || !max) return 'Salary not disclosed'
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  const handleViewDetails = (jobId: string) => {
    navigate(`/jobseeker/job/${jobId}`)
  }

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="jobseeker-applications">
      <div className="applications-header">
        <div>
          <h1>My Applications</h1>
          <p>Track and manage your job applications</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{applications.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {applications.filter(a => a.application_status === 'INTERVIEW').length}
            </span>
            <span className="stat-label">Interviews</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {applications.filter(a => ['APPLIED', 'REVIEWING'].includes(a.application_status)).length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="applications-filters">
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Applications</option>
            <option value="APPLIED">Applied</option>
            <option value="REVIEWING">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Not Selected</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="match">Match Score</option>
          </select>
        </div>
      </div>

      <div className="applications-list">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="job-info">
                  <h3>{application.job?.title || 'Job Position'}</h3>
                  <div className="company-info">
                    <span className="company">{application.job?.company || 'Company'}</span>
                    <span className="separator">•</span>
                    <span className="location">{application.job?.location || 'Location'}</span>
                  </div>
                  <div className="salary-info">
                    {application.job?.salary_range && 
                      formatSalary(application.job.salary_range.min, application.job.salary_range.max)
                    }
                  </div>
                </div>
                <div className="application-meta">
                  <div className="match-score">
                    <div className="score-circle">
                      <span className="score-value">{application.match_result?.score || 0}%</span>
                    </div>
                    <span className="score-label">Match</span>
                  </div>
                </div>
              </div>

              <div className="application-body">
                <div className="status-timeline">
                  <div 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(application.application_status)}20`,
                      color: getStatusColor(application.application_status),
                      borderLeft: `3px solid ${getStatusColor(application.application_status)}`
                    }}
                  >
                    {getStatusText(application.application_status)}
                  </div>
                  <div className="timeline-info">
                    <p className="applied-date">Applied {getTimeSince(application.created_at)}</p>
                    {application.updated_at !== application.created_at && (
                      <p className="updated-date">Last updated {getTimeSince(application.updated_at)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="application-actions">
                <button 
                  className="btn-view"
                  onClick={() => handleViewDetails(application.job_id)}
                >
                  View Job Details
                </button>
                {application.application_status === 'INTERVIEW' && (
                  <button className="btn-prepare">
                    Prepare for Interview
                  </button>
                )}
                {application.application_status === 'OFFER' && (
                  <button className="btn-offer">
                    View Offer
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#d1d5db">
              <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"/>
            </svg>
            <h3>No applications found</h3>
            <p>Start searching for jobs to begin your journey!</p>
            <button onClick={() => navigate('/jobseeker/search')}>
              Search Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobSeekerApplications