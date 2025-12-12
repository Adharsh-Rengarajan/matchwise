import { Link } from 'react-router-dom'
import styles from '../styles/header.module.css'

const Header = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoText}>MatchWise</Link>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          <a href="#about" className={styles.navLink}>About</a>
        </div>
        <div className={styles.authButtons}>
          <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`}>
            Login
          </Link>
          <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
            Get Started
          </Link>
        </div>
        <button className={styles.mobileMenuBtn}>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>
      </nav>
    </header>
  )
}

export default Header