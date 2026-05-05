import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Leaf, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

// Temporary type definitions (will move back to types/index.ts later)
type DietaryRestriction = 
  | 'non-vegetarian'
  | 'vegetarian' 
  | 'eggitarian'
  | 'vegan' 
  | 'keto' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'none';

type HealthGoal = 
  | 'weight-loss' 
  | 'weight-gain' 
  | 'muscle-gain' 
  | 'maintain-weight' 
  | 'improve-energy' 
  | 'better-digestion' 
  | 'heart-health' 
  | 'diabetes-management';

type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';

type BudgetRange = 'low' | 'medium' | 'high' | 'unlimited';

const OnboardingPage = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    dietaryRestrictions: [] as DietaryRestriction[],
    allergies: [] as string[],
    healthGoals: [] as HealthGoal[],
    activityLevel: '' as ActivityLevel,
    mealsPerDay: 3,
    preferredCuisines: [] as string[],
    dislikedFoods: [] as string[],
    budgetRange: '' as BudgetRange
  })

  const totalSteps = 4

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding and save to Firebase
      if (!user) return
      
      try {
        console.log('🔐 OnboardingPage: Saving onboarding data...', formData)
        
        const profileData: any = {
          // Nutrition preferences
          nutritionPreferences: {
            dietaryRestrictions: formData.dietaryRestrictions,
            allergies: formData.allergies,
            healthGoals: formData.healthGoals,
            activityLevel: formData.activityLevel,
            mealsPerDay: formData.mealsPerDay,
            preferredCuisines: formData.preferredCuisines,
            dislikedFoods: formData.dislikedFoods,
            budgetRange: formData.budgetRange
          },
          
          // Mark profile as complete
          profileComplete: true
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
        
        await updateProfile(user.id, profileData)
        console.log('✅ OnboardingPage: Onboarding data saved successfully')
        navigate('/dashboard')
      } catch (error) {
        console.error('❌ OnboardingPage: Failed to save onboarding data', error)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[]
      const isChecked = currentArray.includes(value)
      
      return {
        ...prev,
        [field]: isChecked
          ? currentArray.filter((item: string) => item !== value)
          : [...currentArray, value]
      }
    })
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Let's get to know you</h2>
              <p className="mt-1 text-slate-600">Basic info helps us tailor your plan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="25"
                  min="13"
                  max="120"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="170"
                  min="100"
                  max="250"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Current weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="70"
                  min="30"
                  max="300"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Target weight (kg)</label>
              <input
                type="number"
                value={formData.targetWeight}
                onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="65"
                min="30"
                max="300"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dietary preferences</h2>
              <p className="mt-1 text-slate-600">Tell us what you eat — and what to avoid.</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Dietary restrictions</h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {['non-vegetarian', 'vegetarian', 'eggitarian', 'vegan', 'keto', 'gluten-free', 'dairy-free', 'none'].map((restriction) => {
                  const checked = formData.dietaryRestrictions.includes(restriction as DietaryRestriction)
                  return (
                    <label key={restriction} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm capitalize transition ${checked ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange('dietaryRestrictions', restriction)}
                        className="sr-only"
                      />
                      {restriction.replace('-', ' ')}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Common allergies</h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {['Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Sesame', 'None'].map((allergy) => {
                  const checked = formData.allergies.includes(allergy)
                  return (
                    <label key={allergy} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange('allergies', allergy)}
                        className="sr-only"
                      />
                      {allergy}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Meals per day</label>
              <select
                value={formData.mealsPerDay}
                onChange={(e) => handleInputChange('mealsPerDay', parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value={2}>2 meals</option>
                <option value={3}>3 meals</option>
                <option value={4}>4 meals</option>
                <option value={5}>5 meals</option>
                <option value={6}>6 meals</option>
              </select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Health goals</h2>
              <p className="mt-1 text-slate-600">What do you want to achieve?</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Primary goals</h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {['weight-loss', 'weight-gain', 'muscle-gain', 'maintain-weight', 'improve-energy', 'better-digestion', 'heart-health', 'diabetes-management'].map((goal) => {
                  const checked = formData.healthGoals.includes(goal as HealthGoal)
                  return (
                    <label key={goal} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm capitalize transition ${checked ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange('healthGoals', goal)}
                        className="sr-only"
                      />
                      {checked && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      {goal.replace('-', ' ')}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Activity level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="lightly-active">Lightly Active (light exercise 1-3 days/week)</option>
                <option value="moderately-active">Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value="very-active">Very Active (hard exercise 6-7 days/week)</option>
                <option value="extremely-active">Extremely Active (very hard exercise, physical job)</option>
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Food preferences</h2>
              <p className="mt-1 text-slate-600">Favorites and budget — we'll tune recipes accordingly.</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Preferred cuisines</h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American', 'French', 'Thai', 'Japanese', 'Middle Eastern'].map((cuisine) => {
                  const checked = formData.preferredCuisines.includes(cuisine)
                  return (
                    <label key={cuisine} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange('preferredCuisines', cuisine)}
                        className="sr-only"
                      />
                      {cuisine}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget range</label>
              <select
                value={formData.budgetRange}
                onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select budget range</option>
                <option value="low">Low (₹50-100 per meal)</option>
                <option value="medium">Medium (₹100-200 per meal)</option>
                <option value="high">High (₹200-350 per meal)</option>
                <option value="unlimited">Unlimited (Premium ingredients)</option>
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const stepTitles = ['About you', 'Diet', 'Goals', 'Preferences']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-900">NutriAI</span>
          </Link>
          <span className="text-sm text-slate-500">
            Step <span className="font-semibold text-slate-900">{currentStep}</span> of {totalSteps}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Stepper */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
            {stepTitles.map((t, i) => (
              <span key={t} className={currentStep >= i + 1 ? 'text-emerald-700' : ''}>
                {i + 1}. {t}
              </span>
            ))}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {renderStep()}

          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              {currentStep === totalSteps ? (
                <><Loader2 className="hidden h-4 w-4 animate-spin" />Complete setup<ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Next<ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
