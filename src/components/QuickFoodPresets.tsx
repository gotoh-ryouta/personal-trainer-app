import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Food, NutritionEntry } from '../types';

interface FoodPreset {
  id: string;
  name: string;
  emoji: string;
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: NutritionEntry['mealType'];
}

const DEFAULT_PRESETS: FoodPreset[] = [
  {
    id: 'chicken-rice',
    name: '鶏むね定食',
    emoji: '🍗',
    foods: [
      { name: '鶏むね肉（皮なし）', calories: 220, protein: 45, carbs: 0, fat: 3, quantity: 200, unit: 'g' },
      { name: '白米', calories: 252, protein: 4, carbs: 56, fat: 0.5, quantity: 150, unit: 'g' },
      { name: 'サラダ', calories: 20, protein: 1, carbs: 4, fat: 0, quantity: 100, unit: 'g' }
    ],
    totalCalories: 492,
    totalProtein: 50,
    totalCarbs: 60,
    totalFat: 3.5,
    mealType: 'lunch'
  },
  {
    id: 'protein-shake',
    name: 'プロテインシェイク',
    emoji: '🥤',
    foods: [
      { name: 'プロテインパウダー', calories: 120, protein: 24, carbs: 3, fat: 1, quantity: 30, unit: 'g' },
      { name: 'バナナ', calories: 93, protein: 1, carbs: 24, fat: 0, quantity: 100, unit: 'g' },
      { name: '牛乳', calories: 130, protein: 6, carbs: 10, fat: 7, quantity: 200, unit: 'ml' }
    ],
    totalCalories: 343,
    totalProtein: 31,
    totalCarbs: 37,
    totalFat: 8,
    mealType: 'snack'
  },
  {
    id: 'oatmeal',
    name: 'オートミール朝食',
    emoji: '🥣',
    foods: [
      { name: 'オートミール', calories: 150, protein: 5, carbs: 27, fat: 3, quantity: 40, unit: 'g' },
      { name: 'ブルーベリー', calories: 40, protein: 0.5, carbs: 10, fat: 0, quantity: 70, unit: 'g' },
      { name: 'はちみつ', calories: 60, protein: 0, carbs: 16, fat: 0, quantity: 20, unit: 'g' }
    ],
    totalCalories: 250,
    totalProtein: 5.5,
    totalCarbs: 53,
    totalFat: 3,
    mealType: 'breakfast'
  },
  {
    id: 'salmon-meal',
    name: 'サーモン定食',
    emoji: '🍣',
    foods: [
      { name: 'サーモン', calories: 280, protein: 40, carbs: 0, fat: 12, quantity: 150, unit: 'g' },
      { name: '玄米', calories: 165, protein: 3, carbs: 35, fat: 1, quantity: 100, unit: 'g' },
      { name: 'ブロッコリー', calories: 35, protein: 3, carbs: 7, fat: 0, quantity: 100, unit: 'g' }
    ],
    totalCalories: 480,
    totalProtein: 46,
    totalCarbs: 42,
    totalFat: 13,
    mealType: 'dinner'
  },
  {
    id: 'egg-toast',
    name: 'エッグトースト',
    emoji: '🍳',
    foods: [
      { name: '全粒粉パン', calories: 140, protein: 6, carbs: 24, fat: 2, quantity: 60, unit: 'g' },
      { name: '卵', calories: 150, protein: 12, carbs: 1, fat: 10, quantity: 100, unit: 'g' },
      { name: 'アボカド', calories: 80, protein: 1, carbs: 4, fat: 7, quantity: 50, unit: 'g' }
    ],
    totalCalories: 370,
    totalProtein: 19,
    totalCarbs: 29,
    totalFat: 19,
    mealType: 'breakfast'
  },
  {
    id: 'pasta-chicken',
    name: 'チキンパスタ',
    emoji: '🍝',
    foods: [
      { name: 'パスタ', calories: 220, protein: 8, carbs: 44, fat: 1, quantity: 60, unit: 'g' },
      { name: '鶏むね肉', calories: 110, protein: 23, carbs: 0, fat: 1.5, quantity: 100, unit: 'g' },
      { name: 'トマトソース', calories: 40, protein: 1, carbs: 8, fat: 0.5, quantity: 100, unit: 'g' }
    ],
    totalCalories: 370,
    totalProtein: 32,
    totalCarbs: 52,
    totalFat: 3,
    mealType: 'lunch'
  }
];

interface QuickFoodPresetsProps {
  onSelectPreset: (preset: FoodPreset) => void;
}

const QuickFoodPresets: React.FC<QuickFoodPresetsProps> = ({ onSelectPreset }) => {
  const [customPresets, setCustomPresets] = useState<FoodPreset[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('customFoodPresets');
    const recent = localStorage.getItem('recentlyUsedPresets');
    
    if (saved) {
      setCustomPresets(JSON.parse(saved));
    }
    if (recent) {
      setRecentlyUsed(JSON.parse(recent));
    }
  }, []);

  const handlePresetClick = (preset: FoodPreset) => {
    // Update recently used
    const newRecent = [preset.id, ...recentlyUsed.filter(id => id !== preset.id)].slice(0, 3);
    setRecentlyUsed(newRecent);
    localStorage.setItem('recentlyUsedPresets', JSON.stringify(newRecent));
    
    onSelectPreset(preset);
  };

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];
  const recentPresets = recentlyUsed
    .map(id => allPresets.find(p => p.id === id))
    .filter(Boolean) as FoodPreset[];

  return (
    <div className="quick-food-presets">
      {recentPresets.length > 0 && (
        <div className="preset-section">
          <h3>最近使った食事</h3>
          <div className="preset-grid">
            {recentPresets.map((preset) => (
              <motion.button
                key={preset.id}
                className="preset-card recent"
                onClick={() => handlePresetClick(preset)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="preset-emoji">{preset.emoji}</span>
                <span className="preset-name">{preset.name}</span>
                <span className="preset-calories">{preset.totalCalories}kcal</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="preset-section">
        <h3>よく食べる食事をワンタップで記録</h3>
        <div className="preset-grid">
          {DEFAULT_PRESETS.map((preset, index) => (
            <motion.button
              key={preset.id}
              className="preset-card"
              onClick={() => handlePresetClick(preset)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="preset-emoji">{preset.emoji}</span>
              <span className="preset-name">{preset.name}</span>
              <div className="preset-macros">
                <span className="macro-item protein">P: {preset.totalProtein}g</span>
                <span className="macro-item carbs">C: {preset.totalCarbs}g</span>
                <span className="macro-item fat">F: {preset.totalFat}g</span>
              </div>
              <span className="preset-calories">{preset.totalCalories}kcal</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickFoodPresets;
export { DEFAULT_PRESETS };
export type { FoodPreset };