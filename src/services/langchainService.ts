import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { MealRecommendation, DetailedRecipe, ShoppingList } from './aiService'

// Define UserProfile interface locally to avoid import issues
interface UserProfile {
  firstName?: string
  lastName?: string
  email?: string
  age?: number
  weight?: number
  height?: number
  targetWeight?: number
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  nutritionPreferences?: {
    dietaryRestrictions?: string[]
    allergies?: string[]
    healthGoals?: string[]
    mealsPerDay?: number
    preferredCuisines?: string[]
    dislikedFoods?: string[]
    budgetRange?: string
  }
}

// Rate limiting - Optimized for real usage
const rateLimiter = {
  requests: 0,
  resetTime: Date.now() + 60000, // Reset every 1 minute
  maxRequests: 10, // Allow 10 requests per minute
  
  canMakeRequest(): boolean {
    const now = Date.now()
    if (now > this.resetTime) {
      this.requests = 0
      this.resetTime = now + 60000 // Reset to 1 minute
    }
    return this.requests < this.maxRequests
  },
  
  recordRequest(): void {
    this.requests++
  }
}

// Initialize OpenAI Chat Model with better error handling
const initializeChatModel = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  console.log('🔍 LangChain: Checking API key...', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'NOT FOUND')
  
  if (!apiKey) {
    console.warn('⚠️ OpenAI API key not found - using fallback responses only')
    return null
  }

  console.log('🔑 LangChain: API key found, initializing ChatOpenAI...')
  
  try {
    return new ChatOpenAI({
      apiKey: apiKey,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 45000,
    })
  } catch (error) {
    console.error('❌ LangChain: Failed to initialize ChatOpenAI:', error)
    return null
  }
}

// Simple conversation memory using Map
const conversationHistory = new Map<string, Array<{ role: string; content: string }>>()

// Get conversation history for a session
const getConversationHistory = (sessionId: string): Array<{ role: string; content: string }> => {
  if (!conversationHistory.has(sessionId)) {
    conversationHistory.set(sessionId, [])
  }
  return conversationHistory.get(sessionId)!
}

// Add message to conversation history
const addToConversationHistory = (sessionId: string, role: string, content: string) => {
  const history = getConversationHistory(sessionId)
  history.push({ role, content })
  
  // Keep only last 10 messages to avoid token limits
  if (history.length > 10) {
    history.splice(0, history.length - 10)
  }
  
  conversationHistory.set(sessionId, history)
}

export class LangChainService {
  private static chatModel = initializeChatModel()

  // Check if we can make API requests
  private static canUseAPI(): boolean {
    // Enable API calls for real AI responses
    return this.chatModel !== null && rateLimiter.canMakeRequest()
  }

  /**
   * Generate meal recommendations using LangChain
   */
  static async generateMealRecommendations(
    userProfile: UserProfile,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    count: number = 5
  ): Promise<MealRecommendation[]> {
    // Check if we can use API or should use fallback
    if (!this.canUseAPI()) {
      console.log('🔗 LangChain: Using fallback due to rate limit or missing API key')
      return this.getFallbackMealRecommendations(userProfile, mealType, count)
    }

    try {
      console.log('🔗 LangChain: Generating meal recommendations...', { mealType, count })
      rateLimiter.recordRequest()

      const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
      const allergies = userProfile.nutritionPreferences?.allergies || []
      const healthGoals = userProfile.nutritionPreferences?.healthGoals || []
      const preferredCuisines = userProfile.nutritionPreferences?.preferredCuisines || ['Indian']
      
      // Calculate meals per cuisine: Use user's mealsPerDay preference for each selected cuisine
      const mealsPerCuisine = userProfile.nutritionPreferences?.mealsPerDay || 3
      const totalMeals = preferredCuisines.length * mealsPerCuisine
      
      console.log('🍽️ Generating meals:', { preferredCuisines, mealsPerCuisine, totalMeals })

      const prompt = PromptTemplate.fromTemplate(`
You are NutriAI, an expert nutritionist and meal planning assistant. Generate personalized meal recommendations for multiple cuisines.

User Profile:
- Current Weight: {weight}kg, Target Weight: {targetWeight}kg
- Dietary Restrictions: {dietaryRestrictions}
- Allergies: {allergies}
- Health Goals: {healthGoals}
- Preferred Cuisines: {preferredCuisines}
- Meal Type: {mealType}

IMPORTANT REQUIREMENTS:
- Generate EXACTLY {mealsPerCuisine} meals for EACH of these cuisines: {preferredCuisines}
- Total meals to generate: {totalMeals}
- All meals must be {dietaryType}
- Avoid all listed allergies
- Support the user's health goals
- Provide balanced nutrition
- Calculate accurate macros
- Make meals authentic to their respective cuisines
- ORGANIZE meals by cuisine - group all meals of same cuisine together
- Set the "cuisine" field correctly for each meal

Return ONLY a valid JSON array with meals GROUPED BY CUISINE in this exact structure:
[
  {{
    "id": "meal_1",
    "name": "Meal Name",
    "description": "Brief description",
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15,
    "fiber": 8,
    "mealType": "{mealType}",
    "prepTime": 20,
    "difficulty": "easy",
    "cuisine": "Indian"
  }}
]

Generate {totalMeals} diverse, authentic meals ({mealsPerCuisine} for each cuisine) now:`)

      const formattedPrompt = await prompt.format({
        count: count.toString(),
        weight: userProfile.weight?.toString() || '60',
        targetWeight: userProfile.targetWeight?.toString() || '60',
        dietaryRestrictions: isVegetarian ? 'Vegetarian' : 'None',
        allergies: allergies.join(', ') || 'None',
        healthGoals: healthGoals.join(', ') || 'General health',
        preferredCuisines: preferredCuisines.join(', '),
        mealType: mealType || 'any meal type',
        dietaryType: isVegetarian ? 'vegetarian' : 'suitable for dietary restrictions',
        mealsPerCuisine: mealsPerCuisine.toString(),
        totalMeals: totalMeals.toString()
      })

      const response = await this.chatModel!.invoke([
        new SystemMessage("You are a professional nutritionist. Always return valid JSON arrays only."),
        new HumanMessage(formattedPrompt)
      ])

      const content = response.content as string
      console.log('🔗 LangChain: Raw meal response:', content)

      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const meals = JSON.parse(jsonMatch[0])
        console.log('✅ LangChain: Generated meals:', meals)
        return meals
      }

      throw new Error('Invalid response format from LangChain')

    } catch (error: any) {
      console.error('❌ LangChain: Failed to generate meal recommendations', error)
      return this.getFallbackMealRecommendations(userProfile, mealType, count)
    }
  }

  /**
   * Generate detailed recipe using LangChain
   */
  static async generateDetailedRecipe(
    mealName: string,
    userProfile: UserProfile,
    servings: number = 1
  ): Promise<DetailedRecipe> {
    // Check if we can use API or should use fallback
    if (!this.canUseAPI()) {
      console.log('🔗 LangChain: Using fallback due to rate limit or missing API key')
      return this.getFallbackRecipe(mealName, servings)
    }

    try {
      rateLimiter.recordRequest()
      console.log('🔗 LangChain: Generating detailed recipe...', { mealName, servings })

      const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
      const allergies = userProfile.nutritionPreferences?.allergies || []

      const prompt = PromptTemplate.fromTemplate(`
You are NutriAI Recipe Master, an expert chef and nutritionist. Create a detailed recipe for "{mealName}".

Requirements:
- Recipe must be {dietaryType}
- Avoid all allergies: {allergies}
- Servings: {servings}
- Include Indian cooking techniques
- Provide precise measurements
- Calculate accurate nutrition per serving

Return ONLY a valid JSON object with this exact structure:
{{
  "id": "recipe_{timestamp}",
  "name": "{mealName}",
  "description": "Detailed description",
  "servings": {servings},
  "prepTime": 15,
  "cookTime": 25,
  "totalTime": 40,
  "difficulty": "medium",
  "cuisine": "Indian",
  "dietaryInfo": ["vegetarian", "gluten-free"],
  "ingredients": [
    {{
      "item": "Ingredient name",
      "quantity": "200",
      "unit": "grams",
      "notes": "preparation notes"
    }}
  ],
  "equipment": ["pan", "knife", "cutting board"],
  "instructions": [
    {{
      "step": 1,
      "instruction": "Detailed cooking instruction",
      "time": "5 minutes",
      "tips": "Helpful tip"
    }}
  ],
  "nutrition": {{
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15,
    "fiber": 8,
    "sugar": 5,
    "sodium": 800,
    "cholesterol": 0
  }},
  "tips": ["Cooking tip 1", "Cooking tip 2"],
  "variations": ["Variation 1", "Variation 2"],
  "storage": "Storage instructions",
  "reheatingInstructions": "Reheating instructions"
}}

Generate the complete recipe now:`)

      const formattedPrompt = await prompt.format({
        mealName,
        servings: servings.toString(),
        dietaryType: isVegetarian ? 'vegetarian' : 'suitable for dietary restrictions',
        allergies: allergies.join(', ') || 'None',
        timestamp: Date.now().toString()
      })

      const response = await this.chatModel.invoke([
        new SystemMessage("You are a professional chef. Always return valid JSON objects only."),
        new HumanMessage(formattedPrompt)
      ])

      const content = response.content as string
      console.log('🔗 LangChain: Raw recipe response:', content)

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const recipe = JSON.parse(jsonMatch[0])
        console.log('✅ LangChain: Generated recipe:', recipe)
        return recipe
      }

      throw new Error('Invalid response format from LangChain')

    } catch (error: any) {
      console.error('❌ LangChain: Failed to generate recipe', error)
      return this.getFallbackRecipe(mealName, servings)
    }
  }

  /**
   * Generate shopping list using LangChain
   */
  static async generateShoppingList(
    userProfile: UserProfile,
    budget: number,
    days: number = 7,
    preferences: string[] = []
  ): Promise<ShoppingList> {
    // Check if we can use API or should use fallback
    if (!this.canUseAPI()) {
      console.log('🔗 LangChain: Using fallback due to rate limit or missing API key')
      return this.getFallbackShoppingList(userProfile, budget, days)
    }

    try {
      rateLimiter.recordRequest()
      console.log('🔗 LangChain: Generating shopping list...', { budget, days, preferences })

      const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
      const allergies = userProfile.nutritionPreferences?.allergies || []
      const healthGoals = userProfile.nutritionPreferences?.healthGoals || []

      const prompt = PromptTemplate.fromTemplate(`
You are NutriAI Shopping Expert, a nutrition-focused grocery planning specialist. Create a comprehensive shopping list for a {dietaryType} person.

USER PROFILE:
- Budget: ₹{budget} (Indian pricing)
- Duration: {days} days of meals
- Dietary Restrictions: {dietaryType}
- Allergies to avoid: {allergies}
- Health goals: {healthGoals}
- Food preferences: {preferences}
- Current weight: {weight}kg, Target: {targetWeight}kg

CRITICAL REQUIREMENTS:
1. USE THE FULL BUDGET OF ₹{budget} - DO NOT UNDERUSE IT
2. Generate a UNIQUE shopping list every time (vary items, quantities, brands)
3. Create a COMPLETE shopping list with ALL food categories
4. Include: Proteins, Vegetables, Fruits, Grains, Dairy, Spices, Oils, Snacks
5. Use realistic Indian grocery prices (2024)
6. Ensure variety - at least 4-6 items per category for higher budgets
7. Calculate total cost to be 85-95% of the given budget
8. Add premium/organic items for higher budgets
9. Include seasonal fruits and vegetables
10. Provide practical shopping tips and money-saving alternatives

Return ONLY a valid JSON object:
{{
  "id": "shopping_{timestamp}",
  "title": "{days}-Day {dietaryType} Shopping List",
  "totalBudget": {budget},
  "estimatedCost": [CALCULATE REAL TOTAL],
  "generatedAt": "{date}",
  "categories": [
    {{
      "category": "Proteins",
      "items": [
        {{
          "name": "Lentils",
          "quantity": "1",
          "unit": "kg",
          "estimatedPrice": 80,
          "priority": "essential",
          "notes": "High protein legume"
        }}
      ]
    }},
    {{
      "category": "Vegetables", 
      "items": [
        {{
          "name": "Tomatoes",
          "quantity": "1",
          "unit": "kg",
          "estimatedPrice": 30,
          "priority": "essential",
          "notes": "Fresh tomatoes"
        }}
      ]
    }},
    {{
      "category": "Fruits",
      "items": [
        {{
          "name": "Bananas",
          "quantity": "1",
          "unit": "kg",
          "estimatedPrice": 40,
          "priority": "recommended",
          "notes": "Rich in potassium"
        }}
      ]
    }},
    {{
      "category": "Grains & Cereals",
      "items": [
        {{
          "name": "Rice",
          "quantity": "5",
          "unit": "kg",
          "estimatedPrice": 200,
          "priority": "essential",
          "notes": "Basmati rice"
        }}
      ]
    }},
    {{
      "category": "Dairy",
      "items": [
        {{
          "name": "Milk",
          "quantity": "2",
          "unit": "L",
          "estimatedPrice": 60,
          "priority": "essential",
          "notes": "Full fat milk"
        }}
      ]
    }},
    {{
      "category": "Spices & Condiments",
      "items": [
        {{
          "name": "Turmeric Powder",
          "quantity": "100",
          "unit": "g",
          "estimatedPrice": 10,
          "priority": "essential",
          "notes": "Organic turmeric"
        }}
      ]
    }}
  ],
  "tips": [
    [GENERATE 4-5 PRACTICAL SHOPPING TIPS]
  ],
  "budgetBreakdown": [
    {{"category": "Proteins", "amount": 270, "percentage": 25}},
    {{"category": "Vegetables", "amount": 240, "percentage": 20}},
    {{"category": "Fruits", "amount": 220, "percentage": 15}}
  ],
  "alternatives": [
    [SUGGEST 3-4 MONEY-SAVING ALTERNATIVES]
  ]
}}

Generate a complete, realistic shopping list now (Session: {sessionId}):`)

      // Add unique session ID to ensure different responses each time
      const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const formattedPrompt = await prompt.format({
        budget: budget.toString(),
        days: days.toString(),
        dietaryType: isVegetarian ? 'Vegetarian' : 'Balanced',
        allergies: allergies.join(', ') || 'None',
        healthGoals: healthGoals.join(', ') || 'General health',
        preferences: preferences.join(', ') || 'None',
        weight: userProfile.weight?.toString() || '60',
        targetWeight: userProfile.targetWeight?.toString() || '60',
        timestamp: Date.now().toString(),
        date: new Date().toISOString(),
        sessionId: sessionId
      })

      const response = await this.chatModel.invoke([
        new SystemMessage("You are a grocery planning expert. Always return valid JSON objects only."),
        new HumanMessage(formattedPrompt)
      ])

      const content = response.content as string
      console.log('🔗 LangChain: Raw shopping response:', content)

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const rawShoppingList = JSON.parse(jsonMatch[0])
        
        // Convert generatedAt string to Date object
        const shoppingList = {
          ...rawShoppingList,
          generatedAt: new Date(rawShoppingList.generatedAt || new Date())
        }
        
        console.log('✅ LangChain: Generated shopping list:', shoppingList)
        return shoppingList
      }

      throw new Error('Invalid response format from LangChain')

    } catch (error: any) {
      console.error('❌ LangChain: Failed to generate shopping list', error)
      return this.getFallbackShoppingList(userProfile, budget, days)
    }
  }

  /**
   * Nutrition Coach Chat with Memory using LangChain
   */
  static async getChatResponse(
    message: string,
    userProfile: UserProfile,
    sessionId: string = 'default'
  ): Promise<string> {
    // Check if we can use API or should use fallback
    if (!this.canUseAPI()) {
      console.log('🔗 LangChain: Using fallback due to rate limit or missing API key')
      return this.getFallbackChatResponse(message, userProfile)
    }

    try {
      rateLimiter.recordRequest()
      console.log('🔗 LangChain: Getting chat response...', { message, sessionId })

      const history = getConversationHistory(sessionId)
      const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
      const healthGoals = userProfile.nutritionPreferences?.healthGoals || []

      // Format conversation history
      const historyText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n')

      const prompt = PromptTemplate.fromTemplate(`
You are NutriAI Coach, a friendly and knowledgeable nutrition expert. You provide personalized advice, answer questions, and motivate users on their health journey.

User Profile:
- Current Weight: {weight}kg, Target Weight: {targetWeight}kg
- Dietary Restrictions: {dietaryRestrictions}
- Health Goals: {healthGoals}

Conversation History:
{history}

User: {input}

Respond as a supportive nutrition coach. Be encouraging, practical, and consider their specific goals and dietary restrictions. Keep responses conversational and helpful.`)

      const formattedPrompt = await prompt.format({
        weight: userProfile.weight?.toString() || '60',
        targetWeight: userProfile.targetWeight?.toString() || '60',
        dietaryRestrictions: isVegetarian ? 'Vegetarian' : 'None',
        healthGoals: healthGoals.join(', ') || 'General health',
        history: historyText || 'No previous conversation',
        input: message
      })

      const response = await this.chatModel.invoke([
        new SystemMessage("You are a supportive nutrition coach. Be encouraging and provide practical advice."),
        new HumanMessage(formattedPrompt)
      ])

      const responseContent = response.content as string
      console.log('✅ LangChain: Generated chat response:', responseContent)

      // Add to conversation history
      addToConversationHistory(sessionId, 'user', message)
      addToConversationHistory(sessionId, 'assistant', responseContent)

      return responseContent

    } catch (error: any) {
      console.error('❌ LangChain: Failed to get chat response', error)
      return this.getFallbackChatResponse(message, userProfile)
    }
  }

  /**
   * Clear conversation history for a session
   */
  static clearConversationHistory(sessionId: string): void {
    conversationHistory.delete(sessionId)
    console.log('🔗 LangChain: Cleared conversation history for session:', sessionId)
  }

  // Fallback methods
  private static getFallbackMealRecommendations(
    userProfile: UserProfile,
    mealType?: string,
    count: number = 5
  ): MealRecommendation[] {
    const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
    
    const fallbackMeals: MealRecommendation[] = [
      {
        id: 'fallback-1',
        name: isVegetarian ? 'Paneer Butter Masala' : 'Grilled Chicken Salad',
        description: isVegetarian ? 'Creamy paneer curry with aromatic spices' : 'Fresh mixed greens with grilled chicken',
        calories: 350,
        protein: 25,
        carbs: 30,
        fat: 15,
        fiber: 8,
        mealType: (mealType as any) || 'lunch',
        prepTime: 25,
        difficulty: 'medium',
        cuisine: isVegetarian ? 'Indian' : 'American',
        ingredients: ['paneer', 'tomatoes', 'onions', 'spices'],
        instructions: ['Heat oil in pan', 'Add spices', 'Cook paneer', 'Serve hot'],
        nutritionFocus: 'High protein for muscle building',
        whyRecommended: 'Perfect balance of protein and healthy fats'
      },
      {
        id: 'fallback-2',
        name: isVegetarian ? 'Dal Tadka with Rice' : 'Baked Salmon',
        description: isVegetarian ? 'Protein-rich lentils with aromatic tempering' : 'Herb-crusted salmon with vegetables',
        calories: 320,
        protein: 22,
        carbs: 35,
        fat: 12,
        fiber: 10,
        mealType: (mealType as any) || 'dinner',
        prepTime: 30,
        difficulty: 'easy',
        cuisine: isVegetarian ? 'Indian' : 'Mediterranean',
        ingredients: ['lentils', 'rice', 'spices', 'vegetables'],
        instructions: ['Cook lentils', 'Prepare tadka', 'Mix and serve', 'Enjoy with rice'],
        nutritionFocus: 'Complete protein and fiber',
        whyRecommended: 'Excellent source of plant-based protein and complex carbs'
      }
    ]

    return fallbackMeals.slice(0, count)
  }

  private static getFallbackRecipe(mealName: string, servings: number): DetailedRecipe {
    return {
      id: `fallback-recipe-${Date.now()}`,
      name: mealName,
      description: `A delicious and nutritious ${mealName} recipe`,
      servings,
      prepTime: 15,
      cookTime: 25,
      totalTime: 40,
      difficulty: 'medium',
      cuisine: 'Indian',
      dietaryInfo: ['vegetarian'],
      ingredients: [
        {
          item: 'Main ingredient',
          quantity: '200',
          unit: 'grams',
          notes: 'Fresh and high quality'
        }
      ],
      equipment: ['pan', 'knife', 'cutting board'],
      instructions: [
        {
          step: 1,
          instruction: 'Prepare all ingredients as specified',
          time: '5 minutes',
          tips: 'Keep ingredients ready before cooking'
        }
      ],
      nutrition: {
        calories: 350,
        protein: 25,
        carbs: 30,
        fat: 15,
        fiber: 8,
        sugar: 5,
        sodium: 800,
        cholesterol: 0
      },
      tips: ['Cook on medium heat', 'Taste and adjust seasoning'],
      variations: ['Add vegetables for extra nutrition'],
      storage: 'Store in refrigerator for up to 3 days',
      reheatingInstructions: 'Reheat in microwave for 1-2 minutes'
    }
  }

  private static getFallbackShoppingList(
    userProfile: UserProfile,
    budget: number,
    days: number
  ): ShoppingList {
    const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
    
    return {
      id: `fallback-shopping-${Date.now()}`,
      title: `${days}-Day ${isVegetarian ? 'Vegetarian ' : ''}Shopping List`,
      totalBudget: budget,
      estimatedCost: budget * 0.8,
      generatedAt: new Date(),
      categories: [
        {
          category: 'Proteins',
          items: [
            {
              name: isVegetarian ? 'Paneer' : 'Chicken breast',
              quantity: '500',
              unit: 'grams',
              estimatedPrice: budget * 0.25,
              priority: 'essential' as const,
              notes: 'Main protein source'
            }
          ]
        }
      ],
      tips: ['Buy seasonal vegetables for better prices'],
      budgetBreakdown: [
        { category: 'Proteins', amount: budget * 0.25, percentage: 25 }
      ],
      alternatives: ['Consider bulk purchases for better value']
    }
  }

  private static getFallbackChatResponse(message: string, userProfile: UserProfile): string {
    const responses = [
      "I'm here to help with your nutrition journey! While I'm having trouble connecting to my AI brain right now, I can tell you that staying consistent with your healthy eating habits is key to reaching your goals.",
      "Great question! Although I'm experiencing some technical difficulties, remember that balanced nutrition with plenty of vegetables, lean proteins, and whole grains will support your health goals.",
      "I appreciate you reaching out! While I work on getting back to full capacity, focus on staying hydrated and eating regular, balanced meals to maintain your energy levels."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
}
