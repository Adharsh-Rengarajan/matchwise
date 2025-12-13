import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { isAuthenticated } from '../utils/auth'

interface ProtectedRouteProps {
  children: ReactNode
  userType: 'recruiter' | 'jobseeker'
}

const ProtectedRoute = ({ children, userType }: ProtectedRouteProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const storedUserType = localStorage.getItem("userType")

  const userId = user.id || user._id || user.userId
  const authenticated = isAuthenticated() && !!userId
  const isCorrectRole = storedUserType === userType

  if (!authenticated || !isCorrectRole) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute