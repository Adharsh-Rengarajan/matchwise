import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/jobseeker-dashboard.module.css'
import { API_ENDPOINTS, apiRequest } from '../config/api'

interface Application {
  id: string
  _id: string
  job_id: string
  job: {
    title: string
    company: string
    location: string
  }
  status: string
  matchScore: number
  appliedAt: string
}

interface DashboardStats {
  totalApplications: number
  avgMatchScore: number
  pendingStatus: number
  profileStrength: number
}

const JobSeekerDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    avgMatchScore: 0,
    pendingStatus: 0,
    profileStrength: 0
  })
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchCompanyName = async (recruiterId: string): Promise<string> => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.LOGIN.split('/auth')[0]}/users/${recruiterId}`
      )
      if (response.ok) {
        const data = await response.json()
        return data.data?.company || 'Company'
      }
    } catch (error) {
      console.error('Failed to fetch company name:', error)
    }
    return 'Company'
  }

  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const token = localStorage.getItem('token')
      const userId = user._id || user.id

      const response = await apiRequest(
        API_ENDPOINTS.GET_APPLICATIONS_BY_JOBSEEKER(userId),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      const applications = data.data || []

      const totalApplications = applications.length
      const avgMatchScore = totalApplications > 0
        ? Math.round(applications.reduce((sum: number, app: any) => sum + (app.match_result?.score || 0), 0) / totalApplications)
        : 0
      const pendingStatus = applications.filter((app: any) => ['APPLIED', 'REVIEWING'].includes(app.application_status)).length
      const profileStrength = calculateProfileStrength()

      setStats({
        totalApplications,
        avgMatchScore,
        pendingStatus,
        profileStrength
      })

      const recentApps = await Promise.all(
        applications.slice(0, 5).map(async (app: any) => {
          try {
            const jobResponse = await apiRequest(API_ENDPOINTS.GET_JOB_BY_ID(app.job_id))
            let jobData = null
            let companyName = 'Company'

            if (jobResponse.ok) {
              const jobJson = await jobResponse.json()
              jobData = jobJson.data
              
              if (jobData?.recruiter_id) {
                companyName = await fetchCompanyName(jobData.recruiter_id)
              }
            }

            return {
              id: app._id || app.id,
              _id: app._id,
              job_id: app.job_id,
              job: {
                title: jobData?.title || 'Job Position',
                company: companyName,
                location: jobData?.location || 'Location'
              },
              status: app.application_status,
              matchScore: app.match_result?.score || 0,
              appliedAt: app.created_at
            }
          } catch (error) {
            console.error('Failed to fetch job details for application:', error)
            return {
              id: app._id || app.id,
              _id: app._id,
              job_id: app.job_id,
              job: {
                title: 'Job Position',
                company: 'Company',
                location: 'Location'
              },
              status: app.application_status,
              matchScore: app.match_result?.score || 0,
              appliedAt: app.created_at
            }
          }
        })
      )

      setRecentApplications(recentApps)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setStats({
        totalApplications: 0,
        avgMatchScore: 0,
        pendingStatus: 0,
        profileStrength: 0
      })
      setRecentApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProfileStrength = () => {
    return 75
  }

  const handleSearchJobs = () => {
    navigate('/jobseeker/search')
  }

  const handleViewApplications = () => {
    navigate('/jobseeker/applications')
  }

  const handleApplicationClick = (jobId: string) => {
    navigate(`/jobseeker/job/${jobId}`)
  }

  const getStatusColor = (status: string = '') => {
    const normalizedStatus = (status || 'APPLIED').toUpperCase()
    switch (normalizedStatus) {
      case 'SHORTLISTED': return '#10b981'
      case 'INTERVIEW': return '#3b82f6'
      case 'OFFER': return '#8b5cf6'
      case 'HIRED': return '#22c55e'
      case 'REJECTED': return '#ef4444'
      case 'REVIEWING': return '#f59e0b'
      case 'APPLIED': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string = '') => {
    const normalizedStatus = (status || 'APPLIED').toUpperCase()
    switch (normalizedStatus) {
      case 'APPLIED': return 'Applied'
      case 'REVIEWING': return 'Under Review'
      case 'SHORTLISTED': return 'Shortlisted'
      case 'INTERVIEW': return 'Interview'
      case 'OFFER': return 'Offer'
      case 'HIRED': return 'Hired'
      case 'REJECTED': return 'Not Selected'
      default: return normalizedStatus
    }
  }

  if (isLoading) {
    return (
      <div className={styles.dashboardLoading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className={styles.jobseekerDashboard}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your job search overview</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>TOTAL APPLICATIONS</p>
            <p className={styles.statValue}>{stats.totalApplications}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
              <path d="M9 13h2M9 17h2M13 13h2M13 17h2"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>AVERAGE MATCH SCORE</p>
            <p className={styles.statValue}>{stats.avgMatchScore}%</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>PENDING STATUS</p>
            <p className={styles.statValue}>{stats.pendingStatus}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>PROFILE STRENGTH</p>
            <p className={styles.statValue}>{stats.profileStrength}%</p>
          </div>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.quickActions}>
          <h3>Quick Actions</h3>
          <button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleSearchJobs}>
            Search Jobs
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleViewApplications}>
            View Applications
          </button>
        </div>

        <div className={styles.recentApplications}>
          <h3>Recent Applications</h3>
          {recentApplications.length > 0 ? (
            <div className={styles.applicationsList}>
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className={styles.applicationItem}
                  onClick={() => handleApplicationClick(app.job_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.appInfo}>
                    <h4>{app.job.title}</h4>
                    <p className={styles.companyLocation}>• {app.job.company}</p>
                    <p className={styles.companyLocation}>• {app.job.location}</p>
                  </div>
                  <div className={styles.appStats}>
                    <span className={styles.matchScore} style={{ color: getStatusColor(app.status) }}>
                      {app.matchScore}%
                    </span>
                    <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(app.status) }}>
                      {getStatusText(app.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noApplications}>No applications yet. Start by searching for jobs!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobSeekerDashboard;