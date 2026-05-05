import { useState, useEffect } from 'react'
import { AIService, type MealRecommendation, type DetailedRecipe } from '../services/aiService'
import { useAuthStore } from '../stores/authStore'

interface RecipeModalProps {
  meal: MealRecommendation
  isOpen: boolean
  onClose: () => void
}

const RecipeModal: React.FC<RecipeModalProps> = ({ meal, isOpen, onClose }) => {
  const { userProfile } = useAuthStore()
  const [recipe, setRecipe] = useState<DetailedRecipe | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Generate recipe when modal opens (always 1 serving)
  useEffect(() => {
    if (isOpen && meal && userProfile && !recipe) {
      generateRecipe()
    }
  }, [isOpen, meal, userProfile])

  const generateRecipe = async () => {
    if (!userProfile) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🍳 RecipeModal: Generating recipe for', meal.name)
      const detailedRecipe = await AIService.generateDetailedRecipe(
        meal.name,
        1, // Always generate for 1 serving
        userProfile
      )
      setRecipe(detailedRecipe)
    } catch (err: any) {
      console.error('❌ RecipeModal: Failed to generate recipe', err)
      setError(err.message || 'Failed to generate recipe')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">🍳 Recipe Details</h2>
              <p className="text-gray-600">{meal.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">🤖 AI is generating your detailed recipe...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass-card p-4 bg-red-100/50 border-red-200 mb-6">
              <p className="text-red-700">❌ {error}</p>
              <button 
                onClick={generateRecipe}
                className="mt-2 text-red-600 underline text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Recipe Content */}
          {recipe && !isLoading && (
            <div className="space-y-6">
              {/* Recipe Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{recipe.totalTime}</div>
                  <div className="text-sm text-gray-600">Total Time (min)</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{recipe.difficulty}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">1</div>
                  <div className="text-sm text-gray-600">Serving</div>
                </div>
              </div>

              {/* Description & Dietary Info */}
              <div className="glass-card p-4">
                <p className="text-gray-700 mb-3">{recipe.description}</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietaryInfo.map((info, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {info}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutrition Information */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Nutrition (per serving)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{recipe.nutrition.calories}</div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{recipe.nutrition.protein}g</div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{recipe.nutrition.carbs}g</div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{recipe.nutrition.fat}g</div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>
              </div>

              {/* Equipment Needed */}
              {recipe.equipment.length > 0 && (
                <div className="glass-card p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Equipment Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.equipment.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🛒 Ingredients</h3>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{ingredient.item}</span>
                        {ingredient.notes && (
                          <span className="text-gray-500 text-sm ml-2">({ingredient.notes})</span>
                        )}
                      </div>
                      <div className="text-gray-600 font-medium">
                        {ingredient.quantity} {ingredient.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">👨‍🍳 Instructions</h3>
                <div className="space-y-4">
                  {recipe.instructions.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 mb-1">{step.instruction}</p>
                        {step.time && (
                          <p className="text-green-600 text-sm font-medium">⏱️ {step.time}</p>
                        )}
                        {step.tips && (
                          <p className="text-blue-600 text-sm">💡 {step.tips}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips & Variations */}
              {(recipe.tips.length > 0 || recipe.variations.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipe.tips.length > 0 && (
                    <div className="glass-card p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Cooking Tips</h3>
                      <ul className="space-y-2">
                        {recipe.tips.map((tip, index) => (
                          <li key={index} className="text-gray-700 text-sm">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recipe.variations.length > 0 && (
                    <div className="glass-card p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">🔄 Variations</h3>
                      <ul className="space-y-2">
                        {recipe.variations.map((variation, index) => (
                          <li key={index} className="text-gray-700 text-sm">• {variation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Storage & Reheating */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📦 Storage & Reheating</h3>
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Storage:</strong> {recipe.storage}
                </p>
                {recipe.reheatingInstructions && (
                  <p className="text-gray-700 text-sm">
                    <strong>Reheating:</strong> {recipe.reheatingInstructions}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecipeModal
