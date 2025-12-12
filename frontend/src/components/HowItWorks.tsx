import styles from '../styles/howitworks.module.css'

const HowItWorks = () => {
  const jobSeekerSteps = [
    {
      number: '01',
      title: 'Upload Your Resume',
      description: 'Our AI extracts and analyzes your skills, experience, and transferable capabilities'
    },
    {
      number: '02', 
      title: 'AI Matching Engine',
      description: 'LLM analyzes job descriptions and calculates compatibility scores in real-time'
    },
    {
      number: '03',
      title: 'View Match Scores',
      description: 'See your percentage match, skill gaps, and transferable skills for each position'
    }
  ]

  const recruiterSteps = [
    {
      number: '01',
      title: 'Post Your Job',
      description: 'Create detailed job descriptions with required and preferred qualifications'
    },
    {
      number: '02',
      title: 'AI Candidate Ranking',
      description: 'Candidates are automatically ranked by AI-calculated compatibility scores'
    },
    {
      number: '03',
      title: 'Review Top Matches',
      description: 'Focus on pre-qualified candidates with detailed match analysis reports'
    }
  ]

  return (
    <section id="how-it-works" className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How MatchWise Works</h2>
          <p className={styles.sectionSubtitle}>
            Intelligent job matching powered by advanced AI
          </p>
        </div>

        <div className={styles.userTypeTabs}>
          <h3 className={styles.tabTitle}>For Job Seekers</h3>
        </div>
        <div className={styles.stepsContainer}>
          {jobSeekerSteps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.userTypeTabs}>
          <h3 className={styles.tabTitle}>For Recruiters</h3>
        </div>
        <div className={styles.stepsContainer}>
          {recruiterSteps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks;