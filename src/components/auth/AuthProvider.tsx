import { useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication...')
    
    // Set initial loading state
    setLoading(true)
    
    // Initialize Firebase auth listener
    const unsubscribe = initializeAuth()
    
    // Cleanup function
    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listener...')
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [initializeAuth, setLoading])

  return <>{children}</>
}

export default AuthProvider
