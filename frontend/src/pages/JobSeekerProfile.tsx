import { useState, useEffect } from 'react'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import styles from '../styles/jobseeker-profile.module.css'

interface Experience {
  title: string
  company: string
  start_date: string
  end_date?: string
}

interface Education {
  degree: string
  institution: string
  start_date: string
  end_date?: string
}

interface Profile {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: Experience[]
  education: Education[]
}

const JobSeekerProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id || user._id || user.userId

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newSkill, setNewSkill] = useState('')

  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: [],
    education: []
  })

  const [editedProfile, setEditedProfile] = useState<Profile>(profile)

  const [newExperience, setNewExperience] = useState<Experience>({
    title: '',
    company: '',
    start_date: '',
    end_date: ''
  })

  const [newEducation, setNewEducation] = useState<Education>({
    degree: '',
    institution: '',
    start_date: '',
    end_date: ''
  })

  const [showExpForm, setShowExpForm] = useState(false)
  const [showEduForm, setShowEduForm] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest(API_ENDPOINTS.GET_JOBSEEKER_PROFILE(userId))

      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          const profileData: Profile = {
            name: data.data.name || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
            skills: data.data.skills || [],
            experience: data.data.experience || [],
            education: data.data.education || []
          }
          setProfile(profileData)
          setEditedProfile(profileData)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setEditedProfile({ ...profile })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedProfile({ ...profile })
    setIsEditing(false)
    setShowExpForm(false)
    setShowEduForm(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await apiRequest(API_ENDPOINTS.UPDATE_JOBSEEKER_PROFILE(userId), {
        method: 'PATCH',
        body: JSON.stringify({
          name: editedProfile.name,
          phone: editedProfile.phone,
          skills: editedProfile.skills,
          experience: editedProfile.experience,
          education: editedProfile.education
        })
      })

      if (response.ok) {
        setProfile({ ...editedProfile })
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

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company && newExperience.start_date) {
      setEditedProfile(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience }]
      }))
      setNewExperience({ title: '', company: '', start_date: '', end_date: '' })
      setShowExpForm(false)
    }
  }

  const handleRemoveExperience = (index: number) => {
    setEditedProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.institution && newEducation.start_date) {
      setEditedProfile(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }))
      setNewEducation({ degree: '', institution: '', start_date: '', end_date: '' })
      setShowEduForm(false)
    }
  }

  const handleRemoveEducation = (index: number) => {
    setEditedProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className={styles.jobseekerProfile}>
      <div className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.profileAvatar}>
            <span>{getInitials(profile.name || 'U')}</span>
          </div>
          <div className={styles.profileInfo}>
            <h1>{profile.name || 'Your Name'}</h1>
            <p className={styles.profileEmail}>{profile.email}</p>
            <p className={styles.profilePhone}>{profile.phone}</p>
          </div>
          <div className={styles.profileActions}>
            {!isEditing ? (
              <button className={styles.btnEdit} onClick={handleEdit}>
                Edit Profile
              </button>
            ) : (
              <>
                <button className={styles.btnCancel} onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  className={styles.btnSave}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.profileContent}>
        <section className={styles.profileSection}>
          <h2>Basic Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className={styles.fieldValue}>{profile.name || 'Not provided'}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              ) : (
                <p className={styles.fieldValue}>{profile.phone || 'Not provided'}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <p className={styles.fieldValue}>{profile.email}</p>
            </div>
          </div>
        </section>

        <section className={styles.profileSection}>
          <h2>Skills</h2>
          <div className={styles.skillsContainer}>
            {isEditing && (
              <div className={styles.addSkill}>
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
            <div className={styles.skillsList}>
              {(isEditing ? editedProfile.skills : profile.skills).length > 0 ? (
                (isEditing ? editedProfile.skills : profile.skills).map((skill, index) => (
                  <span key={index} className={styles.skillTag}>
                    {skill}
                    {isEditing && (
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className={styles.emptyText}>No skills added yet</p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h2>Experience</h2>
            {isEditing && !showExpForm && (
              <button className={styles.addBtn} onClick={() => setShowExpForm(true)}>
                + Add Experience
              </button>
            )}
          </div>

          {isEditing && showExpForm && (
            <div className={styles.addForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company *</label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Google"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newExperience.end_date}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={() => setShowExpForm(false)}>
                  Cancel
                </button>
                <button className={styles.btnPrimary} onClick={handleAddExperience}>
                  Add Experience
                </button>
              </div>
            </div>
          )}

          <div className={styles.itemsList}>
            {(isEditing ? editedProfile.experience : profile.experience).length > 0 ? (
              (isEditing ? editedProfile.experience : profile.experience).map((exp, index) => (
                <div key={index} className={styles.itemCard}>
                  <div className={styles.itemInfo}>
                    <h4>{exp.title}</h4>
                    <p className={styles.itemSubtitle}>{exp.company}</p>
                    <p className={styles.itemDate}>
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleRemoveExperience(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No experience added yet</p>
            )}
          </div>
        </section>

        <section className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h2>Education</h2>
            {isEditing && !showEduForm && (
              <button className={styles.addBtn} onClick={() => setShowEduForm(true)}>
                + Add Education
              </button>
            )}
          </div>

          {isEditing && showEduForm && (
            <div className={styles.addForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Degree *</label>
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="e.g. Bachelor of Science"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Institution *</label>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="e.g. MIT"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={newEducation.start_date}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newEducation.end_date}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={() => setShowEduForm(false)}>
                  Cancel
                </button>
                <button className={styles.btnPrimary} onClick={handleAddEducation}>
                  Add Education
                </button>
              </div>
            </div>
          )}

          <div className={styles.itemsList}>
            {(isEditing ? editedProfile.education : profile.education).length > 0 ? (
              (isEditing ? editedProfile.education : profile.education).map((edu, index) => (
                <div key={index} className={styles.itemCard}>
                  <div className={styles.itemInfo}>
                    <h4>{edu.degree}</h4>
                    <p className={styles.itemSubtitle}>{edu.institution}</p>
                    <p className={styles.itemDate}>
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleRemoveEducation(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No education added yet</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default JobSeekerProfile;