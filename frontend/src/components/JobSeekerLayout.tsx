import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import '../styles/jobseeker-layout.css'

const JobSeekerLayout = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/login')
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="jobseeker-layout">
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M20 6H10L8 2H2V18H10L12 22H20V6Z" />
            </svg>
            {!isSidebarCollapsed && <span>MatchWise</span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d={isSidebarCollapsed ? "M13 3L17 7L13 11M6 7H17M13 13L17 17L13 21M6 17H17" : "M11 21L7 17L11 13M18 17H7M11 11L7 7L11 3M18 7H7"} />
            </svg>
          </button>
        </div>
        
        <div className="sidebar-subtitle">
          {!isSidebarCollapsed && <span>AI-driven Job Matching</span>}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/jobseeker/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 13V19H20V13H13ZM4 13V19H11V13H4ZM4 4V11H11V4H4ZM13 4V11H20V4H13Z" />
            </svg>
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/jobseeker/search" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
            </svg>
            {!isSidebarCollapsed && <span>Search Jobs</span>}
          </NavLink>

          <NavLink to="/jobseeker/applications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3ZM7 7H17V5H19V19H5V5H7V7Z" />
            </svg>
            {!isSidebarCollapsed && <span>My Applications</span>}
          </NavLink>

          <NavLink to="/jobseeker/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
            </svg>
            {!isSidebarCollapsed && <span>Profile</span>}
          </NavLink>

          <NavLink to="/jobseeker/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" />
            </svg>
            {!isSidebarCollapsed && <span>Messages</span>}
          </NavLink>

          <NavLink to="/jobseeker/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12S10.07 8.5 12 8.5 15.5 10.07 15.5 12 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12S19.47 11.35 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.72 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.35 4.5 11.67 4.5 12S4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.28 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
            </svg>
            {!isSidebarCollapsed && <span>Settings</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17V14H9V10H16V7L21 12L16 17ZM14 2C14.5523 2 15 2.44772 15 3V6H13V4H4V20H13V18H15V21C15 21.5523 14.5523 22 14 22H3C2.44772 22 2 21.5523 2 21V3C2 2.44772 2.44772 2 3 2H14Z" />
            </svg>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default JobSeekerLayout