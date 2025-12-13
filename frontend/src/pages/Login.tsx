import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, APP_CONFIG, apiRequest } from '../config/api'
import styles from '../styles/login.module.css'

const Login = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'recruiter' | 'jobseeker'>('recruiter')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

        const normalizedUser = {
          ...backendUser,
          id: backendUser.id || backendUser._id || backendUser.userId,
        }

        localStorage.setItem("user", JSON.stringify(normalizedUser))
        localStorage.setItem("userType", backendUser.role)

          if (backendUser.token) {
            localStorage.setItem('token', backendUser.token)
          }

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
    <div className={styles.loginPage}>
      <Link to="/" className={styles.backHomeLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" />
        </svg>
        Back to Home
      </Link>

      <div className={styles.loginContainer}>
        <div className={styles.loginIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M20 6H10L8 2H2V18H10L12 22H20V6Z" />
          </svg>
        </div>

        <h1 className={styles.loginTitle}>{APP_CONFIG.NAME}</h1>
        <p className={styles.loginSubtitle}>{APP_CONFIG.TAGLINE}</p>

        <div className={styles.userTypeToggle}>
          <button
            className={`${styles.toggleOption} ${userType === 'recruiter' ? styles.active : ''}`}
            onClick={() => setUserType('recruiter')}
            type="button"
          >
            Recruiter
          </button>

          <button
            className={`${styles.toggleOption} ${userType === 'jobseeker' ? styles.active : ''}`}
            onClick={() => setUserType('jobseeker')}
            type="button"
          >
            Job Seeker
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.signupPrompt}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.signupLink}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login;