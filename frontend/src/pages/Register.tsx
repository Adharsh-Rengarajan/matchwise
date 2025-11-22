import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, APP_CONFIG, apiRequest } from '../config/api'
import '../styles/register.css'

interface Experience {
  title: string
  company: string
  start_date: string
  end_date: string
}

interface Education {
  degree: string
  institution: string
  start_date: string
  end_date: string
}

const Register = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'recruiter' | 'jobseeker'>('recruiter')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    company: '',
    designation: '',
    skills: '',
  })

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const [showEducationForm, setShowEducationForm] = useState(false)
  
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    title: '',
    company: '',
    start_date: '',
    end_date: ''
  })
  
  const [currentEducation, setCurrentEducation] = useState<Education>({
    degree: '',
    institution: '',
    start_date: '',
    end_date: ''
  })
  
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const addExperience = () => {
    if (currentExperience.title && currentExperience.company && currentExperience.start_date) {
      setExperiences([...experiences, currentExperience])
      setCurrentExperience({
        title: '',
        company: '',
        start_date: '',
        end_date: ''
      })
      setShowExperienceForm(false)
    }
  }

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institution && currentEducation.start_date) {
      setEducations([...educations, currentEducation])
      setCurrentEducation({
        degree: '',
        institution: '',
        start_date: '',
        end_date: ''
      })
      setShowEducationForm(false)
    }
  }

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const endpoint = userType === 'recruiter' 
        ? API_ENDPOINTS.REGISTER_RECRUITER
        : API_ENDPOINTS.REGISTER_JOBSEEKER

      const body = userType === 'recruiter' 
        ? {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
            company: formData.company || null,
            designation: formData.designation || null,
            role: 'recruiter'
          }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
            skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
            experience: experiences,
            education: educations,
            role: 'jobseeker'
          }

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        navigate('/login')
      } else {
        setError(data.detail || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Link to="/" className="back-home-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" />
        </svg>
        Back to Home
      </Link>
      
      <div className="register-container">
        <div className="register-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M20 6H10L8 2H2C1.45 2 1 2.45 1 3V17C1 17.55 1.45 18 2 18H10L12 22H20C20.55 22 21 21.55 21 21V7C21 6.45 20.55 6 20 6Z" />
          </svg>
        </div>
        
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join {APP_CONFIG.NAME} today</p>
        
        <div className="user-type-toggle">
          <button
            className={`toggle-option ${userType === 'recruiter' ? 'active' : ''}`}
            onClick={() => setUserType('recruiter')}
            type="button"
          >
            Recruiter
          </button>
          <button
            className={`toggle-option ${userType === 'jobseeker' ? 'active' : ''}`}
            onClick={() => setUserType('jobseeker')}
            type="button"
          >
            Job Seeker
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          {userType === 'recruiter' ? (
            <>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Acme Corp"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="HR Manager"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, Python, FastAPI"
                />
              </div>
              
              <div className="form-section">
                <div className="section-header">
                  <label>Experience</label>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => setShowExperienceForm(!showExperienceForm)}
                  >
                    + Add Experience
                  </button>
                </div>
                
                {showExperienceForm && (
                  <div className="sub-form">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={currentExperience.title}
                      onChange={(e) => setCurrentExperience({...currentExperience, title: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={currentExperience.company}
                      onChange={(e) => setCurrentExperience({...currentExperience, company: e.target.value})}
                    />
                    <div className="date-row">
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={currentExperience.start_date}
                        onChange={(e) => setCurrentExperience({...currentExperience, start_date: e.target.value})}
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={currentExperience.end_date}
                        onChange={(e) => setCurrentExperience({...currentExperience, end_date: e.target.value})}
                      />
                    </div>
                    <button type="button" className="save-btn" onClick={addExperience}>
                      Save Experience
                    </button>
                  </div>
                )}
                
                <div className="items-list">
                  {experiences.map((exp, index) => (
                    <div key={index} className="item">
                      <div className="item-content">
                        <strong>{exp.title}</strong> at {exp.company}
                        <br />
                        <small>{exp.start_date} - {exp.end_date || 'Present'}</small>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeExperience(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-section">
                <div className="section-header">
                  <label>Education</label>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => setShowEducationForm(!showEducationForm)}
                  >
                    + Add Education
                  </button>
                </div>
                
                {showEducationForm && (
                  <div className="sub-form">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={currentEducation.degree}
                      onChange={(e) => setCurrentEducation({...currentEducation, degree: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={currentEducation.institution}
                      onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                    />
                    <div className="date-row">
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={currentEducation.start_date}
                        onChange={(e) => setCurrentEducation({...currentEducation, start_date: e.target.value})}
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={currentEducation.end_date}
                        onChange={(e) => setCurrentEducation({...currentEducation, end_date: e.target.value})}
                      />
                    </div>
                    <button type="button" className="save-btn" onClick={addEducation}>
                      Save Education
                    </button>
                  </div>
                )}
                
                <div className="items-list">
                  {educations.map((edu, index) => (
                    <div key={index} className="item">
                      <div className="item-content">
                        <strong>{edu.degree}</strong> from {edu.institution}
                        <br />
                        <small>{edu.start_date} - {edu.end_date || 'Present'}</small>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeEducation(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {APP_CONFIG.ENABLE_RESUME_UPLOAD && (
                <div className="form-group">
                  <label htmlFor="resume">Resume (Optional)</label>
                  <label className="file-upload-label">
                    <input
                      type="file"
                      id="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="file-input-hidden"
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15M17 8L12 3L7 8M12 3V15" />
                    </svg>
                    {resumeFile ? resumeFile.name : 'Upload Resume'}
                  </label>
                </div>
              )}
            </>
          )}
          
          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="login-prompt">
          Already have an account? <Link to="/login" className="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register