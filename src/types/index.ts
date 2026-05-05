// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLogin?: Date;
  profileComplete: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Nutrition and Diet Types
export interface NutritionPreferences {
  dietaryRestrictions: DietaryRestriction[];
  allergies: string[];
  healthGoals: HealthGoal[];
  activityLevel: ActivityLevel;
  mealsPerDay: number;
  preferredCuisines: string[];
  dislikedFoods: string[];
  budgetRange: BudgetRange;
}

export interface UserProfile extends User {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  targetWeight?: number; // in kg
  nutritionPreferences?: NutritionPreferences;
}

export type DietaryRestriction = 
  | 'vegetarian' 
  | 'vegan' 
  | 'pescatarian' 
  | 'keto' 
  | 'paleo' 
  | 'mediterranean' 
  | 'low-carb' 
  | 'low-fat' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'none';

export type HealthGoal = 
  | 'weight-loss' 
  | 'weight-gain' 
  | 'muscle-gain' 
  | 'maintain-weight' 
  | 'improve-energy' 
  | 'better-digestion' 
  | 'heart-health' 
  | 'diabetes-management';

export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';

export type BudgetRange = 'low' | 'medium' | 'high' | 'unlimited';

// Meal and Recipe Types
export interface Meal {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  mealType: MealType;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  nutrition: NutritionInfo;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
  sugar: number; // in grams
  sodium: number; // in mg
  cholesterol?: number; // in mg
  vitamins?: { [key: string]: number };
  minerals?: { [key: string]: number };
}

// AI and Recommendations Types
export interface MealRecommendation {
  meal: Meal;
  matchScore: number; // 0-100
  reasons: string[];
  nutritionMatch: {
    calories: boolean;
    macros: boolean;
    restrictions: boolean;
    allergies: boolean;
  };
}

export interface DailyMealPlan {
  date: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    snacks?: Meal[];
  };
  totalNutrition: NutritionInfo;
  calorieGoal: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface WeeklyMealPlan {
  weekOf: string;
  days: DailyMealPlan[];
  shoppingList: ShoppingListItem[];
  totalBudget?: number;
}

export interface ShoppingListItem {
  ingredient: string;
  amount: number;
  unit: string;
  category: string;
  estimatedCost?: number;
  purchased?: boolean;
}

// Chat and AI Assistant Types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'meal-suggestion' | 'recipe' | 'nutrition-tip';
  metadata?: {
    mealId?: string;
    recipeId?: string;
    nutritionData?: NutritionInfo;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  topic?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form and UI Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}
