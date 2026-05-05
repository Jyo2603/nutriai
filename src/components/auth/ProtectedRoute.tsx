import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { user, userProfile, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()
  
  // Check if current route is an auth page (login/signup)
  const isAuthPage = ['/login', '/signup'].includes(location.pathname)

  useEffect(() => {
    console.log('🔒 ProtectedRoute: Checking auth state', {
      isAuthenticated,
      isLoading,
      user: user?.email,
      currentPath: location.pathname
    })
  }, [isAuthenticated, isLoading, user, location.pathname])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-nutrition-gradient flex items-center justify-center">
        <div className="glass-card p-8 text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            🔐 Checking Authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your login status
          </p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 ProtectedRoute: Access denied, redirecting to', redirectTo)
    
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }

  // If user is authenticated but trying to access auth pages (login/signup)
  if (isAuthPage && isAuthenticated) {
    // For new users without complete profile, send to onboarding instead of dashboard
    if (!userProfile?.profileComplete) {
      console.log('🔒 ProtectedRoute: New user, redirecting to onboarding')
      return <Navigate to="/onboarding" replace />
    }
    console.log('🔒 ProtectedRoute: User already authenticated, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // All checks passed, render the protected content
  console.log('✅ ProtectedRoute: Access granted to', location.pathname)
  return <>{children}</>
}

export default ProtectedRoute
