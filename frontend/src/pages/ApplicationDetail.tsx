import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import styles from '../styles/application-detail.module.css'

interface Jobseeker {
  userId: string
  name: string
  email: string
  phone: string
  role: string
  skills?: string[]
  experience?: Array<{
    title: string
    company: string
    start_date: string
    end_date?: string
  }>
  education?: Array<{
    degree: string
    institution: string
    start_date: string
    end_date?: string
  }>
}

interface Note {
  note_id: string
  recruiter_id: string
  note: string
  created_at: string
}

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
  notes?: Note[]
  resume_text?: string
}

interface Job {
  id: string
  title: string
  location: string
  skills_required?: string[]
  company?: string
}

const ApplicationDetail = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [application, setApplication] = useState<Application | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [jobseeker, setJobseeker] = useState<Jobseeker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [showReachOutModal, setShowReachOutModal] = useState(false)
  const [reachOutText, setReachOutText] = useState('')
  const [isSendingReachOut, setIsSendingReachOut] = useState(false)
  
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
      const response = await apiRequest(API_ENDPOINTS.GET_APPLICATION_BY_ID(applicationId!))
      
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

          if (data.data.jobseeker_id) {
            const jobseekerResponse = await apiRequest(API_ENDPOINTS.GET_JOBSEEKER_PROFILE(data.data.jobseeker_id))
            if (jobseekerResponse.ok) {
              const jobseekerData = await jobseekerResponse.json()
              setJobseeker(jobseekerData.data)
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
    setStatusMessage('')
    
    try {
      const response = await apiRequest(API_ENDPOINTS.UPDATE_APPLICATION_STATUS(applicationId!), {
        method: 'PATCH',
        body: JSON.stringify({
          application_status: newStatus
        })
      })
      
      if (response.ok) {
        setApplication(prev => prev ? { ...prev, application_status: newStatus } : prev)
        setStatusMessage('Status updated successfully')
        setTimeout(() => setStatusMessage(''), 3000)
      } else {
        setSelectedStatus(application.application_status)
        setStatusMessage('Failed to update status')
        setTimeout(() => setStatusMessage(''), 3000)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      setSelectedStatus(application.application_status)
      setStatusMessage('Error updating status')
      setTimeout(() => setStatusMessage(''), 3000)
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
          recruiter_id: user.id || user.userId,
          note: newNote.trim()
        })
      })
      
      if (response.ok) {
        const responseData = await response.json()
        setApplication(responseData.data)
        setNewNote('')
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.ADD_NOTE(applicationId!)}/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const responseData = await response.json()
        setApplication(responseData.data)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleEditNote = async (noteId: string) => {
    if (!editingNoteText.trim()) return
    
    try {
      const response = await apiRequest(`${API_ENDPOINTS.ADD_NOTE(applicationId!)}/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          note: editingNoteText.trim()
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        setApplication(responseData.data)
        setEditingNoteId(null)
        setEditingNoteText('')
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }
  
  const handleDownloadResume = async () => {
    if (!application) return
    
    try {
      const response = await apiRequest(API_ENDPOINTS.GET_RESUME(application.resume_file_id))
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

  const handleReachOut = async () => {
    if (!reachOutText.trim()) return

    setIsSendingReachOut(true)
    try {
      const response = await apiRequest(API_ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: jobseeker?.userId,
          content: reachOutText,
          message_type: 'text',
          job_context: job?.id,
          application_id: applicationId,
          isOpened: false
        })
      })

      if (response.ok) {
        setReachOutText('')
        setShowReachOutModal(false)
        alert('Message sent successfully!')
        navigate('/recruiter/messages')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    } finally {
      setIsSendingReachOut(false)
    }
  }
  
  const getScoreStyles = (score: number) => {
    return {
      borderColor: '#10b981',
      color: '#10b981'
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

  const formatExperienceDate = (start: string, end?: string) => {
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    if (!end) return `${startDate} - Present`
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${startDate} - ${endDate}`
  }
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading application details...</p>
      </div>
    )
  }
  
  if (!application) {
    return (
      <div className={styles.errorContainer}>
        <h2>Application not found</h2>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    )
  }
  
  return (
    <div className={styles.applicationDetail}>
      <div className={styles.pageHeader}>
        <button 
          className={styles.backBtn} 
          onClick={() => navigate(-1)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
          Back
        </button>
        
        <div className={styles.headerInfo}>
          <h1>Application Details</h1>
          {job && (
            <p className={styles.jobTitle}>{job.title} - {job.location}</p>
          )}
        </div>
      </div>

      <div className={styles.detailContainer}>
        <div className={styles.applicationCard}>
          <div className={styles.cardHeader}>
            <div className={styles.candidateInfo}>
              <p className={styles.candidateName}>{jobseeker?.name || 'Candidate'}</p>
              <p className={styles.candidateEmail}>{jobseeker?.email}</p>
              <p className={styles.applicationDate}>Applied {formatDate(application.created_at)}</p>
            </div>
            
            {application.match_result && (
              <div 
                className={styles.scoreCircle}
                style={getScoreStyles(application.match_result.score)}
              >
                <span className={styles.scoreValue}>{Math.round(application.match_result.score)}%</span>
              </div>
            )}
          </div>

          <div className={styles.cardBody}>
            <div className={styles.statusSection}>
              <label>Application Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isSavingStatus}
                className={styles.statusSelect}
              >
                <option value="APPLIED">Applied</option>
                <option value="REVIEWING">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer Extended</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <button 
              className={styles.btnSecondary}
              onClick={handleDownloadResume}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Resume
            </button>
            <button 
              className={styles.btnSecondary}
              onClick={() => setShowReachOutModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Reach Out
            </button>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            {jobseeker && (
              <div className={styles.sectionCard}>
                <h2>Candidate Profile</h2>
                <div className={styles.profileHeader}>
                  <div className={styles.profileBasic}>
                    <h3>{jobseeker.name}</h3>
                    <p className={styles.email}>{jobseeker.email}</p>
                    <p className={styles.phone}>{jobseeker.phone}</p>
                  </div>
                </div>

                {jobseeker.skills && jobseeker.skills.length > 0 && (
                  <div className={styles.profileSection}>
                    <h4>Skills</h4>
                    <div className={styles.skillsList}>
                      {jobseeker.skills.map((skill, index) => (
                        <span key={index} className={styles.skillBadge}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {jobseeker.experience && jobseeker.experience.length > 0 && (
                  <div className={styles.profileSection}>
                    <h4>Experience</h4>
                    <div className={styles.experienceList}>
                      {jobseeker.experience.map((exp, index) => (
                        <div key={index} className={styles.experienceItem}>
                          <div className={styles.expHeader}>
                            <h5>{exp.title}</h5>
                            <span className={styles.expDate}>{formatExperienceDate(exp.start_date, exp.end_date)}</span>
                          </div>
                          <p className={styles.expCompany}>{exp.company}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {jobseeker.education && jobseeker.education.length > 0 && (
                  <div className={styles.profileSection}>
                    <h4>Education</h4>
                    <div className={styles.educationList}>
                      {jobseeker.education.map((edu, index) => (
                        <div key={index} className={styles.educationItem}>
                          <div className={styles.eduHeader}>
                            <h5>{edu.degree}</h5>
                            <span className={styles.eduDate}>{formatExperienceDate(edu.start_date, edu.end_date)}</span>
                          </div>
                          <p className={styles.eduInstitution}>{edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {application.match_result && (
              <div className={styles.sectionCard}>
                <h2>AI Match Analysis</h2>
                
                {application.match_result.explanation && (
                  <div className={styles.analysisSection}>
                    <h3>Summary</h3>
                    <p>{application.match_result.explanation}</p>
                  </div>
                )}
                
                {application.match_result.matched_skills && application.match_result.matched_skills.length > 0 && (
                  <div className={styles.analysisSection}>
                    <h3>Matched Skills</h3>
                    <div className={styles.skillsGrid}>
                      {application.match_result.matched_skills.map((skill, index) => (
                        <span key={index} className={`${styles.skillBadge} ${styles.matched}`}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {application.match_result.missing_skills && application.match_result.missing_skills.length > 0 && (
                  <div className={styles.analysisSection}>
                    <h3>Missing Skills</h3>
                    <div className={styles.skillsGrid}>
                      {application.match_result.missing_skills.map((skill, index) => (
                        <span key={index} className={`${styles.skillBadge} ${styles.missing}`}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {application.match_result.transferable_skills && application.match_result.transferable_skills.length > 0 && (
                  <div className={styles.analysisSection}>
                    <h3>Transferable Skills</h3>
                    <div className={styles.skillsGrid}>
                      {application.match_result.transferable_skills.map((skill, index) => (
                        <span key={index} className={`${styles.skillBadge} ${styles.transferable}`}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {application.questions && application.answers && application.questions.length > 0 && (
              <div className={styles.sectionCard}>
                <h2>Screening Answers</h2>
                {application.questions.map((q, index) => {
                  const answer = application.answers?.find(a => a.questionNo === q.questionNo)
                  return (
                    <div key={index} className={styles.qaItem}>
                      <p className={styles.question}>Q{q.questionNo}: {q.question}</p>
                      <p className={styles.answer}>{answer?.answer || 'No answer provided'}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className={styles.sidebarSection}>
            <div className={`${styles.sectionCard} ${styles.notesCard}`}>
              <h2>Recruiter Notes</h2>
              
              {statusMessage && (
                <div className={`${styles.message} ${statusMessage.includes('success') ? styles.success : styles.error}`}>
                  {statusMessage}
                </div>
              )}

              <div className={styles.notesList}>
                {application.notes && application.notes.length > 0 ? (
                  application.notes.map((note: Note) => (
                    <div key={note.note_id} className={styles.noteItem}>
                      {editingNoteId === note.note_id ? (
                        <div className={styles.noteEdit}>
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            rows={3}
                          />
                          <div className={styles.noteActions}>
                            <button 
                              className={styles.saveBtn}
                              onClick={() => handleEditNote(note.note_id)}
                            >
                              Save
                            </button>
                            <button 
                              className={styles.cancelBtn}
                              onClick={() => setEditingNoteId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={styles.noteText}>{note.note}</p>
                          <p className={styles.noteMeta}>{formatDate(note.created_at)}</p>
                          <div className={styles.noteButtons}>
                            <button 
                              className={styles.editBtn}
                              onClick={() => {
                                setEditingNoteId(note.note_id)
                                setEditingNoteText(note.note)
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteNote(note.note_id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className={styles.noNotes}>No notes yet</p>
                )}
              </div>
              
              <div className={styles.addNote}>
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
                  className={styles.addNoteBtn}
                >
                  {isAddingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReachOutModal && (
        <div className={styles.reachOutModal}>
          <div className={styles.reachOutContent}>
            <div className={styles.reachOutHeader}>
              <h3>Send Message to {jobseeker?.name}</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowReachOutModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.reachOutBody}>
              <p className={styles.jobContext}>Regarding: {job?.title}</p>
              <textarea
                value={reachOutText}
                onChange={(e) => setReachOutText(e.target.value)}
                placeholder="Write your message here..."
                rows={6}
                className={styles.reachOutTextarea}
              />
            </div>
            <div className={styles.reachOutFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowReachOutModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.sendBtn}
                onClick={handleReachOut}
                disabled={!reachOutText.trim() || isSendingReachOut}
              >
                {isSendingReachOut ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
          <div 
            className={styles.reachOutOverlay}
            onClick={() => setShowReachOutModal(false)}
          />
        </div>
      )}
    </div>
  )
}

export default ApplicationDetail;