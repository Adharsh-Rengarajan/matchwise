import { Link } from 'react-router-dom'
import styles from '../styles/notfound.module.css'

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <div className={`${styles.floatingElement} ${styles.floatingElement1}`}></div>
      <div className={`${styles.floatingElement} ${styles.floatingElement2}`}></div>
      <div className={`${styles.floatingElement} ${styles.floatingElement3}`}></div>
      <div className={`${styles.floatingElement} ${styles.floatingElement4}`}></div>
      
      <div className={styles.notFoundContainer}>
        <h1 className={styles.notFound404}>404</h1>
        <h2 className={styles.notFoundTitle}>Oops! Page Not Found</h2>
        <p className={styles.notFoundDescription}>
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        <div className={styles.notFoundButtons}>
          <Link to="/" className={`${styles.notFoundBtn} ${styles.notFoundBtnPrimary}`}>
            <svg className={styles.notFoundIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link to="/login" className={`${styles.notFoundBtn} ${styles.notFoundBtnSecondary}`}>
            <svg className={styles.notFoundIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound;