const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER_RECRUITER: `${API_BASE_URL}/recruiters/register`,
  REGISTER_JOBSEEKER: `${API_BASE_URL}/jobseekers/register`,
  
  GET_JOBS_BY_RECRUITER: (recruiterId: string) => `${API_BASE_URL}/jobs/${recruiterId}`,
  CREATE_JOB: `${API_BASE_URL}/jobs`,
  UPDATE_JOB_STATUS: `${API_BASE_URL}/jobs`,
  
  GET_JOB_BY_ID: (jobId: string) => `${API_BASE_URL}/jobs/job/${jobId}`,
  GET_ALL_JOBS: `${API_BASE_URL}/jobs/all`,
  SEARCH_JOBS: `${API_BASE_URL}/jobs/search`,
  GET_TOP_CANDIDATES: (jobId: string) => `${API_BASE_URL}/jobs/${jobId}/top-candidates`,
  
  CREATE_APPLICATION: `${API_BASE_URL}/applications`,
  GET_APPLICATION_BY_ID: (applicationId: string) => `${API_BASE_URL}/applications/${applicationId}`,
  GET_APPLICATIONS_BY_JOBSEEKER: (jobseekerId: string) => `${API_BASE_URL}/applications/jobseeker/${jobseekerId}`,
  UPDATE_APPLICATION_STATUS: (applicationId: string) => `${API_BASE_URL}/applications/${applicationId}`,
  GET_RESUME: (fileId: string) => `${API_BASE_URL}/applications/resume/${fileId}`,
  
  GET_JOBSEEKER_PROFILE: (jobseekerId: string) => `${API_BASE_URL}/jobseekers/${jobseekerId}`,
  UPDATE_JOBSEEKER_PROFILE: (jobseekerId: string) => `${API_BASE_URL}/jobseekers/${jobseekerId}`,
  
  ADD_NOTE: (applicationId: string) => `${API_BASE_URL}/recruiters/applications/${applicationId}/notes`,
  
  SEND_MESSAGE: `${API_BASE_URL}/messages/`,
  GET_MESSAGES: (conversationId: string) => `${API_BASE_URL}/messages/${conversationId}`,
  GET_CONVERSATION: (user1: string, user2: string) => `${API_BASE_URL}/messages/${user1}/${user2}`,
  GET_RECRUITER_CONVERSATIONS: (recruiterId: string) => `${API_BASE_URL}/messages/recruiter/${recruiterId}`,
  MARK_MESSAGES_READ: `${API_BASE_URL}/messages/mark-read`,
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
    
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}