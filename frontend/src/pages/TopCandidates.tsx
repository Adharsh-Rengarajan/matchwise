import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import styles from '../styles/top-candidates.module.css'

interface JobseekerData {
  userId?: string
  id?: string
  name: string
  email: string
}

interface Candidate {
  id: string
  job_id: string
  jobseeker_id: string
  resume_file_id: string
  application_status: string
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
  jobseeker?: JobseekerData
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
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null)

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
        const candidatesList = candidatesData.data

        const candidatesWithJobseekerInfo = await Promise.all(
          candidatesList.map(async (candidate: Candidate) => {
            try {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'
              const jobseekerResponse = await apiRequest(`${baseUrl}/users/${candidate.jobseeker_id}`)

              if (jobseekerResponse.ok) {
                const jobseekerData = await jobseekerResponse.json()
                if (jobseekerData.data) {
                  return {
                    ...candidate,
                    jobseeker: {
                      userId: jobseekerData.data.userId || jobseekerData.data.id,
                      name: jobseekerData.data.name,
                      email: jobseekerData.data.email
                    }
                  }
                }
              }
              return candidate
            } catch (error) {
              console.error(`Failed to fetch jobseeker ${candidate.jobseeker_id}:`, error)
              return candidate
            }
          })
        )

        setCandidates(candidatesWithJobseekerInfo)
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
      filtered = filtered.filter(c => c.application_status?.toUpperCase() === filterStatus.toUpperCase())
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
    setUpdatingCandidateId(candidateId)
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'
      const response = await apiRequest(`${baseUrl}/applications/${candidateId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          application_status: newStatus
        })
      })

      if (response.ok) {
        setCandidates(candidates.map(c =>
          c.id === candidateId ? { ...c, application_status: newStatus } : c
        ))
      } else {
        const errorData = await response.json()
        console.error('Status update failed:', errorData)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdatingCandidateId(null)
    }
  }

  const handleViewApplication = (candidateId: string) => {
    navigate(`/recruiter/applications/${candidateId}`)
  }

  const handleDownloadResume = async (fileId: string) => {
  try {
    const response = await apiRequest(API_ENDPOINTS.GET_RESUME(fileId))
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
    try {
      const date = new Date(dateString)

      if (isNaN(date.getTime())) {
        return 'N/A'
      }

      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()

      if (diffInMs < 0) {
        return 'Just now'
      }

      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInHours < 1) {
        return 'Just now'
      }
      if (diffInHours < 24) {
        return `${diffInHours}h ago`
      }
      if (diffInDays < 7) {
        return `${diffInDays}d ago`
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    } catch {
      return 'N/A'
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading candidates...</p>
      </div>
    )
  }

  return (
    <div className={styles.topCandidates}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate(`/recruiter/jobs/${jobId}`)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
          Back to Job Details
        </button>
        <div className={styles.headerInfo}>
          <h1>Top Candidates</h1>
          {job && <p className={styles.jobTitle}>{job.title} - {job.location}</p>}
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Candidates</option>
            <option value="APPLIED">Applied</option>
            <option value="REVIEWING">Pending Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="score">Match Score</option>
            <option value="date">Application Date</option>
          </select>
        </div>
        <div className={styles.candidatesCount}>
          {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className={styles.noCandidates}>
          <p>No candidates found with the selected filters.</p>
        </div>
      ) : (
        <div className={styles.candidatesGrid}>
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className={styles.candidateCard}>
              <div className={styles.cardHeader}>
                <div className={styles.candidateInfo}>
                  <h3 className={styles.candidateName}>{candidate.jobseeker?.name || 'N/A'}</h3>
                  <p className={styles.candidateEmail}>{candidate.jobseeker?.email || 'N/A'}</p>
                  <p className={styles.applicationDate}>{formatDate(candidate.created_at)}</p>
                </div>
                <div className={styles.scoreCircle} style={{ backgroundColor: getScoreColor(candidate.match_result?.score || 0) }}>
                  <span className={styles.scoreValue}>{Math.round(candidate.match_result?.score || 0)}%</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.statusSection}>
                  <label>Status:</label>
                  <select
                    value={candidate.application_status || 'APPLIED'}
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                    disabled={updatingCandidateId === candidate.id}
                    className={styles.statusSelect}
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="REVIEWING">Pending Review</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

              </div>
              
              <div className={styles.cardFooter}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleViewApplication(candidate.id)}
                >
                  View Details
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={() => handleDownloadResume(candidate.resume_file_id)}
                >
                  Download Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TopCandidates;