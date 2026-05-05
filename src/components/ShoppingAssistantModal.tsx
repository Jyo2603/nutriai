import { useState } from 'react'
import { AIService } from '../services/aiService'
import { useAuthStore } from '../stores/authStore'
import type { ShoppingList } from '../services/aiService'

interface ShoppingAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

const ShoppingAssistantModal: React.FC<ShoppingAssistantModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuthStore()
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [budget, setBudget] = useState(4000)
  const [days, setDays] = useState(7)
  const [preferences, setPreferences] = useState<string[]>([])
  const [customPreference, setCustomPreference] = useState('')

  const generateShoppingList = async () => {
    if (!userProfile) return

    // Validate budget
    const validBudget = budget < 1000 ? 4000 : budget
    if (budget < 1000) {
      setBudget(4000) // Reset to default if too low
    }

    setIsLoading(true)
    setError(null)
    setShoppingList(null)

    try {
      console.log('🛒 ShoppingModal: Generating shopping list...', { budget: validBudget, days, preferences })
      const list = await AIService.generateShoppingList(userProfile, validBudget, days, preferences)
      console.log('🛒 ShoppingModal: Received shopping list:', list)
      console.log('🛒 ShoppingModal: Categories count:', list?.categories?.length)
      console.log('🛒 ShoppingModal: First category items:', list?.categories?.[0]?.items)
      setShoppingList(list)
    } catch (err: any) {
      console.error('❌ ShoppingModal: Failed to generate shopping list', err)
      setError(err.message || 'Failed to generate shopping list')
    } finally {
      setIsLoading(false)
    }
  }

  const addPreference = () => {
    if (customPreference.trim() && !preferences.includes(customPreference.trim())) {
      setPreferences([...preferences, customPreference.trim()])
      setCustomPreference('')
    }
  }

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">🛒🤖 AI Smart Shopping Assistant</h2>
              <p className="text-gray-600">Generate optimized grocery lists based on your goals & budget</p>
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
          {/* Input Form */}
          {!shoppingList && (
            <div className="space-y-6">
              {/* Budget & Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={budget === 0 ? '' : budget}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || value === '0') {
                        setBudget(0) // Allow empty input temporarily
                      } else {
                        const numValue = parseInt(value)
                        if (!isNaN(numValue) && numValue > 0) {
                          setBudget(numValue)
                        }
                      }
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (budget === 0) {
                        e.target.value = ''
                      }
                    }}
                    placeholder="Enter budget (₹1000-₹50000)"
                    min="1000"
                    max="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Days
                  </label>
                  <select
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>1 Week</option>
                    <option value={14}>2 Weeks</option>
                    <option value={30}>1 Month</option>
                  </select>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Preferences (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customPreference}
                    onChange={(e) => setCustomPreference(e.target.value)}
                    placeholder="e.g., organic, local, bulk items..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && addPreference()}
                  />
                  <button
                    onClick={addPreference}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
                
                {/* Preference Tags */}
                {preferences.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.map((pref, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {pref}
                        <button
                          onClick={() => removePreference(pref)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={generateShoppingList}
                  disabled={isLoading}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '🤖 Generating...' : '🛒 Generate Smart Shopping List'}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">🤖 AI is creating your optimized shopping list...</p>
                <p className="text-gray-500 text-sm mt-2">Analyzing your preferences, budget, and nutrition goals</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass-card p-4 bg-red-100/50 border-red-200 mb-6">
              <p className="text-red-700">❌ {error}</p>
              <button 
                onClick={generateShoppingList}
                className="mt-2 text-red-600 underline text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Shopping List Results */}
          {shoppingList && !isLoading && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{shoppingList.title}</h3>
                  <button
                    onClick={() => setShoppingList(null)}
                    className="btn-secondary text-sm"
                  >
                    🔄 Generate New List
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">₹{shoppingList.estimatedCost.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Estimated Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">₹{shoppingList.totalBudget}</div>
                    <div className="text-sm text-gray-600">Your Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{(shoppingList.totalBudget - shoppingList.estimatedCost).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Savings</div>
                  </div>
                </div>
              </div>

              {/* Shopping Categories */}
              {shoppingList.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="glass-card p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">🛍️ {category.category}</h4>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{item.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.priority === 'essential' ? 'bg-red-100 text-red-800' :
                              item.priority === 'recommended' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                            {item.notes && ` • ${item.notes}`}
                          </div>
                        </div>
                        <div className="text-green-600 font-bold">
                          ₹{(item.estimatedPrice || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Budget Breakdown */}
              {shoppingList.budgetBreakdown.length > 0 && (
                <div className="glass-card p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">💰 Budget Breakdown</h4>
                  <div className="space-y-2">
                    {shoppingList.budgetBreakdown.map((breakdown, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{breakdown.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{breakdown.percentage}%</span>
                          <span className="font-bold text-green-600">₹{(breakdown.amount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips & Alternatives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shoppingList.tips.length > 0 && (
                  <div className="glass-card p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Shopping Tips</h4>
                    <ul className="space-y-2">
                      {shoppingList.tips.map((tip, index) => (
                        <li key={index} className="text-gray-700 text-sm">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {shoppingList.alternatives.length > 0 && (
                  <div className="glass-card p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">🔄 Budget Alternatives</h4>
                    <ul className="space-y-2">
                      {shoppingList.alternatives.map((alt, index) => (
                        <li key={index} className="text-gray-700 text-sm">• {alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShoppingAssistantModal
