import { supabase } from '../lib/supabase';
import { 
  UserProfile, 
  Task, 
  NutritionEntry, 
  WeightRecord,
  Food
} from '../types';

// User Profile Operations
export const userProfileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    return data;
  },

  async createOrUpdateProfile(userId: string, profile: Omit<UserProfile, 'id'>) {
    const profileData = {
      user_id: userId,
      name: profile.name,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      goal_weight: profile.goalWeight,
      activity_level: profile.activityLevel,
      body_fat: profile.bodyFat || null,
    };

    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};

// Task Operations
export const taskService = {
  async getTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category === 'diet' ? 'nutrition' : task.category as 'exercise' | 'nutrition' | 'lifestyle',
      completed: task.completed,
      dueDate: new Date(task.due_date),
      createdAt: new Date(task.created_at)
    })) || [];
  },

  async createTask(userId: string, task: Omit<Task, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: task.title,
        description: task.description,
        category: task.category === 'nutrition' ? 'diet' : task.category,
        completed: task.completed,
        due_date: task.dueDate.toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category === 'diet' ? 'nutrition' : data.category as 'exercise' | 'nutrition' | 'lifestyle',
      completed: data.completed,
      dueDate: new Date(data.due_date),
      createdAt: new Date(data.created_at)
    };
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString();
    
    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId);
    
    if (error) throw error;
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
  }
};

// Nutrition Operations
export const nutritionService = {
  async getNutritionEntries(userId: string, startDate?: Date, endDate?: Date) {
    let query = supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0]);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(entry => ({
      id: entry.id,
      mealType: entry.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      foodName: entry.food_name,
      totalCalories: entry.calories,
      totalProtein: entry.protein,
      totalCarbs: entry.carbs,
      totalFat: entry.fat,
      date: new Date(entry.date),
      foods: [] // For compatibility with existing code
    })) || [];
  },

  async createNutritionEntry(userId: string, entry: Omit<NutritionEntry, 'id'>) {
    // For simplicity, we'll save the aggregated data
    // In a real app, you might want to create a separate foods table
    const { data, error } = await supabase
      .from('nutrition_entries')
      .insert({
        user_id: userId,
        meal_type: entry.mealType,
        food_name: entry.foods?.map((f: Food) => f.name).join(', ') || '',
        calories: entry.totalCalories,
        protein: entry.totalProtein,
        carbs: entry.totalCarbs,
        fat: entry.totalFat,
        date: entry.date.toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      mealType: data.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      foodName: data.food_name,
      totalCalories: data.calories,
      totalProtein: data.protein,
      totalCarbs: data.carbs,
      totalFat: data.fat,
      date: new Date(data.date),
      foods: entry.foods || []
    };
  },

  async deleteNutritionEntry(entryId: string) {
    const { error } = await supabase
      .from('nutrition_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) throw error;
  }
};

// Weight Operations
export const weightService = {
  async getWeightRecords(userId: string, limit?: number) {
    let query = supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(record => ({
      id: record.id,
      weight: record.weight,
      bodyFat: record.body_fat,
      recordedAt: new Date(record.recorded_at),
      createdAt: new Date(record.created_at)
    })) || [];
  },

  async createWeightRecord(userId: string, weight: number, bodyFat?: number) {
    const { data, error } = await supabase
      .from('weight_records')
      .insert({
        user_id: userId,
        weight: weight,
        body_fat: bodyFat || null,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Also update the user profile with the latest weight
    await userProfileService.createOrUpdateProfile(userId, {
      weight: weight,
      bodyFat: bodyFat
    } as any);
    
    return {
      id: data.id,
      weight: data.weight,
      bodyFat: data.body_fat,
      recordedAt: new Date(data.recorded_at),
      createdAt: new Date(data.created_at)
    };
  }
};

// Helper function to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}