export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'exercise' | 'nutrition' | 'lifestyle';
  completed: boolean;
  dueDate: Date;
  createdAt: Date;
}

export interface NutritionEntry {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface Food {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
  exerciseMinutes: number;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  bodyFat?: number;
  goalWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goals: DailyGoals;
  fitnessGoal?: FitnessGoal;
}

export interface FitnessGoal {
  targetWeight: number;
  targetMuscleMass: number;
  targetBodyFatPercentage: number;
  targetDate: Date;
  currentMuscleMass?: number;
  currentBodyFatPercentage?: number;
}

export interface FitnessPlan {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  phases: PlanPhase[];
  weeklyPlan: WeeklyPlan;
  createdAt: Date;
}

export interface PlanPhase {
  name: string;
  duration: number; // weeks
  focus: 'bulking' | 'cutting' | 'maintenance';
  dailyCalories: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  workoutFrequency: number;
}

export interface WeeklyPlan {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

export interface DayPlan {
  workoutType: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'cardio' | 'rest' | 'full-body';
  exercises: Exercise[];
  nutritionFocus: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  notes?: string;
}

export interface FoodAnalysis {
  imageUrl?: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  foodItems: string[];
  confidence: number;
  suggestions: string[];
}

export interface WeightRecord {
  id: string;
  weight: number;
  bodyFat?: number;
  recordedAt: Date;
  createdAt: Date;
}