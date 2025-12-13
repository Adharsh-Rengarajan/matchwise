import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import styles from '../styles/jobseeker-layout.module.css'

const JobSeekerLayout = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userType')
  navigate('/login')
}

  return (
    <div className={styles.jobseekerLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M20 6H10L8 2H2C1.45 2 1 2.45 1 3V17C1 17.55 1.45 18 2 18H10L12 22H20C20.55 22 21 21.55 21 21V7C21 6.45 20.55 6 20 6Z" />
            </svg>
            <span className={styles.logoText}>MatchWise</span>
          </div>
          <p className={styles.tagline}>AI-driven Job Matching</p>
        </div>

        <nav className={styles.sidebarNav}>
          <NavLink to="/jobseeker/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/jobseeker/search" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span>Search Jobs</span>
          </NavLink>

          <NavLink to="/jobseeker/applications" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>My Applications</span>
          </NavLink>

          <NavLink to="/jobseeker/profile" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile</span>
          </NavLink>

          <NavLink to="/jobseeker/messages" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Messages</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}

export default JobSeekerLayout;