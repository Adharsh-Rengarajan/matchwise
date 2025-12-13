import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import styles from '../styles/jobseeker-job-detail.module.css'

interface Job {
  id: string
  _id?: string
  title: string
  description: string
  location: string
  type: string
  salary: string
  start_date: string
  end_date?: string
  skills_required: string[]
  status: string
  questions?: Array<{
    questionNo: number
    question: string
  }>
  created_at: string
  updated_at: string
  recruiter_id: string
}

interface MatchResult {
  score: number
  matched_skills?: string[]
  missing_skills?: string[]
  transferable_skills?: string[]
  explanation?: string
}

const JobSeekerJobDetail = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id || user._id || user.userId

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stage, setStage] = useState<'upload' | 'analyzing' | 'result'>('upload')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [existingApplicationStatus, setExistingApplicationStatus] = useState<string | null>(null)
  const [questionAnswers, setQuestionAnswers] = useState<{ [key: number]: string }>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (jobId) {
      fetchJobDetails()
      checkApplicationStatus()
    }
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest(API_ENDPOINTS.GET_JOB_BY_ID(jobId!))

      if (response.ok) {
        const data = await response.json()
        setJob(data.data || data)
      } else {
        setError('Failed to load job details')
      }
    } catch (err) {
      console.error('Error fetching job:', err)
      setError('Failed to load job details')
    } finally {
      setIsLoading(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.GET_APPLICATIONS_BY_JOBSEEKER(userId))

      if (response.ok) {
        const data = await response.json()
        const applications = Array.isArray(data.data) ? data.data : []
        const existing = applications.find((app: any) => app.job_id === jobId)

        if (existing) {
          setApplicationId(existing.id || existing._id)
          setExistingApplicationStatus(existing.application_status)

          if (existing.match_result) {
            setMatchResult(existing.match_result)
          }

          if (existing.application_status === 'PENDING') {
            setHasApplied(false)
            if (existing.match_result) {
              setStage('result')
            }
          } else {
            setHasApplied(true)
            setStage('result')
          }
        }
      }
    } catch (err) {
      console.error('Error checking application status:', err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setResumeFile(file)
      setError('')
    }
  }

  const handleAnalyzeResume = async () => {
    if (!resumeFile) {
      setError('Please upload a resume first')
      return
    }

    if (!job) {
      setError('Job details not loaded')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setStage('analyzing')

    try {
      const formData = new FormData()
      formData.append('job_id', jobId!)
      formData.append('jobseeker_id', userId)
      formData.append('resume', resumeFile)
      formData.append('application_status', 'PENDING')

      const jobQuestions = job.questions || []
      const answersArray = jobQuestions.map((q) => ({
        questionNo: q.questionNo,
        answer: questionAnswers[q.questionNo] || ''
      }))

      formData.append('answers', JSON.stringify(answersArray))

      const response = await apiRequest(API_ENDPOINTS.CREATE_APPLICATION, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        const applicationData = data.data || data
        setApplicationId(applicationData.id || applicationData._id)
        setExistingApplicationStatus('PENDING')

        if (applicationData.match_result) {
          setMatchResult(applicationData.match_result)
        }

        setStage('result')
      } else {
        let errorMessage = 'Failed to analyze resume'

        if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (data.detail && typeof data.detail === 'object') {
          errorMessage = 'Invalid request. Please check your answers and try again.'
        }

        if (errorMessage.includes('already')) {
          setError('You have already applied for this job')
          setHasApplied(true)
        } else {
          setError(errorMessage)
        }
        setStage('upload')
      }
    } catch (err) {
      console.error('Error analyzing resume:', err)
      setError('Failed to analyze resume. Please try again.')
      setStage('upload')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApplyNow = async () => {
    if (!applicationId) {
      setError('Application not found')
      return
    }

    try {
      const response = await apiRequest(API_ENDPOINTS.UPDATE_APPLICATION_STATUS(applicationId), {
        method: 'PATCH',
        body: JSON.stringify({
          application_status: 'APPLIED'
        })
      })

      if (response.ok) {
        setHasApplied(true)
        setExistingApplicationStatus('APPLIED')
        alert('Application submitted successfully!')
        setTimeout(() => {
          navigate('/jobseeker/applications')
        }, 1500)
      } else {
        setError('Failed to submit application')
      }
    } catch (err) {
      console.error('Error applying:', err)
      setError('Failed to submit application')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  const formatSalary = (salary?: string) => {
    if (!salary || salary === '') return 'Not specified'
    const salaryNum = parseFloat(salary)
    if (isNaN(salaryNum) || salaryNum === 0) return 'Not specified'
    return `$${(salaryNum / 1000).toFixed(0)}k`
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading job details...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className={styles.errorContainer}>
        <h2>Job not found</h2>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  if (hasApplied && stage !== 'result') {
    return (
      <div className={styles.alreadyAppliedContainer}>
        <h2>Already Applied</h2>
        <p>You have already applied for this job</p>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className={styles.jobTitle}>{job.title}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.jobHeaderInfo}>
            <h2>{job.title}</h2>
            <p className={styles.location}>
              📍 {job.location} • Posted {formatDate(job.created_at)}
            </p>
          </div>
        </div>

        <div className={styles.jobDetailsGrid}>
          <div className={styles.detailsSection}>
            <h3>Job Details</h3>
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Employment Type</span>
                <span className={styles.detailValue}>{job.type}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Work Location</span>
                <span className={styles.detailValue}>{job.location}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Salary</span>
                <span className={styles.detailValue}>{formatSalary(job.salary)}</span>
              </div>
            </div>
          </div>

          <div className={styles.skillsSection}>
            <h3>Required Skills</h3>
            <div className={styles.skillsList}>
              {job.skills_required && job.skills_required.length > 0 ? (
                job.skills_required.map((skill, index) => (
                  <span key={index} className={styles.skillBadge}>
                    {skill}
                  </span>
                ))
              ) : (
                <p>No specific skills listed</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.descriptionSection}>
          <h3>Job Description</h3>
          <p className={styles.description}>{job.description}</p>
        </div>

        {stage === 'upload' && !hasApplied && (
          <div className={styles.applicationSection}>
            <h3>Application</h3>
            <div className={styles.uploadContainer}>
              <label htmlFor="resume-upload" className={styles.uploadLabel}>
                Resume *
              </label>
              <div className={styles.fileInput}>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className={styles.input}
                />
                <span className={styles.fileName}>
                  {resumeFile ? resumeFile.name : 'No file chosen'}
                </span>
              </div>
              {error && <p className={styles.errorMessage}>{error}</p>}
            </div>

            {job.questions && job.questions.length > 0 && (
              <div className={styles.questionsContainer}>
                <h4>Application Questions</h4>
                {job.questions.map((q) => (
                  <div key={q.questionNo} className={styles.questionItem}>
                    <label htmlFor={`question-${q.questionNo}`}>
                      {q.question}
                    </label>
                    <textarea
                      id={`question-${q.questionNo}`}
                      value={questionAnswers[q.questionNo] || ''}
                      onChange={(e) =>
                        setQuestionAnswers({
                          ...questionAnswers,
                          [q.questionNo]: e.target.value
                        })
                      }
                      placeholder="Your answer..."
                      className={styles.textarea}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              className={styles.analyzeButton}
              onClick={handleAnalyzeResume}
              disabled={isAnalyzing || !resumeFile}
            >
              {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume & Apply'}
            </button>
          </div>
        )}

        {stage === 'analyzing' && (
          <div className={styles.analyzingSection}>
            <div className={styles.spinner}></div>
            <p>Analyzing your resume</p>
            <p className={styles.analyzeSubtext}>
              Our AI is matching your skills with the job requirements...
            </p>
          </div>
        )}

        {stage === 'result' && matchResult && (
          <div className={styles.resultSection}>
            <h3>Match Analysis</h3>
            <div className={styles.scoreContainer}>
              <div 
                className={styles.scoreCircle}
                style={{ borderColor: getMatchColor(matchResult.score) }}
              >
                <span 
                  className={styles.scoreText}
                  style={{ color: getMatchColor(matchResult.score) }}
                >
                  {matchResult.score}%
                </span>
              </div>
              <div className={styles.scoreDetails}>
                <p className={styles.scoreLabel}>Match Score</p>
                <p className={styles.scoreSubtext}>
                  {matchResult.score >= 80
                    ? 'Great fit for this position!'
                    : matchResult.score >= 60
                      ? 'Good potential match'
                      : 'Consider reviewing the job requirements'}
                </p>
              </div>
            </div>

            {matchResult.matched_skills && matchResult.matched_skills.length > 0 && (
              <div className={styles.skillsMatch}>
                <h4>Matched Skills</h4>
                <div className={styles.skillsList}>
                  {matchResult.matched_skills.map((skill, index) => (
                    <span key={index} className={styles.matchedSkill}>
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchResult.missing_skills && matchResult.missing_skills.length > 0 && (
              <div className={styles.skillsGap}>
                <h4>Skills to Develop</h4>
                <div className={styles.skillsList}>
                  {matchResult.missing_skills.map((skill, index) => (
                    <span key={index} className={styles.missingSkill}>
                      ◯ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchResult.explanation && (
              <div className={styles.explanation}>
                <h4>Analysis</h4>
                <p>{matchResult.explanation}</p>
              </div>
            )}

            {!hasApplied && existingApplicationStatus === 'PENDING' && (
              <button
                className={styles.applyButton}
                onClick={handleApplyNow}
              >
                Apply Now
              </button>
            )}

            {hasApplied && (
              <div className={styles.appliedMessage}>
                <p>✓ You have successfully applied for this position</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobSeekerJobDetail;