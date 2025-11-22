import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  userType: 'recruiter' | 'jobseeker'
}

const ProtectedRoute = ({ children, userType }: ProtectedRouteProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const storedUserType = localStorage.getItem("userType")

  const userId = user.id || user._id || user.userId

  const isAuthenticated = !!userId
  const isCorrectRole = storedUserType === userType

  if (!isAuthenticated || !isCorrectRole) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
