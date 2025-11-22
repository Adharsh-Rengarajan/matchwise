import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/application-detail.css'

interface Application {
  id: string
  job_id: string
  jobseeker_id: string
  resume_file_id: string
  application_status: string
  created_at: string
  updated_at: string
  match_result?: {
    score: number
    matched_skills?: string[]
    missing_skills?: string[]
    transferable_skills?: string[]
    explanation?: string
  }
  questions?: Array<{
    questionNo: number
    question: string
  }>
  answers?: Array<{
    questionNo: number
    answer: string
  }>
  notes?: Array<{
    recruiter_id: string
    note: string
    created_at: string
  }>
  resume_text?: string
}

interface Job {
  id: string
  title: string
  location: string
  skills_required?: string[]
  company?: string
  job_type?: string
  salary_range?: {
    min: number
    max: number
  }
}

const ApplicationDetail = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [application, setApplication] = useState<Application | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [statusSaveMessage, setStatusSaveMessage] = useState('')
  
  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails()
    }
  }, [applicationId])

  useEffect(() => {
    if (application) {
      setSelectedStatus(application.application_status || 'APPLIED')
    }
  }, [application])
  
  const fetchApplicationDetails = async () => {
    try {
      const response = await apiRequest(`${import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'}/applications/${applicationId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setApplication(data.data)
          
          if (data.data.job_id) {
            const jobResponse = await apiRequest(API_ENDPOINTS.GET_JOB_BY_ID(data.data.job_id))
            if (jobResponse.ok) {
              const jobData = await jobResponse.json()
              setJob(jobData.data)
            }
          }
        }
      } else {
        const jobIdMatch = window.location.pathname.match(/jobs\/([^\/]+)\//)
        if (jobIdMatch) {
          const jobId = jobIdMatch[1]
          const candidatesResponse = await apiRequest(API_ENDPOINTS.GET_TOP_CANDIDATES(jobId))
          
          if (candidatesResponse.ok) {
            const candidatesData = await candidatesResponse.json()
            const foundApplication = candidatesData.data?.find((app: Application) => app.id === applicationId)
            
            if (foundApplication) {
              setApplication(foundApplication)
              
              const jobResponse = await apiRequest(API_ENDPOINTS.GET_JOB_BY_ID(foundApplication.job_id))
              if (jobResponse.ok) {
                const jobData = await jobResponse.json()
                setJob(jobData.data)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch application details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!application || newStatus === application.application_status) return
    
    setSelectedStatus(newStatus)
    setIsSavingStatus(true)
    setStatusSaveMessage('')
    
    try {
      const response = await apiRequest(`${import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'}/applications/${applicationId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          application_status: newStatus
        })
      })
      
      if (response.ok) {
        setApplication(prev => prev ? { ...prev, application_status: newStatus } : prev)
        setStatusSaveMessage('Status updated successfully')
        setTimeout(() => setStatusSaveMessage(''), 3000)
      } else {
        setSelectedStatus(application.application_status)
        setStatusSaveMessage('Failed to update status')
        setTimeout(() => setStatusSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      setSelectedStatus(application.application_status)
      setStatusSaveMessage('Error updating status')
      setTimeout(() => setStatusSaveMessage(''), 3000)
    } finally {
      setIsSavingStatus(false)
    }
  }
  
  const handleAddNote = async () => {
    if (!newNote.trim() || !application) return
    
    setIsAddingNote(true)
    try {
      const response = await apiRequest(API_ENDPOINTS.ADD_NOTE(applicationId!), {
        method: 'POST',
        body: JSON.stringify({
          recruiter_id: user.id,
          note: newNote.trim()
        })
      })
      
      if (response.ok) {
        const newNoteObj = {
          recruiter_id: user.id,
          note: newNote.trim(),
          created_at: new Date().toISOString()
        }
        
        setApplication(prev => prev ? {
          ...prev,
          notes: [...(prev.notes || []), newNoteObj]
        } : prev)
        
        setNewNote('')
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setIsAddingNote(false)
    }
  }
  
  const handleDownloadResume = async () => {
    if (!application) return
    
    try {
      const response = await fetch(API_ENDPOINTS.GET_RESUME(application.resume_file_id))
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `resume_${application.resume_file_id}.pdf`
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

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SHORTLISTED':
        return 'shortlisted'
      case 'REJECTED':
        return 'rejected'
      case 'PENDING':
      case 'REVIEWING':
        return 'pending'
      default:
        return ''
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
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading application details...</p>
      </div>
    )
  }
  
  if (!application) {
    return (
      <div className="error-container">
        <h2>Application not found</h2>
        <button onClick={() => navigate('/recruiter/applications')}>
          Back to Applications
        </button>
      </div>
    )
  }
  
  return (
    <div className="application-detail">
      <div className="detail-header">
        <button 
          className="back-btn" 
          onClick={() => navigate(-1)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
          Back
        </button>
        
        <div className="header-actions">
          <select 
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isSavingStatus}
            className={`status-select ${getStatusClass(selectedStatus)}`}
          >
            <option value="APPLIED">Applied</option>
            <option value="REVIEWING">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer Extended</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          <button 
            className="download-btn"
            onClick={handleDownloadResume}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Resume
          </button>
        </div>
      </div>

      <div className="detail-container">
        <div className="application-header">
          <div className="applicant-info">
            <h1>Application Details</h1>
            {job && (
              <>
                <p className="job-info">{job.title} - {job.location}</p>
                <p className="application-date">Applied {formatDate(application.created_at)}</p>
              </>
            )}
          </div>
          
          {application.match_result && (
            <div className="score-display">
              <div 
                className="score-circle"
                style={{ 
                  background: getScoreColor(application.match_result.score)
                }}
              >
                <span className="score-value">{application.match_result.score}%</span>
                <span className="score-label">Match</span>
              </div>
            </div>
          )}
        </div>

        <div className="detail-content">
          <div className="main-section">
            {application.match_result && (
              <div className="match-analysis">
                <h2>AI Match Analysis</h2>
                
                {application.match_result.explanation && (
                  <div className="analysis-section">
                    <h3>Summary</h3>
                    <p>{application.match_result.explanation}</p>
                  </div>
                )}
                
                {application.match_result.matched_skills && application.match_result.matched_skills.length > 0 && (
                  <div className="analysis-section">
                    <h3>Matched Skills</h3>
                    <div className="skills-grid">
                      {application.match_result.matched_skills.map((skill, index) => (
                        <span key={index} className="skill-badge matched">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {application.match_result.transferable_skills && application.match_result.transferable_skills.length > 0 && (
                  <div className="analysis-section">
                    <h3>Transferable Skills</h3>
                    <div className="skills-grid">
                      {application.match_result.transferable_skills.map((skill, index) => (
                        <span key={index} className="skill-badge matched">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {application.questions && application.answers && application.questions.length > 0 && (
              <div className="screening-answers">
                <h2>Application Questions & Answers</h2>
                {application.questions.map((q, index) => {
                  const answer = application.answers?.find(a => a.questionNo === q.questionNo)
                  return (
                    <div key={index} className="qa-item">
                      <p className="question">Q{q.questionNo}: {q.question}</p>
                      <p className="answer">{answer?.answer || 'No answer provided'}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {application.resume_text && (
              <div className="screening-answers">
                <h2>Resume Preview</h2>
                <div className="qa-item">
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {application.resume_text.substring(0, 500)}...
                  </pre>
                  <button 
                    className="download-btn"
                    onClick={handleDownloadResume}
                    style={{ marginTop: '16px' }}
                  >
                    View Full Resume
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="notes-section">
              <h2>Recruiter Notes</h2>
              
              {isSavingStatus && (
                <div className="note-item" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                  Updating status...
                </div>
              )}
              
              {statusSaveMessage && (
                <div className={`note-item ${statusSaveMessage.includes('success') ? 'success' : 'error'}`}>
                  {statusSaveMessage}
                </div>
              )}

              <div className="notes-list">
                {application.notes && application.notes.length > 0 ? (
                  application.notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <p className="note-text">{note.note}</p>
                      <p className="note-meta">{formatDate(note.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-notes">No notes yet</p>
                )}
              </div>
              
              <div className="add-note">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this candidate..."
                  disabled={isAddingNote}
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  className="add-note-btn"
                >
                  {isAddingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>

            <div className="actions-section">
              <h3>Quick Actions</h3>
              <button className="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Interview
              </button>
              <button className="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </button>
              <button className="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v6m-4 0h8M12 3v6M8 7h8M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                </svg>
                Export Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetail