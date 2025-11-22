import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/view-jobs.css'

interface Job {
  id: string
  title: string
  location: string
  status: string
  created_at: string
  salary_min?: number
  salary_max?: number
  experience_level?: string
  type?: string
}

const ViewJobs = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [applicationsCount, setApplicationsCount] = useState<Record<string, number>>({})
  
  useEffect(() => {
    fetchJobs()
  }, [])
  
  const fetchJobs = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.GET_JOBS_BY_RECRUITER(user.id))
      const data = await response.json()
      
      if (response.ok && data.data) {
        setJobs(data.data)
        
        const counts: Record<string, number> = {}
        for (const job of data.data) {
          try {
            const candidatesRes = await apiRequest(API_ENDPOINTS.GET_TOP_CANDIDATES(job.id))
            const candidatesData = await candidatesRes.json()
            if (candidatesRes.ok && candidatesData.data) {
              counts[job.id] = candidatesData.data.length
            }
          } catch {
            counts[job.id] = 0
          }
        }
        setApplicationsCount(counts)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleJobClick = (jobId: string) => {
    navigate(`/recruiter/jobs/${jobId}`)
  }
  
  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.UPDATE_JOB_STATUS, {
        method: 'PATCH',
        body: JSON.stringify({
          job_id: jobId,
          status: newStatus
        })
      })
      
      if (response.ok) {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ))
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const formatSalary = (min?: number, max?: number) => {
    if (min === undefined && max === undefined) return 'Not specified'
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    })
    if (min !== undefined && max !== undefined) return `${formatter.format(min)} - ${formatter.format(max)}`
    if (min !== undefined) return `From ${formatter.format(min)}`
    if (max !== undefined) return `Up to ${formatter.format(max)}`
    return 'Not specified'
  }
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    )
  }
  
  return (
    <div className="view-jobs">
      <div className="page-header">
        <div>
          <h1>View Jobs</h1>
          <p>Select a job to review candidates</p>
        </div>
        <button 
          className="post-job-btn"
          onClick={() => navigate('/recruiter/post-job')}
        >
          Post New Job
        </button>
      </div>
      
      {jobs.length === 0 ? (
        <div className="no-jobs-container">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          </svg>
          <h3>No jobs posted yet</h3>
          <p>Get started by posting your first job listing</p>
          <button 
            className="post-first-job-btn"
            onClick={() => navigate('/recruiter/post-job')}
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <>
          <div className="jobs-section">
            <h3>All Job Postings</h3>
            <div className="jobs-table">
              <div className="table-header">
                <div className="col-title">Job Title</div>
                <div className="col-location">Location</div>
                <div className="col-applications">Applications</div>
                <div className="col-posted">Posted Date</div>
                <div className="col-status">Status</div>
                <div className="col-actions">Actions</div>
              </div>
              <div className="table-body">
                {jobs.map(job => (
                  <div key={job.id} className="table-row">
                    <div className="col-title">
                      <button 
                        className="job-title-link"
                        onClick={() => handleJobClick(job.id)}
                      >
                        {job.title}
                      </button>
                    </div>
                    <div className="col-location">{job.location}</div>
                    <div className="col-applications">
                      <span className="applications-count">
                        {applicationsCount[job.id] || 0}
                      </span>
                    </div>
                    <div className="col-posted">{formatDate(job.created_at)}</div>
                    <div className="col-status">
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="col-actions">
                      <button 
                        className="action-menu-btn"
                        onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      >
                        ⋮
                      </button>
                     {selectedJob === job.id && (
                        <div className="action-menu">
                            <button onClick={() => handleJobClick(job.id)}>View Details</button>
                            <button onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}>
                            View Candidates
                            </button>

                            {/* Status Controls */}
                            {job.status === 'OPEN' && (
                            <>
                                <button onClick={() => handleStatusUpdate(job.id, 'HIRING')}>
                                Mark as Hiring
                                </button>
                                <button onClick={() => handleStatusUpdate(job.id, 'EXPIRED')}>
                                Close Job
                                </button>
                            </>
                            )}

                            {job.status === 'HIRING' && (
                            <>
                                <button onClick={() => handleStatusUpdate(job.id, 'OPEN')}>
                                Set to Open
                                </button>
                                <button onClick={() => handleStatusUpdate(job.id, 'EXPIRED')}>
                                Close Job
                                </button>
                            </>
                            )}

                            {job.status === 'EXPIRED' && (
                            <>
                                <button onClick={() => handleStatusUpdate(job.id, 'OPEN')}>
                                Reopen Job
                                </button>
                            </>
                            )}
                        </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ViewJobs