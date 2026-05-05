import { create } from 'zustand'
import type { User, UserProfile } from '../types'
import { 
  signUp, 
  signIn, 
  signOutUser, 
  deleteUserAccount,
  getUserProfile, 
  updateUserProfile, 
  onAuthStateChange 
} from '../services/authService'

interface AuthState {
  // State
  user: User | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signin: (email: string, password: string) => Promise<void>
  signout: () => Promise<void>
  deleteAccount: (email: string, password: string) => Promise<void>
  loadUserProfile: (userId: string) => Promise<void>
  updateProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
      // Initial state
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Sign up action
      signup: async (email: string, password: string, firstName: string, lastName: string) => {
        try {
          set({ isLoading: true, error: null })
          console.log('🏪 Store: Starting signup...', { email, firstName, lastName })
          
          const user = await signUp(email, password, firstName, lastName)
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          
          console.log('✅ Store: Signup successful', user)
          
          // Load user profile
          await get().loadUserProfile(user.id)
        } catch (error: any) {
          console.error('❌ Store: Signup failed', error)
          set({ 
            error: error.message, 
            isLoading: false,
            user: null,
            isAuthenticated: false 
          })
          throw error
        }
      },

      // Sign in action
      signin: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          console.log('🏪 Store: Starting signin...', { email })
          
          const user = await signIn(email, password)
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          
          console.log('✅ Store: Signin successful', user)
          
          // Load user profile
          await get().loadUserProfile(user.id)
        } catch (error: any) {
          console.error('❌ Store: Signin failed', error)
          set({ 
            error: error.message, 
            isLoading: false,
            user: null,
            isAuthenticated: false 
          })
          throw error
        }
      },

      // Sign out action
      signout: async () => {
        try {
          set({ isLoading: true })
          console.log('🏪 Store: Starting signout...')
          
          await signOutUser()
          // Clear state
      set({ 
        user: null, 
        userProfile: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      })
      
      console.log('✅ Store: Signout successful')
    } catch (error: any) {
      console.error('❌ Store: Signout failed', error)
      set({ 
        error: error.message, 
        isLoading: false 
      })
      throw error
    }
  },

  // Delete account
  deleteAccount: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      console.log('🏪 Store: Deleting user account...')
      
      await deleteUserAccount(email, password)
      
      // Clear all state after successful deletion
      set({ 
        user: null, 
        userProfile: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      })
      
      console.log('✅ Store: Account deleted successfully')
    } catch (error: any) {
      console.error('❌ Store: Account deletion failed', error)
      set({ 
        error: error.message, 
        isLoading: false 
      })
      throw error
    }
  },

      // Load user profile
      loadUserProfile: async (userId: string) => {
        try {
          console.log('🏪 Store: Loading user profile...', userId)
          
          const userProfile = await getUserProfile(userId)
          
          set({ userProfile })
          console.log('✅ Store: User profile loaded', userProfile)
        } catch (error: any) {
          console.error('❌ Store: Failed to load user profile', error)
          set({ error: error.message })
        }
      },

      // Update user profile
      updateProfile: async (userId: string, profileData: Partial<UserProfile>) => {
        try {
          set({ isLoading: true, error: null })
          console.log('🏪 Store: Updating user profile...', { userId, profileData })
          
          await updateUserProfile(userId, profileData)
          
          // Reload the profile to get updated data
          await get().loadUserProfile(userId)
          
          set({ isLoading: false })
          console.log('✅ Store: User profile updated')
        } catch (error: any) {
          console.error('❌ Store: Failed to update user profile', error)
          set({ 
            error: error.message, 
            isLoading: false 
          })
          throw error
        }
      },

      // Set user (for auth state changes)
      setUser: (user: User | null) => {
        console.log('🏪 Store: Setting user', user)
        set({ 
          user, 
          isAuthenticated: !!user 
        })
        
        // Load profile if user exists
        if (user) {
          get().loadUserProfile(user.id)
        } else {
          set({ userProfile: null })
        }
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Set error
      setError: (error: string | null) => {
        set({ error })
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Initialize auth listener
      initializeAuth: () => {
        console.log('🏪 Store: Initializing auth listener...')
        
        const unsubscribe = onAuthStateChange((user) => {
          console.log('🏪 Store: Auth state changed', user)
          get().setUser(user)
          set({ isLoading: false })
        })

        // Return unsubscribe function for cleanup
        return unsubscribe
      }
    }))
