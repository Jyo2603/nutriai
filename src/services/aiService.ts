import OpenAI from 'openai'
import { LangChainService } from './langchainService'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
})

export interface UserProfile {
  firstName: string
  lastName: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  height?: number // cm
  weight?: number // kg
  targetWeight?: number // kg
  nutritionPreferences?: {
    dietaryRestrictions: string[]
    allergies: string[]
    healthGoals: string[]
    activityLevel: string
    mealsPerDay: number
    preferredCuisines: string[]
    dislikedFoods: string[]
    budgetRange: string
  }
}

export interface MealRecommendation {
  id: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  prepTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  ingredients: string[]
  instructions: string[]
  nutritionFocus: string
  whyRecommended: string
}

export interface DetailedRecipe {
  id: string
  name: string
  description: string
  servings: number
  prepTime: number
  cookTime: number
  totalTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  dietaryInfo: string[]
  
  // Detailed ingredients with quantities
  ingredients: {
    item: string
    quantity: string
    unit: string
    notes?: string
  }[]
  
  // Equipment needed
  equipment: string[]
  
  // Step-by-step instructions
  instructions: {
    step: number
    instruction: string
    time?: string
    tips?: string
  }[]
  
  // Nutritional information per serving
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
    cholesterol: number
  }
  
  // Additional info
  tips: string[]
  variations: string[]
  storage: string
  reheatingInstructions?: string
}

export interface ShoppingList {
  id: string
  title: string
  totalBudget: number
  estimatedCost: number
  generatedAt: Date
  
  // Categorized items
  categories: {
    category: string
    items: {
      name: string
      quantity: string
      unit: string
      estimatedPrice: number
      priority: 'essential' | 'recommended' | 'optional'
      notes?: string
    }[]
  }[]
  
  // Additional info
  tips: string[]
  budgetBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
  alternatives: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export class AIService {
  
  /**
   * Generate personalized meal recommendations based on user profile using LangChain
   */
  static async generateMealRecommendations(
    userProfile: UserProfile,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    count: number = 3
  ): Promise<MealRecommendation[]> {
    // Use LangChain for enhanced AI capabilities
    return LangChainService.generateMealRecommendations(userProfile, mealType, count)
  }

  /**
   * Legacy method - kept for backward compatibility
   */
  static async generateMealRecommendationsLegacy(
    userProfile: UserProfile,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    count: number = 3
  ): Promise<MealRecommendation[]> {
    try {
      console.log('🤖 AIService: Generating meal recommendations...', { userProfile, mealType, count })
      
      const prompt = this.createMealRecommendationPrompt(userProfile, mealType, count)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are NutriAI, an expert nutritionist and meal planning assistant. You provide personalized, evidence-based nutrition advice and meal recommendations. Always consider the user's health goals, dietary restrictions, and preferences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      console.log('🤖 AIService: Raw AI response:', response)
      
      // Parse the AI response into structured meal recommendations
      const recommendations = this.parseMealRecommendations(response, mealType)
      
      console.log('✅ AIService: Generated meal recommendations:', recommendations)
      return recommendations
      
    } catch (error: any) {
      console.error('❌ AIService: Failed to generate meal recommendations', error)
      
      // Return fallback recommendations if AI fails
      return this.getFallbackRecommendations(userProfile, mealType, count)
    }
  }

  /**
   * Create a detailed prompt for meal recommendations
   */
  private static createMealRecommendationPrompt(
    userProfile: UserProfile,
    mealType?: string,
    count: number = 3
  ): string {
    const { 
      firstName, 
      age, 
      gender, 
      height, 
      weight, 
      targetWeight, 
      nutritionPreferences 
    } = userProfile

    const weightGoal = weight && targetWeight 
      ? (targetWeight > weight ? 'weight gain' : 'weight loss')
      : 'maintenance'
    
    const weightDifference = weight && targetWeight 
      ? Math.abs(targetWeight - weight)
      : 0

    return `
Generate ${count} personalized meal recommendations for ${firstName} with the following profile:

**Personal Info:**
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}  
- Height: ${height || 'Not specified'}cm
- Current Weight: ${weight || 'Not specified'}kg
- Target Weight: ${targetWeight || 'Not specified'}kg
- Goal: ${weightGoal} (${weightDifference}kg difference)

**CRITICAL DIETARY REQUIREMENTS:**
- DIETARY RESTRICTIONS: ${nutritionPreferences?.dietaryRestrictions?.join(', ') || 'None'} 
  ${nutritionPreferences?.dietaryRestrictions?.includes('vegetarian') ? '⚠️ STRICTLY VEGETARIAN - NO MEAT, CHICKEN, FISH, OR SEAFOOD ALLOWED!' : ''}
  ${nutritionPreferences?.dietaryRestrictions?.includes('vegan') ? '⚠️ STRICTLY VEGAN - NO ANIMAL PRODUCTS AT ALL!' : ''}
- Allergies: ${nutritionPreferences?.allergies?.join(', ') || 'None'}
- Health Goals: ${nutritionPreferences?.healthGoals?.join(', ') || 'General health'}
- Activity Level: ${nutritionPreferences?.activityLevel || 'Moderate'}
- Preferred Cuisines: ${nutritionPreferences?.preferredCuisines?.join(', ') || 'Any'}
- Disliked Foods: ${nutritionPreferences?.dislikedFoods?.join(', ') || 'None'}
- Budget: ${nutritionPreferences?.budgetRange || 'Medium'}

**Meal Type:** ${mealType || 'Any meal'}

Please provide ${count} meal recommendations in the following JSON format:
[
  {
    "name": "Meal Name",
    "description": "Brief description of the meal",
    "calories": 450,
    "protein": 25,
    "carbs": 40,
    "fat": 15,
    "fiber": 8,
    "mealType": "${mealType || 'lunch'}",
    "prepTime": 20,
    "difficulty": "easy",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "nutritionFocus": "High protein for muscle building",
    "whyRecommended": "Perfect for your weight gain goals with balanced macros"
  }
]

CRITICAL REQUIREMENTS - MUST FOLLOW:
1. ${nutritionPreferences?.dietaryRestrictions?.includes('vegetarian') ? 'ABSOLUTELY NO MEAT, CHICKEN, FISH, OR SEAFOOD - ONLY VEGETARIAN INGREDIENTS!' : ''}
2. ${nutritionPreferences?.dietaryRestrictions?.includes('vegan') ? 'ABSOLUTELY NO ANIMAL PRODUCTS - NO DAIRY, EGGS, MEAT, FISH - ONLY VEGAN INGREDIENTS!' : ''}
3. ${weightGoal === 'weight gain' ? 'High-calorie, nutrient-dense foods for healthy weight gain' : 'Balanced, satisfying meals for weight management'}
4. STRICTLY respect all dietary restrictions and allergies
5. Practical, achievable recipes
6. Nutritional balance appropriate for goals

${nutritionPreferences?.dietaryRestrictions?.includes('vegetarian') ? 'REMINDER: This user is VEGETARIAN - use only plant-based proteins like lentils, beans, tofu, paneer, nuts, seeds. NO MEAT OR FISH!' : ''}
`
  }

  /**
   * Parse AI response into structured meal recommendations
   */
  private static parseMealRecommendations(
    response: string,
    mealType?: string
  ): MealRecommendation[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((meal: any, index: number) => ({
          id: `ai-meal-${Date.now()}-${index}`,
          name: meal.name || 'AI Generated Meal',
          description: meal.description || 'Personalized meal recommendation',
          calories: meal.calories || 400,
          protein: meal.protein || 20,
          carbs: meal.carbs || 30,
          fat: meal.fat || 15,
          fiber: meal.fiber || 5,
          mealType: meal.mealType || mealType || 'lunch',
          prepTime: meal.prepTime || 30,
          difficulty: meal.difficulty || 'medium',
          ingredients: meal.ingredients || [],
          instructions: meal.instructions || [],
          nutritionFocus: meal.nutritionFocus || 'Balanced nutrition',
          whyRecommended: meal.whyRecommended || 'Tailored to your goals'
        }));
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON, using fallback');
    }

    // Fallback: create recommendations from text response
    return this.createRecommendationsFromText(response, mealType);
  }

  /**
   * Create recommendations from text when JSON parsing fails
   */
  private static createRecommendationsFromText(
    response: string,
    mealType?: string
  ): MealRecommendation[] {
    // Simple fallback - create one recommendation from the response
    return [{
      id: `ai-meal-${Date.now()}`,
      name: 'AI Recommended Meal',
      description: response.substring(0, 100) + '...',
      calories: 450,
      protein: 25,
      carbs: 35,
      fat: 18,
      fiber: 6,
      mealType: (mealType as any) || 'lunch',
      prepTime: 30,
      difficulty: 'medium' as const,
      ingredients: ['See AI recommendations for details'],
      instructions: ['Follow AI guidance provided'],
      nutritionFocus: 'Personalized nutrition',
      whyRecommended: 'Generated by AI based on your profile'
    }];
  }

  /**
   * Fallback recommendations when AI is unavailable
   */
  private static getFallbackRecommendations(
    userProfile: UserProfile,
    mealType?: string,
    count: number = 3
  ): MealRecommendation[] {
    const isWeightGain = userProfile.weight && userProfile.targetWeight 
      ? userProfile.targetWeight > userProfile.weight 
      : false;
    
    const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian');
    const isVegan = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegan');

    const fallbackMeals: MealRecommendation[] = isWeightGain ? [
      {
        id: 'fallback-1',
        name: isVegetarian ? 'High-Protein Quinoa Bowl with Paneer' : 'High-Protein Quinoa Bowl',
        description: isVegetarian 
          ? 'Nutrient-dense quinoa with paneer, avocado, and nuts for healthy vegetarian weight gain'
          : 'Nutrient-dense quinoa with chicken, avocado, and nuts for healthy weight gain',
        calories: 650,
        protein: 35,
        carbs: 45,
        fat: 28,
        fiber: 8,
        mealType: (mealType as any) || 'lunch',
        prepTime: 25,
        difficulty: 'easy' as const,
        ingredients: isVegetarian 
          ? ['Quinoa', 'Paneer cubes', 'Avocado', 'Mixed nuts', 'Olive oil', 'Chickpeas']
          : ['Quinoa', 'Grilled chicken', 'Avocado', 'Mixed nuts', 'Olive oil'],
        instructions: isVegetarian
          ? ['Cook quinoa', 'Pan-fry paneer', 'Add chickpeas', 'Combine with toppings']
          : ['Cook quinoa', 'Grill chicken', 'Combine with toppings'],
        nutritionFocus: 'High calories and protein for weight gain',
        whyRecommended: isVegetarian 
          ? 'Perfect vegetarian meal for your weight gain goals with plant-based protein and healthy fats'
          : 'Perfect for your weight gain goals with healthy fats and protein'
      },
      {
        id: 'fallback-2',
        name: 'Peanut Butter Banana Smoothie',
        description: 'Calorie-rich smoothie with protein powder for muscle building',
        calories: 520,
        protein: 30,
        carbs: 38,
        fat: 22,
        fiber: 6,
        mealType: 'snack' as const,
        prepTime: 5,
        difficulty: 'easy' as const,
        ingredients: ['Banana', 'Peanut butter', 'Protein powder', 'Milk', 'Honey'],
        instructions: ['Blend all ingredients', 'Serve immediately'],
        nutritionFocus: 'High protein and healthy fats',
        whyRecommended: 'Quick and easy way to add calories and protein to your diet'
      }
    ] : [
      {
        id: 'fallback-1',
        name: 'Mediterranean Salad',
        description: 'Fresh vegetables with lean protein and healthy fats',
        calories: 420,
        protein: 25,
        carbs: 20,
        fat: 18,
        fiber: 8,
        mealType: (mealType as any) || 'lunch',
        prepTime: 15,
        difficulty: 'easy' as const,
        ingredients: ['Mixed greens', 'Grilled chicken', 'Feta cheese', 'Olive oil'],
        instructions: ['Combine ingredients', 'Drizzle with dressing'],
        nutritionFocus: 'Balanced macros with lean protein',
        whyRecommended: 'Balanced nutrition for your health goals'
      }
    ];

    return fallbackMeals.slice(0, count);
  }

  /**
   * Generate detailed recipe using LangChain
   */
  static async generateDetailedRecipe(
    mealName: string,
    servings: number = 1,
    userProfile?: UserProfile
  ): Promise<DetailedRecipe> {
    // Use LangChain for enhanced AI capabilities
    if (userProfile) {
      return LangChainService.generateDetailedRecipe(mealName, userProfile, servings)
    }
    
    // Fallback to legacy method if no user profile
    return this.generateDetailedRecipeLegacy(mealName, servings)
  }

  /**
   * Legacy detailed recipe generation
   */
  static async generateDetailedRecipeLegacy(
    mealName: string,
    servings: number = 1
  ): Promise<DetailedRecipe> {
    try {
      console.log('🍳 AIService: Generating detailed recipe...', { mealName, servings })
      
      const prompt = this.createRecipePrompt(mealName, servings)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are NutriAI, an expert chef and nutritionist. You create detailed, easy-to-follow recipes with precise measurements, cooking techniques, and nutritional information. Always consider dietary restrictions and health goals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      console.log('🍳 AIService: Raw recipe response:', response)
      
      // Parse the AI response into structured recipe
      const recipe = this.parseDetailedRecipe(response, mealName)
      
      console.log('✅ AIService: Generated detailed recipe:', recipe)
      return recipe
      
    } catch (error: any) {
      console.error('❌ AIService: Failed to generate recipe', error)
      
      // Return fallback recipe if AI fails
      return this.getFallbackRecipe(mealName, userProfile, servings)
    }
  }

  /**
   * Create a detailed prompt for recipe generation
   */
  private static createRecipePrompt(
    mealName: string,
    userProfile: UserProfile,
    servings: number
  ): string {
    const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
    const isVegan = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegan')
    const allergies = userProfile.nutritionPreferences?.allergies || []
    const healthGoals = userProfile.nutritionPreferences?.healthGoals || []

    return `
Generate a detailed recipe for "${mealName}" with the following requirements:

**Dietary Requirements:**
- ${isVegetarian ? 'STRICTLY VEGETARIAN - NO MEAT, FISH, OR SEAFOOD' : ''}
- ${isVegan ? 'STRICTLY VEGAN - NO ANIMAL PRODUCTS AT ALL' : ''}
- Allergies to avoid: ${allergies.join(', ') || 'None'}
- Health goals: ${healthGoals.join(', ') || 'General health'}

**Recipe Specifications:**
- Servings: ${servings}
- Include precise measurements and quantities
- Step-by-step cooking instructions
- Cooking times for each step
- Equipment needed
- Nutritional information per serving

Please provide the recipe in the following JSON format:
{
  "name": "${mealName}",
  "description": "Brief description of the dish",
  "servings": ${servings},
  "prepTime": 20,
  "cookTime": 30,
  "totalTime": 50,
  "difficulty": "easy",
  "cuisine": "Indian",
  "dietaryInfo": ["vegetarian", "high-protein"],
  
  "ingredients": [
    {
      "item": "Paneer",
      "quantity": "200",
      "unit": "grams",
      "notes": "cut into cubes"
    }
  ],
  
  "equipment": ["Large pan", "Mixing bowl", "Knife"],
  
  "instructions": [
    {
      "step": 1,
      "instruction": "Heat oil in a large pan over medium heat",
      "time": "2 minutes",
      "tips": "Make sure oil is hot but not smoking"
    }
  ],
  
  "nutrition": {
    "calories": 400,
    "protein": 25,
    "carbs": 30,
    "fat": 18,
    "fiber": 6,
    "sugar": 8,
    "sodium": 800,
    "cholesterol": 20
  },
  
  "tips": ["Cooking tip 1", "Cooking tip 2"],
  "variations": ["Variation 1", "Variation 2"],
  "storage": "Store in refrigerator for up to 3 days",
  "reheatingInstructions": "Reheat in microwave for 1-2 minutes"
}

CRITICAL: Ensure all ingredients and instructions are ${isVegetarian ? 'vegetarian' : 'appropriate for the dietary requirements'}. Provide accurate nutritional information and practical cooking advice.
`
  }

  /**
   * Parse AI response into structured recipe
   */
  private static parseDetailedRecipe(
    response: string,
    mealName: string
  ): DetailedRecipe {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `recipe-${Date.now()}`,
          name: parsed.name || mealName,
          description: parsed.description || 'Delicious homemade recipe',
          servings: parsed.servings || 2,
          prepTime: parsed.prepTime || 20,
          cookTime: parsed.cookTime || 30,
          totalTime: parsed.totalTime || 50,
          difficulty: parsed.difficulty || 'medium',
          cuisine: parsed.cuisine || 'International',
          dietaryInfo: parsed.dietaryInfo || [],
          ingredients: parsed.ingredients || [],
          equipment: parsed.equipment || [],
          instructions: parsed.instructions || [],
          nutrition: parsed.nutrition || {
            calories: 400,
            protein: 20,
            carbs: 30,
            fat: 15,
            fiber: 5,
            sugar: 8,
            sodium: 800,
            cholesterol: 20
          },
          tips: parsed.tips || [],
          variations: parsed.variations || [],
          storage: parsed.storage || 'Store in refrigerator for up to 3 days',
          reheatingInstructions: parsed.reheatingInstructions
        };
      }
    } catch (error) {
      console.warn('Failed to parse recipe response as JSON, using fallback');
    }

    // Fallback: create basic recipe from text response
    return this.createRecipeFromText(response, mealName);
  }

  /**
   * Create recipe from text when JSON parsing fails
   */
  private static createRecipeFromText(
    response: string,
    mealName: string
  ): DetailedRecipe {
    return {
      id: `recipe-${Date.now()}`,
      name: mealName,
      description: 'AI-generated recipe with detailed instructions',
      servings: 2,
      prepTime: 20,
      cookTime: 30,
      totalTime: 50,
      difficulty: 'medium' as const,
      cuisine: 'International',
      dietaryInfo: ['vegetarian'],
      ingredients: [
        { item: 'See AI response', quantity: '1', unit: 'portion', notes: 'Check AI instructions' }
      ],
      equipment: ['Basic cooking equipment'],
      instructions: [
        { step: 1, instruction: response.substring(0, 200) + '...', time: '30 minutes' }
      ],
      nutrition: {
        calories: 400,
        protein: 20,
        carbs: 30,
        fat: 15,
        fiber: 5,
        sugar: 8,
        sodium: 800,
        cholesterol: 20
      },
      tips: ['Follow AI guidance for best results'],
      variations: ['See AI response for variations'],
      storage: 'Store in refrigerator for up to 3 days'
    };
  }

  /**
   * Fallback recipe when AI is unavailable
   */
  private static getFallbackRecipe(
    mealName: string,
    userProfile: UserProfile,
    servings: number
  ): DetailedRecipe {
    const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
    
    return {
      id: `fallback-recipe-${Date.now()}`,
      name: mealName,
      description: `A delicious ${isVegetarian ? 'vegetarian' : ''} recipe for ${mealName}`,
      servings,
      prepTime: 20,
      cookTime: 30,
      totalTime: 50,
      difficulty: 'medium' as const,
      cuisine: 'International',
      dietaryInfo: isVegetarian ? ['vegetarian'] : [],
      ingredients: [
        { item: 'Main ingredient', quantity: '200', unit: 'grams', notes: 'Adjust to taste' },
        { item: 'Spices', quantity: '1', unit: 'tsp', notes: 'As needed' },
        { item: 'Oil', quantity: '2', unit: 'tbsp', notes: 'For cooking' }
      ],
      equipment: ['Pan', 'Knife', 'Cutting board'],
      instructions: [
        { step: 1, instruction: 'Prepare all ingredients', time: '10 minutes' },
        { step: 2, instruction: 'Cook according to traditional method', time: '30 minutes' },
        { step: 3, instruction: 'Serve hot', time: '2 minutes' }
      ],
      nutrition: {
        calories: 400,
        protein: 20,
        carbs: 30,
        fat: 15,
        fiber: 5,
        sugar: 8,
        sodium: 800,
        cholesterol: 20
      },
      tips: ['Cook on medium heat', 'Taste and adjust seasoning'],
      variations: ['Add vegetables for extra nutrition'],
      storage: 'Store in refrigerator for up to 3 days',
      reheatingInstructions: 'Reheat in microwave for 1-2 minutes'
    };
  }

  /**
   * Generate AI-powered shopping list using LangChain
   */
  static async generateShoppingList(
    userProfile: UserProfile,
    budget: number,
    days: number = 7,
    preferences: string[] = []
  ): Promise<ShoppingList> {
    // Use LangChain for enhanced AI capabilities
    return LangChainService.generateShoppingList(userProfile, budget, days, preferences)
  }

  /**
   * Legacy shopping list generation
   */
  static async generateShoppingListLegacy(
    userProfile: UserProfile,
    budget: number,
    days: number = 7,
    preferences: string[] = []
  ): Promise<ShoppingList> {
    try {
      console.log('🛒 AIService: Generating shopping list...', { budget, days, preferences })
      
      const prompt = this.createShoppingPrompt(userProfile, budget, days, preferences)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are NutriAI Shopping Assistant, an expert nutritionist and budget-conscious shopper. You create optimized grocery lists that maximize nutrition while staying within budget. Always consider dietary restrictions, health goals, and local pricing."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      console.log('🛒 AIService: Raw shopping response:', response)
      
      // Parse the AI response into structured shopping list
      const shoppingList = this.parseShoppingList(response, budget)
      
      console.log('✅ AIService: Generated shopping list:', shoppingList)
      return shoppingList
      
    } catch (error: any) {
      console.error('❌ AIService: Failed to generate shopping list', error)
      
      // Return fallback shopping list if AI fails
      return this.getFallbackShoppingList(userProfile, budget, days)
    }
  }

  /**
   * AI Nutrition Coach chat response using LangChain with memory
   */
  static async getChatResponse(
    message: string,
    userProfile: UserProfile,
    sessionId: string = 'default'
  ): Promise<string> {
    // Use LangChain for enhanced AI capabilities with conversation memory
    return LangChainService.getChatResponse(message, userProfile, sessionId)
  }

  /**
   * Clear conversation history for a session
   */
  static clearConversationHistory(sessionId: string = 'default'): void {
    LangChainService.clearConversationHistory(sessionId)
  }

  /**
   * Legacy chat response method
   */
  static async getChatResponseLegacy(
    message: string,
    userProfile: UserProfile,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      console.log('💬 AIService: Getting chat response...', { message })
      
      const prompt = this.createChatPrompt(message, userProfile, chatHistory)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are NutriAI Coach, a friendly and knowledgeable nutrition expert. You provide personalized advice, answer questions, and motivate users on their health journey. Always be encouraging, practical, and consider their specific goals and dietary restrictions. Keep responses conversational and helpful."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      console.log('💬 AIService: Chat response:', response)
      return response
      
    } catch (error: any) {
      console.error('❌ AIService: Failed to get chat response', error)
      
      // Return fallback response
      return this.getFallbackChatResponse(message, userProfile)
    }
  }

  /**
   * Create shopping list prompt
   */
  private static createShoppingPrompt(
    userProfile: UserProfile,
    budget: number,
    days: number,
    preferences: string[]
  ): string {
    const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
    const isVegan = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegan')
    const allergies = userProfile.nutritionPreferences?.allergies || []
    const healthGoals = userProfile.nutritionPreferences?.healthGoals || []

    return `
Generate an optimized grocery shopping list for ${days} days with the following requirements:

**User Profile:**
- Budget: ₹${budget}
- Dietary restrictions: ${isVegetarian ? 'Vegetarian' : ''} ${isVegan ? 'Vegan' : ''}
- Allergies: ${allergies.join(', ') || 'None'}
- Health goals: ${healthGoals.join(', ') || 'General health'}
- Additional preferences: ${preferences.join(', ') || 'None'}

**Requirements:**
- Stay within ₹${budget} budget (Indian pricing)
- Prioritize nutrition and health goals
- Include variety and balanced meals
- Consider meal prep efficiency
- Suggest alternatives for budget optimization
- Use Indian grocery prices and local ingredients

Please provide the shopping list in this JSON format:
{
  "title": "Weekly Vegetarian Shopping List",
  "totalBudget": ${budget},
  "estimatedCost": 3200.50,
  "categories": [
    {
      "category": "Proteins",
      "items": [
        {
          "name": "Paneer",
          "quantity": "500",
          "unit": "grams",
          "estimatedPrice": 8.00,
          "priority": "essential",
          "notes": "For protein needs"
        }
      ]
    }
  ],
  "tips": ["Buy in bulk to save money", "Check for seasonal discounts"],
  "budgetBreakdown": [
    {"category": "Proteins", "amount": 15.00, "percentage": 33}
  ],
  "alternatives": ["If paneer is expensive, try tofu or lentils"]
}

CRITICAL: Ensure all items are ${isVegetarian ? 'vegetarian' : 'appropriate for dietary restrictions'}. Provide realistic pricing and practical shopping advice.
`
  }

  /**
   * Create chat prompt with context
   */
  private static createChatPrompt(
    message: string,
    userProfile: UserProfile,
    chatHistory: ChatMessage[]
  ): string {
    const isVegetarian = userProfile.nutritionPreferences?.dietaryRestrictions?.includes('vegetarian')
    const healthGoals = userProfile.nutritionPreferences?.healthGoals || []
    const recentHistory = chatHistory.slice(-5) // Last 5 messages for context

    let historyContext = ''
    if (recentHistory.length > 0) {
      historyContext = 'Recent conversation:\n' + 
        recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') + '\n\n'
    }

    return `
${historyContext}User Profile:
- Dietary restrictions: ${isVegetarian ? 'Vegetarian' : 'None'}
- Health goals: ${healthGoals.join(', ') || 'General health'}
- Current weight: ${userProfile.weight}kg, Target: ${userProfile.targetWeight}kg

User question: "${message}"

Please provide a helpful, personalized response as their nutrition coach. Be encouraging and practical.
`
  }

  /**
   * Parse shopping list response
   */
  private static parseShoppingList(response: string, budget: number): ShoppingList {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `shopping-${Date.now()}`,
          title: parsed.title || 'AI Generated Shopping List',
          totalBudget: budget,
          estimatedCost: parsed.estimatedCost || budget * 0.9,
          generatedAt: new Date(),
          categories: parsed.categories || [],
          tips: parsed.tips || [],
          budgetBreakdown: parsed.budgetBreakdown || [],
          alternatives: parsed.alternatives || []
        };
      }
    } catch (error) {
      console.warn('Failed to parse shopping list response as JSON, using fallback');
    }

    return this.createShoppingListFromText(response, budget);
  }

  /**
   * Create shopping list from text when JSON parsing fails
   */
  private static createShoppingListFromText(response: string, budget: number): ShoppingList {
    return {
      id: `shopping-${Date.now()}`,
      title: 'AI Generated Shopping List',
      totalBudget: budget,
      estimatedCost: budget * 0.85,
      generatedAt: new Date(),
      categories: [
        {
          category: 'Essential Items',
          items: [
            {
              name: 'See AI response for details',
              quantity: '1',
              unit: 'portion',
              estimatedPrice: budget * 0.5,
              priority: 'essential' as const,
              notes: 'Check AI recommendations'
            }
          ]
        }
      ],
      tips: ['Follow AI guidance for best results'],
      budgetBreakdown: [
        { category: 'Essential Items', amount: budget * 0.85, percentage: 85 }
      ],
      alternatives: ['See AI response for alternatives']
    };
  }

  /**
   * Fallback shopping list when AI is unavailable
   */
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
        },
        {
          category: 'Vegetables',
          items: [
            {
              name: 'Mixed vegetables',
              quantity: '2',
              unit: 'kg',
              estimatedPrice: budget * 0.3,
              priority: 'essential' as const,
              notes: 'For vitamins and fiber'
            }
          ]
        },
        {
          category: 'Grains',
          items: [
            {
              name: 'Rice/Wheat',
              quantity: '1',
              unit: 'kg',
              estimatedPrice: budget * 0.15,
              priority: 'essential' as const,
              notes: 'Carbohydrate source'
            }
          ]
        }
      ],
      tips: [
        'Buy seasonal vegetables for better prices',
        'Consider bulk purchases for staples',
        'Check local markets for fresh produce'
      ],
      budgetBreakdown: [
        { category: 'Proteins', amount: budget * 0.25, percentage: 25 },
        { category: 'Vegetables', amount: budget * 0.3, percentage: 30 },
        { category: 'Grains', amount: budget * 0.15, percentage: 15 },
        { category: 'Others', amount: budget * 0.3, percentage: 30 }
      ],
      alternatives: [
        'If paneer is expensive, try tofu or lentils',
        'Frozen vegetables are often cheaper than fresh',
        'Buy whole grains in bulk for better value'
      ]
    };
  }

  /**
   * Fallback chat response when AI is unavailable
   */
  private static getFallbackChatResponse(message: string, userProfile: UserProfile): string {
    const responses = [
      "I'm here to help with your nutrition journey! While I'm having trouble connecting to my AI brain right now, I can tell you that staying consistent with your healthy eating habits is key to reaching your goals.",
      "Great question! Although I'm experiencing some technical difficulties, remember that balanced nutrition with plenty of vegetables, lean proteins, and whole grains will support your health goals.",
      "I appreciate you reaching out! While I work on getting back to full capacity, focus on staying hydrated and eating regular, balanced meals to maintain your energy levels.",
      "Thanks for your patience! Even though I'm having connectivity issues, I want to remind you that small, consistent changes in your diet can lead to big results over time."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
