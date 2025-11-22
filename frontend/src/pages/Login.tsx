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
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("LOGIN RESPONSE:", data)

      if (response.ok && data.data) {
        const backendUser = data.data

        // 🔥 Normalize all possible id formats
        const normalizedUser = {
          ...backendUser,
          id: backendUser.id || backendUser._id || backendUser.userId,
        }

        // Save normalized user object
        localStorage.setItem("user", JSON.stringify(normalizedUser))

        // Save actual backend role
        localStorage.setItem("userType", backendUser.role)

        if (rememberMe && APP_CONFIG.ENABLE_REMEMBER_ME) {
          localStorage.setItem("rememberMe", "true")
        }

        // Redirect based on backend role
        if (backendUser.role === "recruiter") {
          navigate("/recruiter/dashboard")
        } else {
          navigate("/jobseeker/dashboard")
        }

      } else {
        setError(data.message || "Invalid email or password")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">

      <Link to="/" className="back-home-link">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" />
        </svg>
        Back to Home
      </Link>

      <div className="login-container">
        <div className="login-icon">
          <svg width="32" height="32" viewBox="0 0 24 24">
            <path d="M20 6H10L8 2H2V18H10L12 22H20V6Z" />
          </svg>
        </div>

        <h1 className="login-title">{APP_CONFIG.NAME}</h1>
        <p className="login-subtitle">{APP_CONFIG.TAGLINE}</p>

        {/* UI-only toggle */}
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
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {APP_CONFIG.ENABLE_REMEMBER_ME && (
            <div className="form-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-prompt">
          Don't have an account?{" "}
          <Link to="/register" className="signup-link">Sign up</Link>
        </p>
      </div>

    </div>
  )
}

export default Login
