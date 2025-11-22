const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER_RECRUITER: `${API_BASE_URL}/recruiters/register`,
  REGISTER_JOBSEEKER: `${API_BASE_URL}/jobseekers/register`,
  
  // Recruiter endpoints
  GET_JOBS_BY_RECRUITER: (recruiterId: string) => `${API_BASE_URL}/jobs/${recruiterId}`,
  CREATE_JOB: `${API_BASE_URL}/jobs`,
  UPDATE_JOB_STATUS: `${API_BASE_URL}/jobs`,
  
  // Job endpoints (shared)
  GET_JOB_BY_ID: (jobId: string) => `${API_BASE_URL}/jobs/job/${jobId}`,
  GET_ALL_JOBS: `${API_BASE_URL}/jobs/all`,
  SEARCH_JOBS: `${API_BASE_URL}/jobs/search`,
  GET_TOP_CANDIDATES: (jobId: string) => `${API_BASE_URL}/jobs/${jobId}/top-candidates`,
  
  // Application endpoints
  CREATE_APPLICATION: `${API_BASE_URL}/applications`,
  GET_APPLICATION_BY_ID: (applicationId: string) => `${API_BASE_URL}/applications/${applicationId}`,
  GET_APPLICATIONS_BY_JOBSEEKER: (jobseekerId: string) => `${API_BASE_URL}/applications/jobseeker/${jobseekerId}`,
  UPDATE_APPLICATION_STATUS: (applicationId: string) => `${API_BASE_URL}/applications/${applicationId}`,
  GET_RESUME: (fileId: string) => `${API_BASE_URL}/applications/resume/${fileId}`,
  
  // JobSeeker profile endpoints
  GET_JOBSEEKER_PROFILE: (jobseekerId: string) => `${API_BASE_URL}/jobseekers/${jobseekerId}`,
  UPDATE_JOBSEEKER_PROFILE: (jobseekerId: string) => `${API_BASE_URL}/jobseekers/${jobseekerId}`,
  
  // Recruiter specific
  ADD_NOTE: (applicationId: string) => `${API_BASE_URL}/recruiters/applications/${applicationId}/notes`,
  
  // Messages (if backend supports)
  GET_MESSAGES: (userId: string) => `${API_BASE_URL}/messages/${userId}`,
  SEND_MESSAGE: `${API_BASE_URL}/messages`,
}

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'MatchWise',
  TAGLINE: import.meta.env.VITE_APP_TAGLINE || 'AI-driven Job Matching Platform',
  ENABLE_RESUME_UPLOAD: import.meta.env.VITE_ENABLE_RESUME_UPLOAD !== 'false',
  ENABLE_REMEMBER_ME: import.meta.env.VITE_ENABLE_REMEMBER_ME !== 'false',
}

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const defaultHeaders: any = {}
    
    // Only set Content-Type for JSON payloads (not FormData)
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json'
    }
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}