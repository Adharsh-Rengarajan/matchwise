import { Link } from 'react-router-dom'
import styles from '../styles/hero.module.css'

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            AI-Powered <span className={styles.gradientText}>Job Matching</span> Beyond Keywords
          </h1>
          <p className={styles.heroDescription}>
            MatchWise uses advanced Large Language Models to analyze your skills beyond simple keyword matching. 
            Find jobs that truly fit your expertise, identify transferable skills, and get AI-calculated 
            compatibility scores for every position.
          </p>
          <div className={styles.heroCta}>
            <Link to="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
              Find Your Perfect Job
            </Link>
            <Link to="/register" className={`${styles.btn} ${styles.btnOutline} ${styles.btnLarge}`}>
              For Recruiters
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>95%</span>
              <span className={styles.statLabel}>Match Accuracy</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Jobs Posted</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>200K+</span>
              <span className={styles.statLabel}>Successful Hires</span>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualCard}>
            <div className={styles.matchScoreCard}>
              <div className={styles.scoreBadge}>95% Match</div>
              <div className={styles.jobPreview}>
                <div className={styles.companyLogo}>🏢</div>
                <h3>Senior Software Engineer</h3>
                <p>Apple • Boston, MA</p>
                <div className={styles.skillTags}>
                  <span className={styles.skillTag}>React</span>
                  <span className={styles.skillTag}>Python</span>
                  <span className={styles.skillTag}>FastAPI</span>
                </div>
              </div>
            </div>
            <div className={`${styles.floatingElement} ${styles.element1}`}></div>
            <div className={`${styles.floatingElement} ${styles.element2}`}></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero;