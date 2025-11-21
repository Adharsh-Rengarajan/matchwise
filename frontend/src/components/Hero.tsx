import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            AI-Powered <span className="gradient-text">Job Matching</span> Beyond Keywords
          </h1>
          <p className="hero-description">
            MatchWise uses advanced Large Language Models to analyze your skills beyond simple keyword matching. 
            Find jobs that truly fit your expertise, identify transferable skills, and get AI-calculated 
            compatibility scores for every position.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-large">
              Find Your Perfect Job
            </Link>
            <Link to="/register" className="btn btn-outline btn-large">
              For Recruiters
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Match Accuracy</span>
            </div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Jobs Posted</span>
            </div>
            <div className="stat">
              <span className="stat-number">200K+</span>
              <span className="stat-label">Successful Hires</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <div className="match-score-card">
              <div className="score-badge">95% Match</div>
              <div className="job-preview">
                <div className="company-logo">🏢</div>
                <h3>Senior Software Engineer</h3>
                <p>Apple • Boston, MA</p>
                <div className="skill-tags">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">Python</span>
                  <span className="skill-tag">FastAPI</span>
                </div>
              </div>
            </div>
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero