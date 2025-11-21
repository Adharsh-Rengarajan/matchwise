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
    },
    {
      number: '04',
      title: 'Apply with Confidence',
      description: 'Focus on jobs where you have the highest match, saving time and increasing success'
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
      title: 'AI Analyzes Applicants',
      description: 'Our LLM processes all resumes and ranks candidates by actual compatibility'
    },
    {
      number: '03',
      title: 'View Top Candidates',
      description: 'Access pre-ranked candidate lists with detailed match analysis and insights'
    },
    {
      number: '04',
      title: 'Connect & Interview',
      description: 'Message top matches directly and add notes for collaborative hiring'
    }
  ]

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How MatchWise Works</h2>
          <p className="section-subtitle">
            Intelligent job matching powered by advanced AI
          </p>
        </div>
        
        <div className="user-type-tabs">
          <h3 className="tab-title active">For Job Seekers</h3>
        </div>
        <div className="steps-container">
          {jobSeekerSteps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              {index < jobSeekerSteps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        <div className="user-type-tabs" style={{marginTop: '4rem'}}>
          <h3 className="tab-title active">For Recruiters</h3>
        </div>
        <div className="steps-container">
          {recruiterSteps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              {index < recruiterSteps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks