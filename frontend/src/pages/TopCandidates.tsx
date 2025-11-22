import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/top-candidates.css'

interface Candidate {
  id: string
  job_id: string
  jobseeker_id: string
  resume_file_id: string
  status: string
  created_at: string
  match_result?: {
    score: number
    skills_match?: string[]
    experience_match?: string
    education_match?: string
  }
  answers?: Array<{
    questionNo: number
    question: string
    answer: string
  }>
  notes?: Array<{
    recruiter_id: string
    note: string
    created_at: string
  }>
}

interface Job {
  id: string
  title: string
  location: string
  skills_required?: string[]
}

const TopCandidates = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  
  useEffect(() => {
    if (jobId) {
      fetchCandidatesAndJob()
    }
  }, [jobId])
  
  useEffect(() => {
    filterAndSortCandidates()
  }, [candidates, filterStatus, sortBy])
  
  const fetchCandidatesAndJob = async () => {
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
        setCandidates(candidatesData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const filterAndSortCandidates = () => {
    let filtered = [...candidates]
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return (b.match_result?.score || 0) - (a.match_result?.score || 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    setFilteredCandidates(filtered)
  }
  
  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.UPDATE_JOB_STATUS, {
        method: 'PATCH',
        body: JSON.stringify({
          application_id: candidateId,
          status: newStatus
        })
      })
      
      if (response.ok) {
        setCandidates(candidates.map(c => 
          c.id === candidateId ? { ...c, status: newStatus } : c
        ))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }
  
  const handleViewApplication = (candidateId: string) => {
    navigate(`/recruiter/applications/${candidateId}`)
  }
  
  const handleDownloadResume = async (fileId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_RESUME(fileId))
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `resume_${fileId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download resume:', error)
    }
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#3b82f6'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    }
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    })
  }
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading candidates...</p>
      </div>
    )
  }
  
  return (
    <div className="top-candidates">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/recruiter/jobs/${jobId}`)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
          Back to Job Details
        </button>
        <div className="header-info">
          <h1>Top Candidates</h1>
          {job && <p className="job-title">{job.title} - {job.location}</p>}
        </div>
      </div>
      
      <div className="filters-bar">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Candidates</option>
            <option value="pending">Pending Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="score">Match Score</option>
            <option value="date">Application Date</option>
          </select>
        </div>
        <div className="candidates-count">
          {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {filteredCandidates.length === 0 ? (
        <div className="no-candidates">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3>No candidates found</h3>
          <p>No applications match your current filters</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {filteredCandidates.map(candidate => (
            <div key={candidate.id} className="candidate-card">
              <div className="candidate-header">
                <div className="candidate-info">
                  <h3>Candidate #{candidate.jobseeker_id.slice(-6)}</h3>
                  <p className="applied-time">{formatDate(candidate.created_at)}</p>
                </div>
                <div className="match-score" style={{ background: getScoreColor(candidate.match_result?.score || 0) }}>
                  {candidate.match_result?.score || 0}%
                </div>
              </div>
              
              <div className="candidate-details">
                {candidate.match_result?.skills_match && (
                  <div className="detail-row">
                    <span className="detail-label">Matching Skills:</span>
                    <div className="skills-tags">
                      {candidate.match_result.skills_match.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                      {candidate.match_result.skills_match.length > 3 && (
                        <span className="skill-tag more">+{candidate.match_result.skills_match.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <select 
                    className={`status-select ${candidate.status}`}
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                {candidate.notes && candidate.notes.length > 0 && (
                  <div className="notes-preview">
                    <span className="notes-count">{candidate.notes.length} note{candidate.notes.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              
              <div className="candidate-actions">
                <button 
                  className="action-btn view"
                  onClick={() => handleViewApplication(candidate.id)}
                >
                  View Application
                </button>
                <button 
                  className="action-btn download"
                  onClick={() => handleDownloadResume(candidate.resume_file_id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TopCandidates