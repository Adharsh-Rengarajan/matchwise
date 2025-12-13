import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, APP_CONFIG, apiRequest } from '../config/api'
import styles from '../styles/register.module.css'

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

interface ValidationError {
  type: string
  loc: string[]
  msg: string
  input: unknown
  url?: string
}

interface FormValidationErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  company?: string
  designation?: string
  skills?: string
  experience?: string
  education?: string
}

const formatValidationErrors = (detail: ValidationError[] | string): string => {
  if (typeof detail === 'string') {
    return detail
  }
  if (Array.isArray(detail)) {
    return detail.map(err => {
      const field = err.loc[err.loc.length - 1]
      return `${field}: ${err.msg}`
    }).join(', ')
  }
  return 'Registration failed'
}

const Register = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'recruiter' | 'jobseeker'>('recruiter')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({})
  
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

  const [experienceError, setExperienceError] = useState('')
  const [educationError, setEducationError] = useState('')

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Password is required'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character'
    }
    return null
  }

  const validateEmail = (email: string): string | null => {
    if (!email) {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const validatePhone = (phone: string): string | null => {
    if (!phone) {
      return 'Phone is required'
    }
    const phoneRegex = /^[\d\s+()-]{10,}$/
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number (at least 10 digits)'
    }
    return null
  }

  const validateForm = (): boolean => {
    const errors: FormValidationErrors = {}
    let hasError = false

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      hasError = true
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
      hasError = true
    }

    const emailError = validateEmail(formData.email)
    if (emailError) {
      errors.email = emailError
      hasError = true
    }

    const phoneError = validatePhone(formData.phone)
    if (phoneError) {
      errors.phone = phoneError
      hasError = true
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      errors.password = passwordError
      hasError = true
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
      hasError = true
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      hasError = true
    }

    if (userType === 'jobseeker') {
      if (formData.skills.trim() && formData.skills.split(',').filter(s => s.trim()).length === 0) {
        errors.skills = 'Please enter at least one valid skill'
        hasError = true
      }
    }

    setValidationErrors(errors)
    return !hasError
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (validationErrors[name as keyof FormValidationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      })
    }

    if (name === 'password' && validationErrors.confirmPassword && value === formData.confirmPassword) {
      setValidationErrors({
        ...validationErrors,
        confirmPassword: undefined
      })
    }

    if (name === 'confirmPassword' && validationErrors.confirmPassword && value === formData.password) {
      setValidationErrors({
        ...validationErrors,
        confirmPassword: undefined
      })
    }
  }

  const validateExperienceDates = (): string | null => {
    const today = getTodayDate()

    if (!currentExperience.start_date) {
      return 'Start date is required'
    }

    if (currentExperience.start_date > today) {
      return 'Start date cannot be in the future'
    }

    if (currentExperience.end_date) {
      if (currentExperience.end_date > today) {
        return 'End date cannot be in the future'
      }
      if (currentExperience.end_date <= currentExperience.start_date) {
        return 'End date must be after start date'
      }
    }

    return null
  }

  const validateEducationDates = (): string | null => {
    const today = getTodayDate()

    if (!currentEducation.start_date) {
      return 'Start date is required'
    }

    if (currentEducation.start_date > today) {
      return 'Start date cannot be in the future'
    }

    if (currentEducation.end_date) {
      if (currentEducation.end_date > today) {
        return 'End date cannot be in the future'
      }
      if (currentEducation.end_date <= currentEducation.start_date) {
        return 'End date must be after start date'
      }
    }

    return null
  }

  const addExperience = () => {
    setExperienceError('')

    if (!currentExperience.title.trim()) {
      setExperienceError('Job title is required')
      return
    }

    if (!currentExperience.company.trim()) {
      setExperienceError('Company name is required')
      return
    }

    const dateError = validateExperienceDates()
    if (dateError) {
      setExperienceError(dateError)
      return
    }

    setExperiences([...experiences, currentExperience])
    setCurrentExperience({
      title: '',
      company: '',
      start_date: '',
      end_date: ''
    })
    setShowExperienceForm(false)
  }

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const addEducation = () => {
    setEducationError('')

    if (!currentEducation.degree.trim()) {
      setEducationError('Degree is required')
      return
    }

    if (!currentEducation.institution.trim()) {
      setEducationError('Institution name is required')
      return
    }

    const dateError = validateEducationDates()
    if (dateError) {
      setEducationError(dateError)
      return
    }

    setEducations([...educations, currentEducation])
    setCurrentEducation({
      degree: '',
      institution: '',
      start_date: '',
      end_date: ''
    })
    setShowEducationForm(false)
  }

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const endpoint = userType === 'recruiter' 
        ? API_ENDPOINTS.REGISTER_RECRUITER
        : API_ENDPOINTS.REGISTER_JOBSEEKER

      let body: Record<string, unknown>

      if (userType === 'recruiter') {
        body = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: 'recruiter'
        }
        if (formData.company.trim()) {
          body.company = formData.company.trim()
        }
        if (formData.designation.trim()) {
          body.designation = formData.designation.trim()
        }
      } else {
        body = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
          experience: experiences,
          education: educations,
          role: 'jobseeker'
        }
      }

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        navigate('/login')
      } else {
        const errorMessage = formatValidationErrors(data.detail)
        setError(errorMessage)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
    display: 'block'
  }

  const inputErrorStyle = {
    borderColor: '#ef4444'
  }

  return (
    <div className={styles.registerPage}>
      <Link to="/" className={styles.backHomeLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" />
        </svg>
        Back to Home
      </Link>
      
      <div className={styles.registerContainer}>
        <div className={styles.registerIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M20 6H10L8 2H2C1.45 2 1 2.45 1 3V17C1 17.55 1.45 18 2 18H10L12 22H20C20.55 22 21 21.55 21 21V7C21 6.45 20.55 6 20 6Z" />
          </svg>
        </div>
        
        <h1 className={styles.registerTitle}>Create Account</h1>
        <p className={styles.registerSubtitle}>Join {APP_CONFIG.NAME} today</p>
        
        <div className={styles.userTypeToggle}>
          <button
            className={`${styles.toggleOption} ${userType === 'recruiter' ? styles.toggleOptionActive : ''}`}
            onClick={() => setUserType('recruiter')}
            type="button"
          >
            Recruiter
          </button>
          <button
            className={`${styles.toggleOption} ${userType === 'jobseeker' ? styles.toggleOptionActive : ''}`}
            onClick={() => setUserType('jobseeker')}
            type="button"
          >
            Job Seeker
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                style={validationErrors.name ? inputErrorStyle : {}}
                required
              />
              {validationErrors.name && (
                <span style={errorStyle}>{validationErrors.name}</span>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
                style={validationErrors.phone ? inputErrorStyle : {}}
                required
              />
              {validationErrors.phone && (
                <span style={errorStyle}>{validationErrors.phone}</span>
              )}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              style={validationErrors.email ? inputErrorStyle : {}}
              required
            />
            {validationErrors.email && (
              <span style={errorStyle}>{validationErrors.email}</span>
            )}
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                style={validationErrors.password ? inputErrorStyle : {}}
                required
              />
              {validationErrors.password && (
                <span style={errorStyle}>{validationErrors.password}</span>
              )}
              <small className={styles.passwordHint}>
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                style={validationErrors.confirmPassword ? inputErrorStyle : {}}
                required
              />
              {validationErrors.confirmPassword && (
                <span style={errorStyle}>{validationErrors.confirmPassword}</span>
              )}
            </div>
          </div>
          
          {userType === 'recruiter' ? (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="company">Company (Optional)</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="designation">Designation (Optional)</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="HR Manager"
                />
              </div>
            </div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="skills">Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, TypeScript, Node.js"
                  style={validationErrors.skills ? inputErrorStyle : {}}
                />
                {validationErrors.skills && (
                  <span style={errorStyle}>{validationErrors.skills}</span>
                )}
              </div>
              
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <label>Experience</label>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => {
                      setShowExperienceForm(!showExperienceForm)
                      setExperienceError('')
                    }}
                  >
                    {showExperienceForm ? 'Cancel' : '+ Add'}
                  </button>
                </div>
                
                {showExperienceForm && (
                  <div className={styles.subForm}>
                    {experienceError && (
                      <div style={{...errorStyle, marginBottom: '0.5rem'}}>{experienceError}</div>
                    )}
                    <input
                      type="text"
                      value={currentExperience.title}
                      onChange={(e) => setCurrentExperience({...currentExperience, title: e.target.value})}
                      placeholder="Job Title *"
                    />
                    <input
                      type="text"
                      value={currentExperience.company}
                      onChange={(e) => setCurrentExperience({...currentExperience, company: e.target.value})}
                      placeholder="Company Name *"
                    />
                    <div className={styles.dateRow}>
                      <input
                        type="date"
                        value={currentExperience.start_date}
                        onChange={(e) => setCurrentExperience({...currentExperience, start_date: e.target.value})}
                        max={getTodayDate()}
                        placeholder="Start Date *"
                      />
                      <input
                        type="date"
                        value={currentExperience.end_date}
                        onChange={(e) => setCurrentExperience({...currentExperience, end_date: e.target.value})}
                        max={getTodayDate()}
                        min={currentExperience.start_date || ''}
                        placeholder="End Date"
                      />
                    </div>
                    <button type="button" className={styles.saveBtn} onClick={addExperience}>
                      Save Experience
                    </button>
                  </div>
                )}
                
                {experiences.length > 0 && (
                  <div className={styles.itemsList}>
                    {experiences.map((exp, index) => (
                      <div key={index} className={styles.item}>
                        <div className={styles.itemContent}>
                          <strong>{exp.title}</strong> at {exp.company}
                          <br />
                          <small>{exp.start_date} - {exp.end_date || 'Present'}</small>
                        </div>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeExperience(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <label>Education</label>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => {
                      setShowEducationForm(!showEducationForm)
                      setEducationError('')
                    }}
                  >
                    {showEducationForm ? 'Cancel' : '+ Add'}
                  </button>
                </div>
                
                {showEducationForm && (
                  <div className={styles.subForm}>
                    {educationError && (
                      <div style={{...errorStyle, marginBottom: '0.5rem'}}>{educationError}</div>
                    )}
                    <input
                      type="text"
                      value={currentEducation.degree}
                      onChange={(e) => setCurrentEducation({...currentEducation, degree: e.target.value})}
                      placeholder="Degree *"
                    />
                    <input
                      type="text"
                      value={currentEducation.institution}
                      onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                      placeholder="Institution *"
                    />
                    <div className={styles.dateRow}>
                      <input
                        type="date"
                        value={currentEducation.start_date}
                        onChange={(e) => setCurrentEducation({...currentEducation, start_date: e.target.value})}
                        max={getTodayDate()}
                        placeholder="Start Date *"
                      />
                      <input
                        type="date"
                        value={currentEducation.end_date}
                        onChange={(e) => setCurrentEducation({...currentEducation, end_date: e.target.value})}
                        max={getTodayDate()}
                        min={currentEducation.start_date || ''}
                        placeholder="End Date"
                      />
                    </div>
                    <button type="button" className={styles.saveBtn} onClick={addEducation}>
                      Save Education
                    </button>
                  </div>
                )}
                
                {educations.length > 0 && (
                  <div className={styles.itemsList}>
                    {educations.map((edu, index) => (
                      <div key={index} className={styles.item}>
                        <div className={styles.itemContent}>
                          <strong>{edu.degree}</strong> from {edu.institution}
                          <br />
                          <small>{edu.start_date} - {edu.end_date || 'Present'}</small>
                        </div>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeEducation(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          <button
            type="submit"
            className={styles.registerButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className={styles.loginPrompt}>
          Already have an account? <Link to="/login" className={styles.loginLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register;