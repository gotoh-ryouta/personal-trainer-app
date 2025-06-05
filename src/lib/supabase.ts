import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// データベース型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age: number;
          height: number;
          weight: number;
          goal_weight: number;
          activity_level: string;
          body_fat?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          age: number;
          height: number;
          weight: number;
          goal_weight: number;
          activity_level: string;
          body_fat?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          age?: number;
          height?: number;
          weight?: number;
          goal_weight?: number;
          activity_level?: string;
          body_fat?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          completed: boolean;
          due_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          completed?: boolean;
          due_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string;
          completed?: boolean;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      nutrition_entries: {
        Row: {
          id: string;
          user_id: string;
          meal_type: string;
          food_name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: string;
          food_name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_type?: string;
          food_name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          date?: string;
          created_at?: string;
        };
      };
      weight_records: {
        Row: {
          id: string;
          user_id: string;
          weight: number;
          body_fat?: number;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight: number;
          body_fat?: number;
          recorded_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weight?: number;
          body_fat?: number;
          recorded_at?: string;
          created_at?: string;
        };
      };
    };
  };
}