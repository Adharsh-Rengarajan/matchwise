const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}${import.meta.env.VITE_API_LOGIN || '/auth/login'}`,
  REGISTER_RECRUITER: `${API_BASE_URL}${import.meta.env.VITE_API_REGISTER_RECRUITER || '/recruiters/register'}`,
  REGISTER_JOBSEEKER: `${API_BASE_URL}${import.meta.env.VITE_API_REGISTER_JOBSEEKER || '/jobseekers/register'}`,
}

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'MatchWise',
  TAGLINE: import.meta.env.VITE_APP_TAGLINE || 'AI-driven Job Matching Platform',
  ENABLE_RESUME_UPLOAD: import.meta.env.VITE_ENABLE_RESUME_UPLOAD === 'true',
  ENABLE_REMEMBER_ME: import.meta.env.VITE_ENABLE_REMEMBER_ME === 'true',
}

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
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