import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import '../styles/post-job.css'

interface JobFormData {
  title: string
  description: string
  skills_required: string
  experience_level: string
  location: string
  salary_min: string
  salary_max: string
  type: string
  questions: Array<{ question: string; questionNo: number }>
  start_date: string      // NEW
  end_date: string        // NEW
}

const PostJob = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAIAssist, setShowAIAssist] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')

const [formData, setFormData] = useState<JobFormData>({
  title: '',
  description: '',
  skills_required: '',
  experience_level: '',
  location: '',
  salary_min: '',
  salary_max: '',
  type: 'full-time',
  questions: [],
  start_date: '',        // NEW
  end_date: ''           // NEW
})

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddQuestion = () => {
    if (currentQuestion.trim()) {
      setFormData(prev => ({
        ...prev,
        questions: [
          ...prev.questions,
          {
            question: currentQuestion.trim(),
            questionNo: prev.questions.length + 1
          }
        ]
      }))
      setCurrentQuestion('')
    }
  }

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, questionNo: i + 1 }))
    }))
  }

  const handleAIAssist = () => {
    if (!formData.title) {
      setError('Please enter a job title first')
      return
    }

    const suggestedDescription = `We are seeking a talented ${formData.title} to join our growing team. You will be responsible for building and maintaining high-quality web applications using modern technologies.

Key Responsibilities:
• Design and implement user interfaces using React and TypeScript
• Collaborate with designers and backend engineers
• Write clean, maintainable, and well-tested code
• Stay up-to-date with the latest technologies

Requirements:
• Strong knowledge of React and TypeScript
• Excellent communication skills`

    setFormData(prev => ({
      ...prev,
      description: suggestedDescription
    }))
    setShowAIAssist(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (
      !formData.title ||
      !formData.description ||
      !formData.skills_required ||
      !formData.experience_level ||
      !formData.location
    ) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const skills = formData.skills_required.split(',').map(s => s.trim()).filter(Boolean)
    const payload = {
    recruiter_id: user.id || user.userId || user._id,
    title: formData.title,
    description: formData.description,
    skills_required: skills,
    experience_level: formData.experience_level,
    location: formData.location,
    
    // salary should be a string
    salary: String(
        formData.salary_max || formData.salary_min || ""
    ),
    
    // map UI values to backend enums
    type:
        formData.type === "full-time" ? "Full-Time" :
        formData.type === "part-time" ? "Part-Time" :
        formData.type === "contract" ? "Contract" :
        formData.type === "internship" ? "Internship" :
        "Full-Time",

    // ensure correct date format
    start_date: formData.start_date,                // comes from <input type="date">
    end_date: formData.end_date || null,

    status: "OPEN",                                  // backend enum

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

  const handleCancel = () => {
    navigate('/recruiter/jobs')
  }

  return (
    <div className="post-job">
      <div className="page-header">
        <div>
          <h1>Post a New Job</h1>
          <p>Create a job listing to find your ideal candidate</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}


      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-section">
          <h3>Job Details</h3>

          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Senior Frontend Developer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Job Description *
              <button
                type="button"
                className="ai-assist-btn"
                onClick={() => setShowAIAssist(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14L10 20L21 9L13 3Z" />
                </svg>
                AI Assist
              </button>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={8}
              required
            />
          </div>

          {showAIAssist && (
            <div className="ai-assist-modal">
              <p>Generate AI-powered job description based on the job title?</p>
              <div className="modal-actions">
                <button type="button" onClick={handleAIAssist}>Generate</button>
                <button type="button" onClick={() => setShowAIAssist(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="skills_required">Required Skills (comma-separated) *</label>
            <input
              type="text"
              id="skills_required"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleInputChange}
              placeholder="React, TypeScript, Node.js, AWS"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience_level">Experience Level *</label>
              <select
                id="experience_level"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
                required
              >
                <option value="">Select level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="junior">Junior (2-4 years)</option>
                <option value="mid">Mid Level (4-7 years)</option>
                <option value="senior">Senior (7-10 years)</option>
                <option value="lead">Lead (10+ years)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. San Francisco, CA or Remote"
                required
              />
            </div>
          </div>
          <div className="form-row">
        <div className="form-group">
            <label htmlFor="start_date">Start Date *</label>
            <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
            />
        </div>

        <div className="form-group">
            <label htmlFor="end_date">End Date (Optional)</label>
            <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}
            />
        </div>
        </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary_min">Min Salary ($)</label>
              <input
                type="number"
                id="salary_min"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleInputChange}
                placeholder="80000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary_max">Max Salary ($)</label>
              <input
                type="number"
                id="salary_max"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleInputChange}
                placeholder="120000"
              />
            </div>
          </div>

          <div className="form-group">
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

        <div className="form-section">
          <h3>Screening Questions (Optional)</h3>
          <p className="section-description">Add custom questions to better filter candidates</p>

          <div className="questions-list">
            {formData.questions.map((q, index) => (
              <div key={index} className="question-item">
                <span className="question-number">{q.questionNo}.</span>
                <span className="question-text">{q.question}</span>
                <button
                  type="button"
                  className="remove-question-btn"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="add-question">
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
              className="add-question-btn"
            >
              Add Question
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Submit Job'}
          </button>
          <button
            type="button"
            className="cancel-btn"
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

export default PostJob
