import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import styles from '../styles/jobseeker-search.module.css'

interface Job {
  id: string
  _id?: string
  recruiter_id?: string
  title: string
  company?: string
  location: string
  salary?: string
  salary_range?: {
    min: number
    max: number
  }
  type?: string
  job_type?: string
  experience_level?: string
  skills_required?: string[]
  created_at: string
  status?: string
}

const JobSeekerSearch = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])

  useEffect(() => {
    fetchAllJobs()
    fetchAppliedJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchQuery, location, experienceLevel, appliedJobIds])

  const fetchCompanyName = async (recruiterId: string): Promise<string> => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'
      const response = await apiRequest(`${API_BASE_URL}/users/${recruiterId}`)
      if (response.ok) {
        const data = await response.json()
        return data.data?.company || 'Company Name'
      }
    } catch (error) {
      console.error('Failed to fetch company name:', error)
    }
    return 'Company Name'
  }

  const fetchAppliedJobs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user._id || user.id
      const response = await apiRequest(API_ENDPOINTS.GET_APPLICATIONS_BY_JOBSEEKER(userId))
      
      if (response.ok) {
        const data = await response.json()
        const applications = data.data || []
        const jobIds = applications.map((app: any) => app.job_id)
        setAppliedJobIds(jobIds)
      }
    } catch (error) {
      console.error('Failed to fetch applied jobs:', error)
    }
  }

  const fetchAllJobs = async () => {
    setIsLoading(true)
    try {
      const response = await apiRequest(API_ENDPOINTS.SEARCH_JOBS, {
        method: 'POST',
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        const jobsList = data.data?.results || data.data || []
        
        const jobsWithCompanies = await Promise.all(
          jobsList.map(async (job: any) => {
            let companyName = 'Company Name'
            if (job.recruiter_id) {
              companyName = await fetchCompanyName(job.recruiter_id)
            }
            
            return {
              id: job.id || job._id,
              recruiter_id: job.recruiter_id,
              title: job.title,
              company: companyName,
              location: job.location,
              salary: job.salary,
              type: job.type,
              experience_level: job.experience_level,
              skills_required: job.skills_required || [],
              created_at: job.created_at,
              status: job.status
            }
          })
        )
        
        setJobs(jobsWithCompanies)
        setFilteredJobs(jobsWithCompanies)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchJobs = async () => {
    setIsLoading(true)
    try {
      const filters: any = {}
      
      if (searchQuery) filters.keyword = searchQuery
      if (location) filters.location = location
      if (experienceLevel) filters.experience_level = experienceLevel
      
      const response = await apiRequest(API_ENDPOINTS.SEARCH_JOBS, {
        method: 'POST',
        body: JSON.stringify(filters)
      })

      if (response.ok) {
        const data = await response.json()
        const jobsList = data.data?.results || data.data || []
        
        const jobsWithCompanies = await Promise.all(
          jobsList.map(async (job: any) => {
            let companyName = 'Company Name'
            if (job.recruiter_id) {
              companyName = await fetchCompanyName(job.recruiter_id)
            }
            
            return {
              id: job.id || job._id,
              recruiter_id: job.recruiter_id,
              title: job.title,
              company: companyName,
              location: job.location,
              salary: job.salary,
              type: job.type,
              experience_level: job.experience_level,
              skills_required: job.skills_required || [],
              created_at: job.created_at,
              status: job.status
            }
          })
        )
        
        setJobs(jobsWithCompanies)
      }
    } catch (error) {
      console.error('Failed to search jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = [...jobs]

    filtered = filtered.filter(job => !appliedJobIds.includes(job.id))

    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills_required?.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (experienceLevel) {
      filtered = filtered.filter(job =>
        job.experience_level === experienceLevel
      )
    }

    setFilteredJobs(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchJobs()
  }

  const handleViewDetails = (jobId: string) => {
    navigate(`/jobseeker/job/${jobId}`)
  }

  const formatSalary = (job: Job) => {
    if (job.salary) {
      const amount = parseInt(job.salary)
      if (amount > 0) {
        return `$${(amount / 1000).toFixed(0)}k`
      }
    }
    return 'Salary not disclosed'
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    return `${diffInDays} days ago`
  }

  return (
    <div className={styles.jobseekerSearch}>
      <div className={styles.searchHeader}>
        <h1>Search Jobs</h1>
        <p>Find your perfect job match</p>
      </div>

      <div className={styles.searchControls}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputGroup}>
            <input
              type="text"
              placeholder="Search by job title, skills, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" fill="#6b7280"/>
            </svg>
          </div>

          <div className={styles.locationInputGroup}>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.locationInput}
            />
            <svg className={styles.locationIcon} width="20" height="20" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill="#6b7280"/>
            </svg>
          </div>

          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      </div>

      <div className={styles.jobsContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Searching for jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobCardHeader}>
                <div className={styles.companyLogo}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#5b5fc7">
                    <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                  </svg>
                </div>
                <div className={styles.jobMainInfo}>
                  <h3>{job.title}</h3>
                  <p className={styles.companyName}>{job.company}</p>
                  <div className={styles.jobMeta}>
                    <span className={styles.location}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                      </svg>
                      {job.location}
                    </span>
                    <span className={styles.salary}>{formatSalary(job)}</span>
                    <span className={styles.posted}>• {getDaysAgo(job.created_at)}</span>
                  </div>
                </div>
              </div>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className={styles.jobSkills}>
                  {job.skills_required.slice(0, 5).map((skill, index) => (
                    <span key={index} className={styles.skillTag}>{skill}</span>
                  ))}
                  {job.skills_required.length > 5 && (
                    <span className={`${styles.skillTag} ${styles.more}`}>+{job.skills_required.length - 5}</span>
                  )}
                </div>
              )}

              <div className={styles.jobActions}>
                <button 
                  className={styles.btnViewDetails}
                  onClick={() => handleViewDetails(job.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#d1d5db">
              <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3ZM7 7H17V5H19V19H5V5H7V7Z"/>
            </svg>
            <h3>No jobs found</h3>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobSeekerSearch;