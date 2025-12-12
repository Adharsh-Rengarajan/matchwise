import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import styles from '../styles/job-details.module.css'

interface Job {
  id: string
  title: string
  description: string
  location: string
  status: string
  created_at: string
  salary?: string
  type?: string
  skills_required?: string[]
  questions?: Array<{ question: string; questionNo: number }>
}

const JobDetails = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])
  
  const fetchJobDetails = async () => {
    try {
      const [jobResponse, candidatesResponse] = await Promise.all([
        apiRequest(API_ENDPOINTS.GET_JOB_BY_ID(jobId!)),
        apiRequest(API_ENDPOINTS.GET_TOP_CANDIDATES(jobId!))
      ])
      
      const jobData = await jobResponse.json()
      const candidatesData = await candidatesResponse.json()
      
      if (jobResponse.ok && jobData.data) {
        setJob(jobData.data)
      }
      
      if (candidatesResponse.ok && candidatesData.data) {
        setApplicationsCount(candidatesData.data.length)
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const formatSalary = (salary?: string) => {
    if (!salary || salary === "") return 'Not specified'
    
    const salaryNum = parseFloat(salary)
    if (isNaN(salaryNum) || salaryNum === 0) return 'Not specified'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salaryNum)
  }
  
  const getEmploymentType = (type?: string) => {
    if (!type) return 'Not specified'
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }
  
  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase()
    return `${styles.jobStatusBadge} ${styles[statusLower]}`
  }
  
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.UPDATE_JOB_STATUS, {
        method: 'PATCH',
        body: JSON.stringify({
          job_id: jobId,
          status: newStatus
        })
      })
      
      if (response.ok) {
        setJob(job ? { ...job, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }
  
  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
      </div>
    )
  }
  
  if (!job) {
    return (
      <div className={styles.jobDetailsContainer}>
        <p>Job not found</p>
      </div>
    )
  }
  
  return (
    <div className={styles.jobDetailsContainer}>
      <button 
        className={styles.backButton}
        onClick={() => navigate('/recruiter/jobs')}
      >
        ← Back to Jobs
      </button>
      
      <div className={styles.jobHeaderCard}>
        <div className={styles.jobHeaderSection}>
          <div className={styles.jobIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </div>
          
          <div className={styles.jobInfo}>
            <h1>{job.title}</h1>
            <div className={styles.jobMeta}>
              <span className={`${styles.metaItem} ${styles.location}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                {job.location}
              </span>
              <span className={styles.metaItem}>{formatSalary(job.salary)}</span>
              <span className={styles.metaItem}>Posted {formatDate(job.created_at)}</span>
            </div>
          </div>
          
          <div className={getStatusClass(job.status)}>
            {job.status}
          </div>
        </div>
        
        <div className={styles.detailsContent}>
          <div className={styles.mainSection}>
            {job.skills_required && job.skills_required.length > 0 && (
              <div className={styles.contentCard}>
                <h3>Required Skills</h3>
                <div className={styles.skillsList}>
                  {job.skills_required.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div className={styles.contentCard}>
              <h3>Job Description</h3>
              <p className={styles.description}>{job.description || 'No description provided'}</p>
            </div>
            
            {job.questions && job.questions.length > 0 && (
              <div className={styles.contentCard}>
                <h3>Screening Questions</h3>
                <div className={styles.questionsList}>
                  {job.questions.map((q, index) => (
                    <div key={index} className={styles.questionItem}>
                      <div className={styles.questionLabel}>Question {q.questionNo || index + 1}</div>
                      <div className={styles.questionText}>{q.question}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarCard}>
              <h3>Job Details</h3>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Employment Type</span>
                <span className={styles.infoValue}>{getEmploymentType(job.type)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Salary Range</span>
                <span className={styles.infoValue}>{formatSalary(job.salary)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Posted Date</span>
                <span className={styles.infoValue}>{formatDate(job.created_at)}</span>
              </div>
            </div>
            
            <div className={styles.sidebarCard}>
              <h3>Application Stats</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{applicationsCount}</div>
                  <div className={styles.statLabel}>Total Applications</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Interviewed</div>
                </div>
              </div>
            </div>
            
            <div className={styles.sidebarCard}>
              <h3>Actions</h3>
              <div className={styles.actionButtons}>
                {job.status === 'OPEN' && (
                  <>
                    <button 
                      className={styles.btnPrimary}
                      onClick={() => navigate(`/recruiter/jobs/${jobId}/candidates`)}
                    >
                      View Candidates
                    </button>
                    <button 
                      className={styles.btnSecondary}
                      onClick={() => handleStatusUpdate('HIRING')}
                    >
                      Mark as Hiring
                    </button>
                  </>
                )}
                
                {job.status === 'HIRING' && (
                  <>
                    <button 
                      className={styles.btnPrimary}
                      onClick={() => navigate(`/recruiter/jobs/${jobId}/candidates`)}
                    >
                      View Candidates
                    </button>
                    <button 
                      className={styles.btnDanger}
                      onClick={() => handleStatusUpdate('EXPIRED')}
                    >
                      Close Job
                    </button>
                  </>
                )}
                
                {job.status === 'EXPIRED' && (
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => handleStatusUpdate('OPEN')}
                  >
                    Reopen Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetails;