import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import styles from '../styles/view-jobs.module.css'

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
  
  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase()
    switch(statusLower) {
      case 'open':
      case 'active':
        return `${styles.statusBadge} ${styles.active}`
      case 'hiring':
        return `${styles.statusBadge} ${styles.hiring}`
      case 'closed':
      case 'expired':
        return `${styles.statusBadge} ${styles.closed}`
      default:
        return `${styles.statusBadge} ${styles.draft}`
    }
  }
  
  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
      </div>
    )
  }
  
  return (
    <div className={styles.viewJobsContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>View Jobs</h1>
          <p className={styles.pageSubtitle}>Select a job to review candidates</p>
        </div>
        <button 
          className={styles.postJobBtn}
          onClick={() => navigate('/recruiter/post-job')}
        >
          Post New Job
        </button>
      </div>
      
      {jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#9ca3af">
              <path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z"/>
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>No Jobs Posted Yet</h2>
          <p className={styles.emptyText}>Start by posting your first job to attract candidates</p>
          <button 
            className={styles.emptyAction}
            onClick={() => navigate('/recruiter/post-job')}
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All Job Postings</h2>
            </div>
            
            <div className={styles.tableHeader}>
              <div>JOB TITLE</div>
              <div>LOCATION</div>
              <div>APPLICATIONS</div>
              <div>POSTED DATE</div>
              <div>STATUS</div>
              <div>ACTIONS</div>
            </div>
            
            <div className={styles.tableBody}>
              {jobs.map((job) => (
                <div key={job.id} className={styles.tableRow}>
                  <div>
                    <button 
                      className={styles.jobTitleLink}
                      onClick={() => handleJobClick(job.id)}
                    >
                      {job.title}
                    </button>
                  </div>
                  
                  <div className={styles.colLocation}>
                    {job.location}
                  </div>
                  
                  <div>
                    <span className={styles.applicationsCount}>
                      {applicationsCount[job.id] || 0}
                    </span>
                  </div>
                  
                  <div className={styles.colPosted}>
                    {formatDate(job.created_at)}
                  </div>
                  
                  <div>
                    <span className={getStatusClass(job.status)}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className={styles.colActions}>
                    <button
                      className={styles.actionMenuBtn}
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                    >
                      ⋮
                    </button>
                    {selectedJob === job.id && (
                      <div className={styles.actionMenu}>
                        <button onClick={() => handleJobClick(job.id)}>View Details</button>
                        <button onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}>
                          View Candidates
                        </button>

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
                          <button onClick={() => handleStatusUpdate(job.id, 'OPEN')}>
                            Reopen Job
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ViewJobs;