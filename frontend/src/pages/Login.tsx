import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, APP_CONFIG, apiRequest } from '../config/api'
import '../styles/login.css'

const Login = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'recruiter' | 'jobseeker'>('recruiter')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.data))
        localStorage.setItem('userType', userType)
        
        if (rememberMe && APP_CONFIG.ENABLE_REMEMBER_ME) {
          localStorage.setItem('rememberMe', 'true')
        }

        if (userType === 'recruiter') {
          navigate('/recruiter/dashboard')
        } else {
          navigate('/jobseeker/dashboard')
        }
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="back-home-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" />
        </svg>
        Back to Home
      </Link>
      
      <div className="login-container">
        <div className="login-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M20 6H10L8 2H2C1.45 2 1 2.45 1 3V17C1 17.55 1.45 18 2 18H10L12 22H20C20.55 22 21 21.55 21 21V7C21 6.45 20.55 6 20 6Z" />
          </svg>
        </div>
        
        <h1 className="login-title">{APP_CONFIG.NAME}</h1>
        <p className="login-subtitle">{APP_CONFIG.TAGLINE}</p>
        
        <div className="user-type-toggle">
          <button
            className={`toggle-option ${userType === 'recruiter' ? 'active' : ''}`}
            onClick={() => setUserType('recruiter')}
            type="button"
          >
            Recruiter
          </button>
          <button
            className={`toggle-option ${userType === 'jobseeker' ? 'active' : ''}`}
            onClick={() => setUserType('jobseeker')}
            type="button"
          >
            Job Seeker
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {APP_CONFIG.ENABLE_REMEMBER_ME && (
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>
          )}
          
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="signup-prompt">
          Don't have an account? <Link to="/register" className="signup-link">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login