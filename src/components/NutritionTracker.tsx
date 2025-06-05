import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NutritionEntry, Food, DailyGoals, FoodAnalysis } from '../types';
import { format } from 'date-fns';
import FoodImageUpload from './FoodImageUpload';
import QuickFoodPresets, { FoodPreset } from './QuickFoodPresets';
import ImprovedQuickFoodPresets from './ImprovedQuickFoodPresets';
import ModernNutritionInput from './ModernNutritionInput';
import { FaBolt, FaCamera, FaPencilAlt } from 'react-icons/fa';

interface NutritionTrackerProps {
  entries: NutritionEntry[];
  dailyGoals: DailyGoals;
  onAddEntry: (entry: Omit<NutritionEntry, 'id'>) => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ entries, dailyGoals, onAddEntry }) => {
  const [mealType, setMealType] = useState<NutritionEntry['mealType']>('breakfast');
  const [foods, setFoods] = useState<Food[]>([]);
  const [currentFood, setCurrentFood] = useState<Food>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    quantity: 0,
    unit: 'g',
  });
  // const [showImageUpload, setShowImageUpload] = useState(false); // Replaced by inputMode
  const [inputMode, setInputMode] = useState<'quick' | 'image' | 'manual'>('quick');
  
  // Listen for food image selection from FAB
  useEffect(() => {
    const handleFoodImage = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.file) {
        setInputMode('image');
        localStorage.removeItem('pendingFoodImage');
      }
    };
    
    window.addEventListener('foodImageSelected', handleFoodImage);
    
    // Check if there's a pending image when component mounts
    if (localStorage.getItem('pendingFoodImage') === 'true') {
      setInputMode('image');
      localStorage.removeItem('pendingFoodImage');
    }
    
    return () => {
      window.removeEventListener('foodImageSelected', handleFoodImage);
    };
  }, []);

  const todayEntries = entries.filter(
    (entry) => format(entry.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const todayTotals = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.totalCalories,
      protein: acc.protein + entry.totalProtein,
      carbs: acc.carbs + entry.totalCarbs,
      fat: acc.fat + entry.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addFood = () => {
    if (!currentFood.name || currentFood.quantity <= 0) return;
    setFoods([...foods, currentFood]);
    setCurrentFood({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      quantity: 0,
      unit: 'g',
    });
  };

  const handleSubmit = () => {
    if (foods.length === 0) return;

    const totalCalories = foods.reduce((acc, food) => acc + food.calories, 0);
    const totalProtein = foods.reduce((acc, food) => acc + food.protein, 0);
    const totalCarbs = foods.reduce((acc, food) => acc + food.carbs, 0);
    const totalFat = foods.reduce((acc, food) => acc + food.fat, 0);

    onAddEntry({
      date: new Date(),
      mealType,
      foods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    });

    setFoods([]);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleImageAnalysis = (analysis: FoodAnalysis, analyzedMealType: NutritionEntry['mealType']) => {
    const foods: Food[] = analysis.foodItems.map((item, index) => ({
      name: item,
      calories: Math.round(analysis.estimatedCalories / analysis.foodItems.length),
      protein: Math.round(analysis.estimatedProtein / analysis.foodItems.length),
      carbs: Math.round(analysis.estimatedCarbs / analysis.foodItems.length),
      fat: Math.round(analysis.estimatedFat / analysis.foodItems.length),
      quantity: 1,
      unit: '人前'
    }));

    onAddEntry({
      date: new Date(),
      mealType: analyzedMealType,
      foods,
      totalCalories: analysis.estimatedCalories,
      totalProtein: analysis.estimatedProtein,
      totalCarbs: analysis.estimatedCarbs,
      totalFat: analysis.estimatedFat,
    });

    // setShowImageUpload(false); // Replaced by inputMode
    setInputMode('quick');
  };

  const handlePresetSelect = (preset: FoodPreset) => {
    onAddEntry({
      date: new Date(),
      mealType: preset.mealType,
      foods: preset.foods,
      totalCalories: preset.totalCalories,
      totalProtein: preset.totalProtein,
      totalCarbs: preset.totalCarbs,
      totalFat: preset.totalFat,
    });
  };

  return (
    <div className="nutrition-tracker">
      <h2>栄養管理</h2>
      
      <div className="daily-progress">
        <h3>今日の進捗</h3>
        <div className="progress-item">
          <span>カロリー: {todayTotals.calories} / {dailyGoals.calories} kcal</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getProgressPercentage(todayTotals.calories, dailyGoals.calories)}%` }}
            />
          </div>
        </div>
        <div className="progress-item">
          <span>タンパク質: {todayTotals.protein} / {dailyGoals.protein} g</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getProgressPercentage(todayTotals.protein, dailyGoals.protein)}%` }}
            />
          </div>
        </div>
        <div className="progress-item">
          <span>炭水化物: {todayTotals.carbs} / {dailyGoals.carbs} g</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getProgressPercentage(todayTotals.carbs, dailyGoals.carbs)}%` }}
            />
          </div>
        </div>
        <div className="progress-item">
          <span>脂質: {todayTotals.fat} / {dailyGoals.fat} g</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getProgressPercentage(todayTotals.fat, dailyGoals.fat)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="add-meal">
        <h3>食事を記録</h3>
        <div className="input-mode-selector">
          <motion.button
            className={`mode-btn ${inputMode === 'quick' ? 'active' : ''}`}
            onClick={() => setInputMode('quick')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {React.createElement(FaBolt)} クイック選択
          </motion.button>
          <motion.button
            className={`mode-btn ${inputMode === 'image' ? 'active' : ''}`}
            onClick={() => setInputMode('image')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {React.createElement(FaCamera)} 画像で記録
          </motion.button>
          <motion.button
            className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
            onClick={() => setInputMode('manual')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {React.createElement(FaPencilAlt)} 手動入力
          </motion.button>
        </div>

        {inputMode === 'quick' && (
          <ImprovedQuickFoodPresets onSelectPreset={handlePresetSelect} />
        )}

        {inputMode === 'image' && (
          <FoodImageUpload onAnalysisComplete={handleImageAnalysis} />
        )}

        {inputMode === 'manual' && (
          <ModernNutritionInput 
            onAddEntry={(foods, mealType) => {
              const entry: Omit<NutritionEntry, 'id'> = {
                date: new Date(),
                mealType,
                foods,
                totalCalories: foods.reduce((sum, f) => sum + f.calories, 0),
                totalProtein: foods.reduce((sum, f) => sum + f.protein, 0),
                totalCarbs: foods.reduce((sum, f) => sum + f.carbs, 0),
                totalFat: foods.reduce((sum, f) => sum + f.fat, 0),
              };
              onAddEntry(entry);
            }}
          />
        )}
        
      </div>
    </div>
  );
};

export default NutritionTracker;