import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useAIRecommendations } from '../../hooks/useAIRecommendations'
import RecipeModal from '../../components/RecipeModal'
import ShoppingAssistantModal from '../../components/ShoppingAssistantModal'
import NutritionCoachModal from '../../components/NutritionCoachModal'
import type { MealRecommendation } from '../../services/aiService'
import {
  Leaf,
  User,
  LogOut,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ChefHat,
  ShoppingCart,
  MessageCircle,
  ArrowRight,
  Loader2,
  Utensils,
  Flame,
  Dumbbell,
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signout, isLoading } = useAuthStore()
  const { 
    recommendations, 
    isLoading: aiLoading, 
    error: aiError,
    refreshRecommendations,
    hasProfile 
  } = useAIRecommendations()

  // Recipe modal state
  const [selectedMeal, setSelectedMeal] = useState<MealRecommendation | null>(null)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)

  // AI modals state
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false)
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false)

  const handleViewRecipe = (meal: MealRecommendation) => {
    setSelectedMeal(meal)
    setIsRecipeModalOpen(true)
  }

  const handleCloseRecipe = () => {
    setIsRecipeModalOpen(false)
    setSelectedMeal(null)
  }

  const handleOpenShopping = () => {
    setIsShoppingModalOpen(true)
  }

  const handleCloseShopping = () => {
    setIsShoppingModalOpen(false)
  }

  const handleOpenCoach = () => {
    setIsCoachModalOpen(true)
  }

  const handleCloseCoach = () => {
    setIsCoachModalOpen(false)
  }
  
  const handleLogout = async () => {
    try {
      console.log('🔐 Dashboard: Starting logout...')
      await signout()
      console.log('✅ Dashboard: Logout successful, navigating to landing...')
      navigate('/')
    } catch (error) {
      console.error('❌ Dashboard: Logout failed', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-900">NutriAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.firstName || 'there'}
            </h1>
            <p className="mt-1 text-slate-600">Here's what's on your plate today.</p>
          </div>
          <button
            onClick={handleOpenCoach}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md sm:self-auto"
          >
            <MessageCircle className="h-4 w-4" />
            AI Nutrition Coach
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={handleOpenShopping}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Shopping Assistant</h3>
              <p className="mt-1 text-sm text-slate-600">Generate optimized grocery lists.</p>
            </div>
          </button>
          <button
            onClick={handleOpenCoach}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Chat with Coach</h3>
              <p className="mt-1 text-sm text-slate-600">Get answers from your AI nutritionist.</p>
            </div>
          </button>
          <Link
            to="/profile"
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Update Profile</h3>
              <p className="mt-1 text-sm text-slate-600">Refine goals and preferences.</p>
            </div>
          </Link>
        </div>

        {/* Meal Recommendations */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">AI Meal Recommendations</h2>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {hasProfile
                  ? 'Personalized to your goals and preferences.'
                  : 'Complete your profile to unlock personalized suggestions.'}
              </p>
            </div>
            <button
              onClick={refreshRecommendations}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
              {aiLoading ? 'Loading' : 'Refresh'}
            </button>
          </div>

          {/* Error */}
          {aiError && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="flex-1">
                <p>{aiError}</p>
                <button onClick={refreshRecommendations} className="mt-1 font-medium underline hover:text-red-800">
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {aiLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="mt-4 text-sm font-medium text-slate-600">Generating your personalized recommendations...</p>
            </div>
          )}

          {/* Profile incomplete */}
          {!hasProfile && !aiLoading && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <User className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Complete your profile</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-600">
                Tell us about your goals and preferences to unlock personalized AI meal recommendations.
              </p>
              <Link
                to="/profile"
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Complete profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Meals grouped by cuisine */}
          {hasProfile && !aiLoading && recommendations.length > 0 && (() => {
            const mealsByCuisine = recommendations.reduce((acc, meal) => {
              const cuisine = meal.cuisine || 'Other'
              if (!acc[cuisine]) acc[cuisine] = []
              acc[cuisine].push(meal)
              return acc
            }, {} as Record<string, typeof recommendations>)

            return (
              <div className="space-y-10">
                {Object.entries(mealsByCuisine).map(([cuisine, meals]) => (
                  <div key={cuisine}>
                    <div className="mb-4 flex items-baseline justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">{cuisine}</h3>
                      <span className="text-xs text-slate-500">
                        {meals.length} meal{meals.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-emerald-200 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                              <Utensils className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {meal.mealType}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col gap-4 p-5">
                            <div>
                              <h4 className="font-semibold text-slate-900">{meal.name}</h4>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">{meal.description}</p>
                            </div>
                            <div className="grid grid-cols-4 gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-center">
                              <div>
                                <div className="flex items-center justify-center gap-1 text-[10px] font-medium uppercase text-slate-500">
                                  <Flame className="h-3 w-3" /> kcal
                                </div>
                                <div className="mt-0.5 text-sm font-bold text-slate-900">{meal.calories}</div>
                              </div>
                              <div>
                                <div className="flex items-center justify-center gap-1 text-[10px] font-medium uppercase text-slate-500">
                                  <Dumbbell className="h-3 w-3" /> Prot
                                </div>
                                <div className="mt-0.5 text-sm font-bold text-slate-900">{meal.protein}g</div>
                              </div>
                              <div>
                                <div className="text-[10px] font-medium uppercase text-slate-500">Carbs</div>
                                <div className="mt-0.5 text-sm font-bold text-slate-900">{meal.carbs}g</div>
                              </div>
                              <div>
                                <div className="text-[10px] font-medium uppercase text-slate-500">Fat</div>
                                <div className="mt-0.5 text-sm font-bold text-slate-900">{meal.fat}g</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewRecipe(meal)}
                              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              <ChefHat className="h-4 w-4" /> View recipe
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Empty */}
          {hasProfile && !aiLoading && recommendations.length === 0 && !aiError && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Ready for AI recommendations?</h3>
              <p className="mt-1 text-sm text-slate-600">Generate your first personalized meal suggestions.</p>
              <button
                onClick={refreshRecommendations}
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Generate now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

          {/* Recipe Modal */}
          {selectedMeal && (
            <RecipeModal
              meal={selectedMeal}
              isOpen={isRecipeModalOpen}
              onClose={handleCloseRecipe}
            />
          )}

          {/* AI Shopping Assistant Modal */}
          <ShoppingAssistantModal
            isOpen={isShoppingModalOpen}
            onClose={handleCloseShopping}
          />

        {/* AI Nutrition Coach Modal */}
        <NutritionCoachModal
          isOpen={isCoachModalOpen}
          onClose={handleCloseCoach}
        />
      </main>
    </div>
  )
}

export default Dashboard
