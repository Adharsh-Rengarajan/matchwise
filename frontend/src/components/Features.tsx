import styles from '../styles/features.module.css'

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
    <section id="features" className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why MatchWise?</h2>
          <p className={styles.sectionSubtitle}>
            Stop losing opportunities to ATS keyword filters. Find jobs that match your actual skills.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map(feature => (
            <div key={feature.id} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features