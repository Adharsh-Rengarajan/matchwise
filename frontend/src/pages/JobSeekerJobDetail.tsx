import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/jobseeker-job-detail.css'

interface Job {
  id: string
  title: string
  company?: string
  location: string
  job_type?: string
  experience_level?: string
  salary_range?: {
    min: number
    max: number
  }
  skills_required?: string[]
  description?: string
  responsibilities?: string[]
  requirements?: string[]
  benefits?: string[]
  questions?: Array<{
    questionNo: number
    question: string
  }>
  created_at: string
  status?: string
}

interface AIAnalysis {
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  recommendations: string[]
  strengths: string[]
  improvement_areas: string[]
}

const JobSeekerJobDetail = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id || user._id || user.userId
  
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [questionAnswers, setQuestionAnswers] = useState<{[key: number]: string}>({})
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)

  useEffect(() => {
    fetchJobDetails()
    checkApplicationStatus()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'}/jobs/job/${jobId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setJob({
            ...data.data,
            company: data.data.company || 'Company Name',
            questions: data.data.questions || []
          })
          
          const initialAnswers: {[key: number]: string} = {}
          if (data.data.questions) {
            data.data.questions.forEach((q: any) => {
              initialAnswers[q.questionNo] = ''
            })
          }
          setQuestionAnswers(initialAnswers)
        }
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'}/applications/jobseeker/${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          const existingApplication = data.data.find((app: any) => app.job_id === jobId)
          if (existingApplication) {
            setHasApplied(true)
            
            if (existingApplication.match_result) {
              setAiAnalysis({
                match_score: existingApplication.match_result.score || 0,
                matched_skills: existingApplication.match_result.matched_skills || [],
                missing_skills: existingApplication.match_result.missing_skills || [],
                recommendations: existingApplication.match_result.recommendations || [],
                strengths: existingApplication.match_result.strengths || [],
                improvement_areas: existingApplication.match_result.improvement_areas || []
              })
              setHasAnalyzed(true)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to check application status:', error)
    }
  }

  const handleAnalyzeAndApply = async () => {
    if (!resumeFile) {
      alert('Please upload your resume first')
      return
    }

    const unanswered = Object.entries(questionAnswers).filter(([_, answer]) => !answer.trim())
    if (job?.questions && job.questions.length > 0 && unanswered.length > 0) {
      alert('Please answer all questions before applying')
      return
    }

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('job_id', jobId || '')
      formData.append('jobseeker_id', userId)
      formData.append('resume', resumeFile)
      
      const answersArray = job?.questions ? 
        Object.entries(questionAnswers).map(([questionNo, answer]) => ({
          questionNo: parseInt(questionNo),
          answer: answer
        })) : []
      
      formData.append('answers', JSON.stringify(answersArray))
      formData.append('application_status', 'APPLIED')

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'}/applications/`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const applicationData = data.data
        
        if (applicationData.match_result) {
          setAiAnalysis({
            match_score: applicationData.match_result.score || 0,
            matched_skills: applicationData.match_result.matched_skills || [],
            missing_skills: applicationData.match_result.missing_skills || [],
            recommendations: applicationData.match_result.recommendations || [
              'Review your application carefully',
              'Follow up if you don\'t hear back within a week'
            ],
            strengths: applicationData.match_result.strengths || ['Application submitted successfully'],
            improvement_areas: applicationData.match_result.improvement_areas || []
          })
        }
        
        setHasAnalyzed(true)
        setHasApplied(true)
        alert('Application submitted successfully!')
        
        setTimeout(() => {
          navigate('/jobseeker/applications')
        }, 1500)
      } else {
        const errorData = await response.json()
        
        if (errorData.detail?.includes('already')) {
          alert('You have already applied for this job')
          setHasApplied(true)
        } else {
          alert(errorData.detail || 'Failed to submit application. Please try again.')
        }
      }
    } catch (error) {
      console.error('Failed to submit application:', error)
      alert('Failed to submit application. Please check your connection and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveJob = () => {
    setIsSaved(!isSaved)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleAnswerChange = (questionNo: number, answer: string) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionNo]: answer
    }))
  }

  const formatSalary = (min: number, max: number) => {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Posted today'
    if (diffInDays === 1) return 'Posted yesterday'
    return `Posted ${diffInDays} days ago`
  }

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading job details...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="error-state">
        <h2>Job not found</h2>
        <button onClick={() => navigate('/jobseeker/search')}>Back to Search</button>
      </div>
    )
  }

  return (
    <div className="jobseeker-job-detail">
      <div className="job-detail-container">
        <div className="job-header-section">
          <div className="company-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#5b5fc7">
              <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
            </svg>
          </div>
          <div className="job-header-info">
            <h1>{job.title}</h1>
            <p className="company-name">{job.company}</p>
            <div className="job-meta-info">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                </svg>
                {job.location}
              </span>
              {job.salary_range && (
                <span className="meta-item salary">
                  {formatSalary(job.salary_range.min, job.salary_range.max)}
                </span>
              )}
              <span className="meta-item">{getDaysAgo(job.created_at)}</span>
            </div>
          </div>
          <div className="action-buttons-header">
            <button 
              className={`btn-save-job ${isSaved ? 'saved' : ''}`}
              onClick={handleSaveJob}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z"/>
              </svg>
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div className="job-details-grid">
          <div className="details-section">
            <h3>Job Details</h3>
            <div className="details-list">
              <div className="detail-item">
                <span className="detail-label">Experience Level</span>
                <span className="detail-value">{job.experience_level || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Employment Type</span>
                <span className="detail-value">{job.job_type || 'Full-time'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Work Location</span>
                <span className="detail-value">{job.location}</span>
              </div>
            </div>
          </div>

          <div className="skills-section">
            <h3>Required Skills</h3>
            <div className="skills-grid">
              {job.skills_required?.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="description-section">
          <h3>Job Description</h3>
          <p>{job.description || 'No description provided'}</p>
        </div>

        {!hasApplied && (
          <div className="application-section">
            <h3>Application</h3>
            
            <div className="upload-section">
              <label htmlFor="resume-upload">Resume *</label>
              <div className="file-upload-wrapper">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                {resumeFile && (
                  <p className="file-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    </svg>
                    {resumeFile.name}
                  </p>
                )}
              </div>
            </div>

            {job.questions && job.questions.length > 0 && (
              <div className="questions-section">
                <h4>Application Questions</h4>
                {job.questions.map((q) => (
                  <div key={q.questionNo} className="question-item">
                    <label>{q.question} *</label>
                    <textarea
                      value={questionAnswers[q.questionNo] || ''}
                      onChange={(e) => handleAnswerChange(q.questionNo, e.target.value)}
                      placeholder="Your answer..."
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="application-actions">
              <button 
                className="btn-apply"
                onClick={handleAnalyzeAndApply}
                disabled={isAnalyzing || !resumeFile || (job.questions && job.questions.length > 0 && Object.values(questionAnswers).some(a => !a.trim()))}
              >
                {isAnalyzing ? (
                  <>
                    <div className="small-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  'Apply Now'
                )}
              </button>
            </div>
          </div>
        )}

        {hasApplied && aiAnalysis && (
          <div className="ai-analysis-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#5b5fc7">
                <path d="M12 2L2 7L12 12L22 7L12 2ZM12 17L2 12V17L12 22L22 17V12L12 17Z"/>
              </svg>
              Your Application Status
            </h3>
            
            <div className="applied-status">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#10b981">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
              </svg>
              <span>Application Submitted Successfully</span>
            </div>

            {aiAnalysis.match_score > 0 && (
              <>
                <div className="match-score-display">
                  <div className="score-circle-large">
                    <span className="score-value">{aiAnalysis.match_score}%</span>
                    <span className="score-label">Match Score</span>
                  </div>
                  <div className="score-description">
                    Your profile matches {aiAnalysis.match_score}% of the job requirements
                  </div>
                </div>

                {aiAnalysis.matched_skills.length > 0 && (
                  <div className="analysis-details">
                    <div className="analysis-section">
                      <h4>Matched Skills</h4>
                      <div className="skills-matched">
                        {aiAnalysis.matched_skills.map((skill, index) => (
                          <span key={index} className="skill-tag matched">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                            </svg>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <button 
              className="btn-view-application"
              onClick={() => navigate('/jobseeker/applications')}
            >
              View All Applications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobSeekerJobDetail