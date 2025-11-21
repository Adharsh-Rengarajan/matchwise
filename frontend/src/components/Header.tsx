import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="header">
      <nav className="nav-container">
        <div className="logo">
          <Link to="/" className="logo-text">MatchWise</Link>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#about" className="nav-link">About</a>
        </div>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
        <button className="mobile-menu-btn">
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
      </nav>
    </header>
  )
}

export default Header