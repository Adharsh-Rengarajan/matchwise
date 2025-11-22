import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/job-details.css'

interface Job {
  id: string
  title: string
  description: string
  location: string
  status: string
  created_at: string
  salary_min?: number
  salary_max?: number
  experience_level?: string
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
  
  const formatSalary = (min?: number, max?: number) => {
    if (min == null && max == null) return 'Not specified'
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    })
    if (min != null && max != null) return `${formatter.format(min)} - ${formatter.format(max)}`
    if (min != null) return `From ${formatter.format(min)}`
    if (max != null) return `Up to ${formatter.format(max)}`
    return 'Not specified'
  }
  
  const getExperienceLabel = (level?: string) => {
    const labels: Record<string, string> = {
      entry: 'Entry Level (0-2 years)',
      junior: 'Junior (2-4 years)',
      mid: 'Mid Level (4-7 years)',
      senior: 'Senior (5-10 years)',
      lead: 'Lead (10+ years)'
    }
    return labels[level || ''] || level || 'Not specified'
  }
  
  const getEmploymentType = (type?: string) => {
    const types: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship'
    }
    return types[type || ''] || type || 'Full-time'
  }
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading job details...</p>
      </div>
    )
  }
  
  if (!job) {
    return (
      <div className="error-container">
        <h2>Job not found</h2>
        <button onClick={() => navigate('/recruiter/jobs')}>Back to Jobs</button>
      </div>
    )
  }
  
  const processedDescription = job.description.split('\n').map(line => {
    if (line.startsWith('•')) {
      return { type: 'bullet', content: line.substring(1).trim() }
    }
    if (line.includes(':') && line.indexOf(':') < 30) {
      const [title, ...rest] = line.split(':')
      return { type: 'section', title: title.trim(), content: rest.join(':').trim() }
    }
    return { type: 'paragraph', content: line }
  })
  
  return (
    <div className="job-details">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/recruiter/jobs')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
          Back to Jobs
        </button>
      </div>
      
      <div className="details-container">
        <div className="job-header-section">
          <div className="job-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M20 6H4C3.45 6 3 6.45 3 7V19C3 19.55 3.45 20 4 20H20C20.55 20 21 19.55 21 19V7C21 6.45 20.55 6 20 6Z" />
            </svg>
          </div>
          <div className="job-title-info">
            <h1>{job.title}</h1>
            <div className="job-meta">
              <span className="location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {job.location}
              </span>
              <span className="salary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
              <span className="posted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Posted {formatDate(job.created_at)}
              </span>
            </div>
            <span className={`status-badge ${job.status}`}>
              {job.status}
            </span>
          </div>
        </div>
        
        <div className="details-content">
          <div className="main-content">
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="skills-section">
                <h3>Required Skills</h3>
                <div className="skills-list">
                  {job.skills_required.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="description-section">
              <h3>Job Description</h3>
              <div className="description-content">
                {processedDescription.map((item, index) => {
                  if (item.type === 'section') {
                    return (
                      <div key={index} className="description-section-item">
                        <h4>{item.title}:</h4>
                        {item.content && <p>{item.content}</p>}
                      </div>
                    )
                  }
                  if (item.type === 'bullet') {
                    return (
                      <div key={index} className="bullet-item">
                        <span className="bullet">•</span>
                        <span>{item.content}</span>
                      </div>
                    )
                  }
                  return item.content && <p key={index}>{item.content}</p>
                })}
              </div>
            </div>
            
            {job.questions && job.questions.length > 0 && (
              <div className="questions-section">
                <h3>Screening Questions</h3>
                <ol className="questions-list">
                  {job.questions.map((q, index) => (
                    <li key={index}>{q.question}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          
          <div className="sidebar-content">
            <div className="applications-card">
              <h3>Applications</h3>
              <div className="applications-count">
                <span className="count">{applicationsCount}</span>
                <span className="label">Total Applications</span>
              </div>
              <p className="info-text">Match scores calculated when candidates applied</p>
              <button 
                className="view-candidates-btn"
                onClick={() => navigate(`/recruiter/jobs/${jobId}/candidates`)}
              >
                View Top Candidates
              </button>
            </div>
            
            <div className="details-card">
              <h3>Job Details</h3>
              <div className="detail-item">
                <span className="detail-label">Experience Level</span>
                <span className="detail-value">{getExperienceLabel(job.experience_level)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Employment Type</span>
                <span className="detail-value">{getEmploymentType(job.type)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Work Location</span>
                <span className="detail-value">{job.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetails