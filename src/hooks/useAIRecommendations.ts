import { useState, useEffect } from 'react'
import { AIService } from '../services/aiService'
import type { MealRecommendation, UserProfile } from '../services/aiService'
import { useAuthStore } from '../stores/authStore'

export const useAIRecommendations = () => {
  const { user, userProfile } = useAuthStore()
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generate meal recommendations for the current user
   */
  const generateRecommendations = async (
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    count: number = 3
  ) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🤖 useAIRecommendations: Generating recommendations...', { user, userProfile })

      // Combine user and profile data
      const fullProfile: UserProfile = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: userProfile?.age,
        gender: userProfile?.gender,
        height: userProfile?.height,
        weight: userProfile?.weight,
        targetWeight: userProfile?.targetWeight,
        nutritionPreferences: userProfile?.nutritionPreferences
      }

      const newRecommendations = await AIService.generateMealRecommendations(
        fullProfile,
        mealType,
        count
      )

      setRecommendations(newRecommendations)
      console.log('✅ useAIRecommendations: Recommendations generated:', newRecommendations)
      
    } catch (err: any) {
      console.error('❌ useAIRecommendations: Failed to generate recommendations', err)
      setError(err.message || 'Failed to generate recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Auto-generate recommendations when user profile is available (only once)
   */
  useEffect(() => {
    if (user && userProfile && recommendations.length === 0 && userProfile.profileComplete) {
      console.log('🤖 useAIRecommendations: Auto-generating initial recommendations...')
      // Use user's selected meals per day, default to 3 if not set
      const mealsCount = userProfile.nutritionPreferences?.mealsPerDay || 3
      console.log('🤖 useAIRecommendations: Using meals per day:', mealsCount)
      generateRecommendations('lunch', mealsCount)
    }
  }, [user?.id, userProfile?.profileComplete])

  /**
   * Clear recommendations
   */
  const clearRecommendations = () => {
    setRecommendations([])
    setError(null)
  }

  /**
   * Refresh recommendations
   */
  const refreshRecommendations = () => {
    const mealsCount = userProfile?.nutritionPreferences?.mealsPerDay || 3
    console.log('🤖 useAIRecommendations: Refreshing with meals per day:', mealsCount)
    generateRecommendations('lunch', mealsCount)
  }

  return {
    recommendations,
    isLoading,
    error,
    generateRecommendations,
    clearRecommendations,
    refreshRecommendations,
    hasProfile: !!(user && userProfile)
  }
}
