import { useState, useRef, useEffect } from 'react'
import '../styles/jobseeker-profile.css'

interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  title: string
  bio: string
  experience: string
  education: string
  skills: string[]
  languages: string[]
  availability: string
  expectedSalary: {
    min: number
    max: number
  }
  resumeFile?: File | null
  linkedIn?: string
  portfolio?: string
  github?: string
}

const JobSeekerProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'preferences'>('personal')
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  
  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    lastName: '',
    email: user.email || '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    experience: '',
    education: '',
    skills: [],
    languages: [],
    availability: 'Immediate',
    expectedSalary: { min: 0, max: 0 },
    resumeFile: null,
    linkedIn: '',
    portfolio: '',
    github: ''
  })

  const [editedProfile, setEditedProfile] = useState<Profile>(profile)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'}/jobseekers/${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          const profileData = {
            firstName: data.data.firstName || data.data.first_name || '',
            lastName: data.data.lastName || data.data.last_name || '',
            email: data.data.email || user.email || '',
            phone: data.data.phone || '',
            location: data.data.location || '',
            title: data.data.title || data.data.job_title || '',
            bio: data.data.bio || data.data.summary || '',
            experience: data.data.experience || data.data.years_of_experience || '',
            education: data.data.education || '',
            skills: data.data.skills || [],
            languages: data.data.languages || [],
            availability: data.data.availability || 'Immediate',
            expectedSalary: data.data.expected_salary || { min: 0, max: 0 },
            resumeFile: null,
            linkedIn: data.data.linkedIn || data.data.linkedin_url || '',
            portfolio: data.data.portfolio || data.data.portfolio_url || '',
            github: data.data.github || data.data.github_url || ''
          }
          setProfile(profileData)
          setEditedProfile(profileData)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleEdit = () => {
    setEditedProfile(profile)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const profileData = {
        first_name: editedProfile.firstName,
        last_name: editedProfile.lastName,
        email: editedProfile.email,
        phone: editedProfile.phone,
        location: editedProfile.location,
        job_title: editedProfile.title,
        summary: editedProfile.bio,
        years_of_experience: editedProfile.experience,
        education: editedProfile.education,
        skills: editedProfile.skills,
        languages: editedProfile.languages,
        availability: editedProfile.availability,
        expected_salary: editedProfile.expectedSalary,
        linkedin_url: editedProfile.linkedIn,
        portfolio_url: editedProfile.portfolio,
        github_url: editedProfile.github
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://matchwise-1wks.onrender.com'}/jobseekers/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        setProfile(editedProfile)
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Profile, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !editedProfile.languages.includes(newLanguage.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const handleRemoveLanguage = (language: string) => {
    setEditedProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditedProfile(prev => ({
        ...prev,
        resumeFile: file
      }))
    }
  }

  const profileCompleteness = () => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
      profile.location,
      profile.title,
      profile.bio,
      profile.experience,
      profile.education,
      profile.skills.length > 0,
      profile.resumeFile
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  return (
    <div className="jobseeker-profile">
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-avatar">
            <span>{profile.firstName[0]}{profile.lastName[0]}</span>
          </div>
          <div className="profile-info">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p className="profile-title">{profile.title}</p>
            <p className="profile-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
              </svg>
              {profile.location}
            </p>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={handleEdit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"/>
                </svg>
                Edit Profile
              </button>
            ) : (
              <>
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                <button 
                  className="btn-save" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="profile-completeness">
          <div className="completeness-header">
            <span>Profile Completeness</span>
            <span className="completeness-value">{profileCompleteness()}%</span>
          </div>
          <div className="completeness-bar">
            <div 
              className="completeness-fill" 
              style={{ width: `${profileCompleteness()}%` }}
            />
          </div>
          {profileCompleteness() < 100 && (
            <p className="completeness-hint">Complete your profile to increase visibility to recruiters</p>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Information
        </button>
        <button 
          className={`tab ${activeTab === 'professional' ? 'active' : ''}`}
          onClick={() => setActiveTab('professional')}
        >
          Professional Details
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Job Preferences
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'personal' && (
          <div className="tab-content">
            <section className="profile-section">
              <h2>Basic Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.firstName}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.lastName}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.email}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.phone}</p>
                  )}
                </div>
                <div className="form-group full-width">
                  <label>Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.location}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>About Me</h2>
              <div className="form-group">
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={5}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="bio-text">{profile.bio}</p>
                )}
              </div>
            </section>

            <section className="profile-section">
              <h2>Social Links</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedProfile.linkedIn}
                      onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  ) : (
                    <p className="field-value">
                      {profile.linkedIn ? (
                        <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
                          {profile.linkedIn}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Portfolio</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedProfile.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      placeholder="https://..."
                    />
                  ) : (
                    <p className="field-value">
                      {profile.portfolio ? (
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer">
                          {profile.portfolio}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>GitHub</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedProfile.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  ) : (
                    <p className="field-value">
                      {profile.github ? (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer">
                          {profile.github}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="tab-content">
            <section className="profile-section">
              <h2>Professional Summary</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.title}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.experience}</p>
                  )}
                </div>
                <div className="form-group full-width">
                  <label>Education</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                    />
                  ) : (
                    <p className="field-value">{profile.education}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>Skills</h2>
              <div className="skills-container">
                {isEditing && (
                  <div className="add-skill">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      placeholder="Add a skill..."
                    />
                    <button onClick={handleAddSkill}>Add</button>
                  </div>
                )}
                <div className="skills-list">
                  {(isEditing ? editedProfile.skills : profile.skills).map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                      {isEditing && (
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>Languages</h2>
              <div className="languages-container">
                {isEditing && (
                  <div className="add-language">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                      placeholder="Add a language..."
                    />
                    <button onClick={handleAddLanguage}>Add</button>
                  </div>
                )}
                <div className="languages-list">
                  {(isEditing ? editedProfile.languages : profile.languages).map((language, index) => (
                    <span key={index} className="language-tag">
                      {language}
                      {isEditing && (
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveLanguage(language)}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>Resume</h2>
              <div className="resume-section">
                {isEditing ? (
                  <div className="resume-upload">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button 
                      className="upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                      {editedProfile.resumeFile ? 'Change Resume' : 'Upload Resume'}
                    </button>
                    {editedProfile.resumeFile && (
                      <span className="file-name">{editedProfile.resumeFile.name}</span>
                    )}
                  </div>
                ) : (
                  <div className="resume-display">
                    {profile.resumeFile ? (
                      <div className="resume-info">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#5b5fc7">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
                        </svg>
                        <span>Resume uploaded</span>
                      </div>
                    ) : (
                      <p className="no-resume">No resume uploaded</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="tab-content">
            <section className="profile-section">
              <h2>Job Preferences</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Availability</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="2 weeks">2 weeks notice</option>
                      <option value="1 month">1 month notice</option>
                      <option value="2 months">2 months notice</option>
                      <option value="Not looking">Not actively looking</option>
                    </select>
                  ) : (
                    <p className="field-value">{profile.availability}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Expected Salary Range</label>
                  {isEditing ? (
                    <div className="salary-inputs">
                      <input
                        type="number"
                        value={editedProfile.expectedSalary.min}
                        onChange={(e) => handleInputChange('expectedSalary', {
                          ...editedProfile.expectedSalary,
                          min: parseInt(e.target.value)
                        })}
                        placeholder="Min"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        value={editedProfile.expectedSalary.max}
                        onChange={(e) => handleInputChange('expectedSalary', {
                          ...editedProfile.expectedSalary,
                          max: parseInt(e.target.value)
                        })}
                        placeholder="Max"
                      />
                    </div>
                  ) : (
                    <p className="field-value">
                      ${(profile.expectedSalary.min / 1000).toFixed(0)}k - ${(profile.expectedSalary.max / 1000).toFixed(0)}k
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>Privacy Settings</h2>
              <div className="privacy-settings">
                <label className="switch-container">
                  <input type="checkbox" defaultChecked />
                  <span className="switch"></span>
                  <span className="switch-label">Make profile visible to recruiters</span>
                </label>
                <label className="switch-container">
                  <input type="checkbox" defaultChecked />
                  <span className="switch"></span>
                  <span className="switch-label">Allow recruiters to contact me</span>
                </label>
                <label className="switch-container">
                  <input type="checkbox" />
                  <span className="switch"></span>
                  <span className="switch-label">Show salary expectations</span>
                </label>
                <label className="switch-container">
                  <input type="checkbox" defaultChecked />
                  <span className="switch"></span>
                  <span className="switch-label">Receive job recommendations</span>
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobSeekerProfile