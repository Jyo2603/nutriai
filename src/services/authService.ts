import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User, UserProfile } from '../types'

// Convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  const displayName = firebaseUser.displayName || ''
  const nameParts = displayName.split(' ')
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLogin: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
    profileComplete: false
  }
}

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<User> => {
  try {
    console.log('🔥 Starting signup process...', { email, firstName, lastName })
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    console.log('✅ Firebase user created:', firebaseUser.uid)
    
    // Update display name
    await updateProfile(firebaseUser, {
      displayName: `${firstName} ${lastName}`
    })
    
    console.log('✅ Display name updated')
    
    // Create user document in Firestore
    const userData: UserProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      firstName,
      lastName,
      createdAt: new Date(),
      lastLogin: new Date(),
      profileComplete: false
    }
    
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    })
    
    console.log('✅ User document created in Firestore')
    
    return convertFirebaseUser(firebaseUser)
  } catch (error: any) {
    console.error('❌ Signup error:', error)
    
    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.')
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.')
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.')
    }
    
    throw new Error(error.message || 'Failed to create account')
  }
}

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    console.log('🔥 Starting signin process...', { email })
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    console.log('✅ User signed in:', firebaseUser.uid)
    
    // Update last login in Firestore (create document if it doesn't exist)
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLogin: serverTimestamp()
      })
    } catch (error: any) {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        console.log('🔥 User document not found, creating it...')
        const displayName = firebaseUser.displayName || ''
        const nameParts = displayName.split(' ')
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          profileComplete: false
        })
        console.log('✅ User document created during signin')
      } else {
        throw error
      }
    }
    
    console.log('✅ Last login updated')
    
    return convertFirebaseUser(firebaseUser)
  } catch (error: any) {
    console.error('❌ Signin error:', error)
    
    // Provide user-friendly error messages
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.')
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.')
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.')
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.')
    }
    
    throw new Error(error.message || 'Failed to sign in')
  }
}

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    console.log('🔥 Signing out user...')
    await signOut(auth)
    console.log('✅ User signed out')
  } catch (error: any) {
    console.error('❌ Signout error:', error)
    throw new Error(error.message || 'Failed to sign out')
  }
}

// Delete user account with re-authentication
export const deleteUserAccount = async (email: string, password: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('No user is currently signed in')
    }

    console.log('🔥 Re-authenticating user before deletion...', currentUser.uid)
    
    // Re-authenticate the user first
    const credential = EmailAuthProvider.credential(email, password)
    await reauthenticateWithCredential(currentUser, credential)
    console.log('✅ User re-authenticated successfully')
    
    console.log('🔥 Deleting user account...', currentUser.uid)
    
    // Delete user document from Firestore first
    await deleteDoc(doc(db, 'users', currentUser.uid))
    console.log('✅ User document deleted from Firestore')
    
    // Delete the Firebase Auth user
    await currentUser.delete()
    console.log('✅ User account deleted from Firebase Auth')
    
  } catch (error: any) {
    console.error('❌ Delete account error:', error)
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please enter your current password to delete your account.')
    }
    
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security reasons, please log out and log back in before deleting your account.')
    }
    
    throw new Error(error.message || 'Failed to delete account')
  }
}

// Get user profile from Firestore
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('🔥 Getting user profile...', userId)
    
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (userDoc.exists()) {
      const data = userDoc.data()
      console.log('✅ User profile found:', data)
      
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date()
      } as UserProfile
    }
    
    console.log('❌ User profile not found')
    return null
  } catch (error: any) {
    console.error('❌ Get profile error:', error)
    throw new Error(error.message || 'Failed to get user profile')
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    console.log('🔥 Updating user profile...', { userId, profileData })
    
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ User profile updated')
  } catch (error: any) {
    console.error('❌ Update profile error:', error)
    throw new Error(error.message || 'Failed to update profile')
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  console.log('🔥 Setting up auth state listener...')
  
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      console.log('✅ Auth state: User is signed in', firebaseUser.uid)
      callback(convertFirebaseUser(firebaseUser))
    } else {
      console.log('✅ Auth state: User is signed out')
      callback(null)
    }
  })
}

// Check if user is authenticated
export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser
  return firebaseUser ? convertFirebaseUser(firebaseUser) : null
}
