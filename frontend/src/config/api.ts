const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const API_TIMEOUT =
  Number(import.meta.env.VITE_API_TIMEOUT) || 30000

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER_RECRUITER: `${API_BASE_URL}/recruiters/register`,
  REGISTER_JOBSEEKER: `${API_BASE_URL}/jobseekers/register`,

  GET_JOBS_BY_RECRUITER: (id: string) => `${API_BASE_URL}/jobs/${id}`,
  CREATE_JOB: `${API_BASE_URL}/jobs/`,
  UPDATE_JOB_STATUS: `${API_BASE_URL}/jobs/`,

  GET_JOB_BY_ID: (id: string) => `${API_BASE_URL}/jobs/job/${id}`,
  SEARCH_JOBS: `${API_BASE_URL}/jobs/search`,
  GET_TOP_CANDIDATES: (id: string) =>
    `${API_BASE_URL}/jobs/${id}/top-candidates`,

  CREATE_APPLICATION: `${API_BASE_URL}/applications/`,
  GET_APPLICATION_BY_ID: (id: string) =>
    `${API_BASE_URL}/applications/${id}/`,
  GET_APPLICATIONS_BY_JOBSEEKER: (id: string) =>
    `${API_BASE_URL}/applications/jobseeker/${id}/`,
  UPDATE_APPLICATION_STATUS: (id: string) =>
    `${API_BASE_URL}/applications/${id}/`,
  GET_RESUME: (fileId: string) =>
    `${API_BASE_URL}/applications/resume/${fileId}/`,

  GET_JOBSEEKER_PROFILE: (id: string) =>
    `${API_BASE_URL}/jobseekers/${id}`,
  UPDATE_JOBSEEKER_PROFILE: (id: string) =>
    `${API_BASE_URL}/jobseekers/${id}`,

  ADD_NOTE: (id: string) =>
    `${API_BASE_URL}/recruiters/applications/${id}/notes`,

  SEND_MESSAGE: `${API_BASE_URL}/messages/`,
  GET_CONVERSATION: (u1: string, u2: string) =>
    `${API_BASE_URL}/messages/${u1}/${u2}`,
  GET_RECRUITER_CONVERSATIONS: (id: string) =>
    `${API_BASE_URL}/messages/recruiter/${id}`,
  MARK_MESSAGES_READ: `${API_BASE_URL}/messages/mark-read`,
}

export const APP_CONFIG = {
  NAME: 'MatchWise',
  TAGLINE: 'AI-driven Job Matching'
}

export const apiRequest = async (
  url: string,
  options: RequestInit = {}
) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    API_TIMEOUT
  )

  try {
    const headers: Record<string, string> = {}

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}
