import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import styles from '../styles/post-job.module.css'
import validationStyles from '../styles/post-job-validation.module.css'

interface Question {
  questionNo: number
  question: string
}

interface FormData {
  title: string
  description: string
  skills_required: string
  location: string
  start_date: string
  end_date: string
  salary: string
  type: string
  questions: Question[]
}

interface ValidationErrors {
  start_date?: string
  end_date?: string
  salary?: string
  title?: string
  description?: string
  skills_required?: string
  location?: string
}

const PostJob = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    skills_required: '',
    location: '',
    start_date: '',
    end_date: '',
    salary: '',
    type: 'full-time',
    questions: []
  })
  
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    const today = getTodayDate()
    
    if (!formData.title.trim()) {
      errors.title = 'Job title is required'
    } else if (formData.title.length < 3) {
      errors.title = 'Job title must be at least 3 characters'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Job description is required'
    } else if (formData.description.length < 50) {
      errors.description = 'Job description must be at least 50 characters'
    }
    
    if (!formData.skills_required.trim()) {
      errors.skills_required = 'Skills are required'
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required'
    }
    
    if (formData.start_date && formData.start_date < today) {
      errors.start_date = 'Start date cannot be in the past'
    }
    
    if (formData.end_date) {
      if (formData.end_date < today) {
        errors.end_date = 'End date cannot be in the past'
      }
      if (formData.start_date && formData.end_date <= formData.start_date) {
        errors.end_date = 'End date must be after start date'
      }
    }
    
    if (formData.salary) {
      const salaryNum = parseFloat(formData.salary)
      if (salaryNum < 0) {
        errors.salary = 'Salary cannot be negative'
      } else if (salaryNum === 0) {
        errors.salary = 'Salary must be greater than 0'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleAddQuestion = () => {
    if (currentQuestion.trim()) {
      const newQuestion = {
        questionNo: formData.questions.length + 1,
        question: currentQuestion.trim()
      }
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }))
      setCurrentQuestion('')
    }
  }

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index).map((q, i) => ({
        ...q,
        questionNo: i + 1
      }))
    }))
  }

  const handleCancel = () => {
    navigate('/recruiter/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting')
      return
    }

    if (!formData.start_date) {
      setError('Start date is required')
      return
    }

    setIsLoading(true)

    try {
      const skills = formData.skills_required.split(',').map(s => s.trim()).filter(Boolean)
      
      const payload = {
        recruiter_id: user.id || user.userId || user._id,
        title: formData.title,
        description: formData.description,
        salary: formData.salary || "",
        location: formData.location,
        type:
          formData.type === "full-time" ? "Full-Time" :
          formData.type === "part-time" ? "Part-Time" :
          formData.type === "contract" ? "Contract" :
          formData.type === "internship" ? "Internship" :
          "Full-Time",
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        skills_required: skills,
        status: "OPEN",
        questions: formData.questions
      }

      const response = await apiRequest(API_ENDPOINTS.CREATE_JOB, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        navigate('/recruiter/jobs')
      } else {
        if (Array.isArray(data.detail)) {
          setError(data.detail[0].msg)
        } else {
          setError(data.detail || 'Failed to create job')
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.postJob}>
      <h1>Post a New Job</h1>
      <p className={styles.subtitle}>Fill in the details to create your job listing</p>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.jobForm}>
        <div className={styles.formSection}>
          <h3>Job Details</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Senior Frontend Developer"
              className={validationErrors.title ? validationStyles.error : ''}
              required
            />
            {validationErrors.title && (
              <span className={validationStyles.validationError}>{validationErrors.title}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={8}
              className={validationErrors.description ? validationStyles.error : ''}
              required
            />
            {validationErrors.description && (
              <span className={validationStyles.validationError}>{validationErrors.description}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="skills_required">Required Skills *</label>
            <input
              type="text"
              id="skills_required"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleInputChange}
              placeholder="e.g., React, TypeScript, Node.js (comma-separated)"
              className={validationErrors.skills_required ? validationStyles.error : ''}
              required
            />
            {validationErrors.skills_required && (
              <span className={validationStyles.validationError}>{validationErrors.skills_required}</span>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Job Information</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco, CA or Remote"
                className={validationErrors.location ? validationStyles.error : ''}
                required
              />
              {validationErrors.location && (
                <span className={validationStyles.validationError}>{validationErrors.location}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_date">Start Date *</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                min={getTodayDate()}
                className={validationErrors.start_date ? validationStyles.error : ''}
                required
              />
              {validationErrors.start_date && (
                <span className={validationStyles.validationError}>{validationErrors.start_date}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="end_date">End Date (Optional)</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                min={formData.start_date || getTodayDate()}
                className={validationErrors.end_date ? validationStyles.error : ''}
              />
              {validationErrors.end_date && (
                <span className={validationStyles.validationError}>{validationErrors.end_date}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="salary">Salary ($) (Optional)</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g., 100000"
                min="1"
                className={validationErrors.salary ? validationStyles.error : ''}
              />
              {validationErrors.salary && (
                <span className={validationStyles.validationError}>{validationErrors.salary}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Employment Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Screening Questions (Optional)</h3>
          <p className={styles.sectionDescription}>Add custom questions to better filter candidates</p>

          <div className={styles.questionsList}>
            {formData.questions.map((q, index) => (
              <div key={index} className={styles.questionItem}>
                <span className={styles.questionNumber}>{q.questionNo}.</span>
                <span className={styles.questionText}>{q.question}</span>
                <button
                  type="button"
                  className={styles.removeQuestionBtn}
                  onClick={() => handleRemoveQuestion(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className={styles.addQuestion}>
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Enter a screening question..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddQuestion()
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddQuestion}
              className={styles.addQuestionBtn}
              disabled={!currentQuestion.trim()}
            >
              Add Question
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Submit Job'}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostJob;