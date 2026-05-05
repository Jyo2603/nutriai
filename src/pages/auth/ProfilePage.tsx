import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Leaf, ArrowLeft, Pencil, X, Save, Trash2, AlertTriangle, Loader2 } from 'lucide-react'

const ProfilePage = () => {
  const { user, userProfile, updateProfile, deleteAccount, isLoading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    gender: '',
    height: '', // cm
    weight: '', // kg
    targetWeight: '' // kg
  })

  // Load user data when component mounts or user/profile changes
  useEffect(() => {
    if (user && userProfile) {
      setFormData({
        firstName: userProfile.firstName || user.firstName || '',
        lastName: userProfile.lastName || user.lastName || '',
        email: user.email || '',
        age: userProfile.age?.toString() || '',
        gender: userProfile.gender || '',
        height: userProfile.height?.toString() || '',
        weight: userProfile.weight?.toString() || '',
        targetWeight: userProfile.targetWeight?.toString() || ''
      })
    } else if (user) {
      // Fallback to user data if profile not loaded yet
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }))
    }
  }, [user, userProfile])

  const handleSave = async () => {
    if (!user) {
      console.error('❌ ProfilePage: No user found')
      return
    }
    
    setIsSaving(true)
    
    try {
      console.log('🔐 ProfilePage: Starting save process...')
      console.log('🔐 ProfilePage: User ID:', user.id)
      console.log('🔐 ProfilePage: Form data:', formData)
      
      // Convert string values to numbers for numeric fields, filter out undefined values
      const profileData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profileComplete: true,
        updatedAt: new Date()
      }
      
      // Only add fields that have values (no undefined values for Firebase)
      if (formData.age && formData.age.trim()) {
        profileData.age = parseInt(formData.age)
      }
      if (formData.gender && formData.gender.trim()) {
        profileData.gender = formData.gender
      }
      if (formData.height && formData.height.trim()) {
        profileData.height = parseInt(formData.height)
      }
      if (formData.weight && formData.weight.trim()) {
        profileData.weight = parseInt(formData.weight)
      }
      if (formData.targetWeight && formData.targetWeight.trim()) {
        profileData.targetWeight = parseInt(formData.targetWeight)
      }
      
      console.log('🔐 ProfilePage: Profile data to save:', profileData)
      
      await updateProfile(user.id, profileData)
      setIsEditing(false)
      console.log('✅ ProfilePage: Profile saved successfully')
      
      // Show success message
      alert('Profile updated successfully!')
    } catch (error: any) {
      console.error('❌ ProfilePage: Failed to save profile', error)
      alert(`Failed to save profile: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDeleteAccount = async () => {
    if (!user?.email || !deletePassword) {
      alert('Please enter your password to confirm account deletion.')
      return
    }

    try {
      console.log('🔐 ProfilePage: Deleting account...')
      await deleteAccount(user.email, deletePassword)
      console.log('✅ ProfilePage: Account deleted successfully')
      // User will be automatically redirected due to auth state change
    } catch (error: any) {
      console.error('❌ ProfilePage: Failed to delete account', error)
      alert(`Failed to delete account: ${error.message}`)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600'

  const bmi =
    formData.height && formData.weight
      ? (parseInt(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2)).toFixed(1)
      : null

  const toGoal =
    formData.weight && formData.targetWeight
      ? parseInt(formData.targetWeight) - parseInt(formData.weight)
      : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-900">NutriAI</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My profile</h1>
            <p className="mt-1 text-slate-600">Manage your personal info and nutrition preferences.</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 self-start rounded-lg px-4 py-2 text-sm font-semibold transition sm:self-auto ${
              isEditing
                ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isEditing ? (<><X className="h-4 w-4" /> Cancel</>) : (<><Pencil className="h-4 w-4" /> Edit profile</>)}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">BMI</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{bmi ?? 'N/A'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">To goal</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {toGoal !== null ? `${toGoal > 0 ? '+' : ''}${toGoal} kg` : 'N/A'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Age</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formData.age || 'N/A'}</p>
          </div>
        </div>

        {/* Basic Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-700">Basic information</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-700">First name</label>
              <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} className={inputCls} placeholder="John" />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-700">Last name</label>
              <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} className={inputCls} placeholder="Doe" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="age" className="mb-1.5 block text-sm font-medium text-slate-700">Age</label>
              <input id="age" type="number" name="age" value={formData.age} onChange={handleChange} disabled={!isEditing} className={inputCls} min="13" max="120" placeholder="25" />
            </div>
          </div>
        </section>

        {/* Physical Info */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-700">Physical information</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className={inputCls}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="height" className="mb-1.5 block text-sm font-medium text-slate-700">Height (cm)</label>
              <input id="height" type="number" name="height" value={formData.height} onChange={handleChange} disabled={!isEditing} className={inputCls} min="100" max="250" placeholder="170" />
            </div>
            <div>
              <label htmlFor="weight" className="mb-1.5 block text-sm font-medium text-slate-700">Current weight (kg)</label>
              <input id="weight" type="number" name="weight" value={formData.weight} onChange={handleChange} disabled={!isEditing} className={inputCls} min="30" max="300" placeholder="70" />
            </div>
            <div>
              <label htmlFor="targetWeight" className="mb-1.5 block text-sm font-medium text-slate-700">Target weight (kg)</label>
              <input id="targetWeight" type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} disabled={!isEditing} className={inputCls} min="30" max="300" placeholder="65" />
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save changes</>}
              </button>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="mt-8 rounded-2xl border border-red-200 bg-red-50/40 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Danger zone</h3>
              <p className="mt-1 text-sm text-red-700">
                Deleting your account is permanent. This removes your profile, preferences, and all app data.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" /> Delete account
              </button>
            </div>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Confirm account deletion</h3>
              </div>
              <p className="text-sm text-slate-600">
                This action is permanent and cannot be undone. You will lose:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li>• Profile and personal information</li>
                <li>• Nutrition preferences and goals</li>
                <li>• AI recommendation history</li>
                <li>• All app data and settings</li>
              </ul>

              <div className="mt-5">
                <label htmlFor="deletePassword" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Enter your current password to confirm
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : <><Trash2 className="h-4 w-4" /> Delete forever</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProfilePage
