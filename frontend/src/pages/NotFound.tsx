import { Link } from 'react-router-dom'
import '../styles/notfound.css'

const NotFound = () => {
  return (
    <div className="not-found">
      {/* Floating elements for visual effect */}
      <div className="floating-element floating-element-1"></div>
      <div className="floating-element floating-element-2"></div>
      <div className="floating-element floating-element-3"></div>
      <div className="floating-element floating-element-4"></div>
      
      <div className="not-found-container">
        <h1 className="not-found-404">404</h1>
        <h2 className="not-found-title">Oops! Page Not Found</h2>
        <p className="not-found-description">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        <div className="not-found-buttons">
          <Link to="/" className="not-found-btn not-found-btn-primary">
            <svg className="not-found-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link to="/login" className="not-found-btn not-found-btn-secondary">
            <svg className="not-found-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound