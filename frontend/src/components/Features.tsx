const Features = () => {
  const features = [
    {
      id: 1,
      title: 'Beyond Keywords',
      description: 'Our LLM analyzes context and transferable skills, not just keyword matches that miss qualified candidates.',
      icon: '🤖'
    },
    {
      id: 2,
      title: 'AI Match Scores',
      description: 'Get instant compatibility scores for every job based on deep analysis of your skills and experience.',
      icon: '📊'
    },
    {
      id: 3,
      title: 'Smart Resume Analysis',
      description: 'Upload your resume and get intelligent parsing that understands your actual capabilities.',
      icon: '📄'
    },
    {
      id: 4,
      title: 'Skill Gap Identification',
      description: 'Know exactly what skills you need to improve your chances for your dream job.',
      icon: '🎯'
    },
    {
      id: 5,
      title: 'Recruiter Dashboard',
      description: 'Pre-ranked candidates with detailed match analysis, saving hours of manual screening.',
      icon: '👥'
    },
    {
      id: 6,
      title: 'Real-time Matching',
      description: 'Asynchronous processing ensures fast results even with complex AI analysis.',
      icon: '⚡'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why MatchWise?</h2>
          <p className="section-subtitle">
            Stop losing opportunities to ATS keyword filters. Find jobs that match your actual skills.
          </p>
        </div>
        <div className="features-grid">
          {features.map(feature => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features