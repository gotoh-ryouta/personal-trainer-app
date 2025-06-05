import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Food, NutritionEntry } from '../types';
import { FaTrash, FaPlus, FaMinus, FaCheck, FaTimes } from 'react-icons/fa';

export interface FoodPreset {
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

interface ImprovedQuickFoodPresetsProps {
  onSelectPreset: (preset: FoodPreset) => void;
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
      { name: 'ヨーグルト', calories: 60, protein: 10, carbs: 4, fat: 0, quantity: 150, unit: 'g' },
      { name: 'ベリーミックス', calories: 40, protein: 1, carbs: 10, fat: 0, quantity: 50, unit: 'g' }
    ],
    totalCalories: 250,
    totalProtein: 16,
    totalCarbs: 41,
    totalFat: 3,
    mealType: 'breakfast'
  },
  {
    id: 'salmon-set',
    name: 'サーモン定食',
    emoji: '🍣',
    foods: [
      { name: 'サーモン', calories: 200, protein: 22, carbs: 0, fat: 12, quantity: 100, unit: 'g' },
      { name: '玄米', calories: 165, protein: 3.5, carbs: 35, fat: 1.5, quantity: 150, unit: 'g' },
      { name: 'ブロッコリー', calories: 35, protein: 3, carbs: 7, fat: 0, quantity: 100, unit: 'g' }
    ],
    totalCalories: 400,
    totalProtein: 28.5,
    totalCarbs: 42,
    totalFat: 13.5,
    mealType: 'dinner'
  }
];

const ImprovedQuickFoodPresets: React.FC<ImprovedQuickFoodPresetsProps> = ({ onSelectPreset }) => {
  const [selectedPreset, setSelectedPreset] = useState<FoodPreset | null>(null);
  const [editingFoods, setEditingFoods] = useState<Food[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  const handlePresetClick = (preset: FoodPreset) => {
    setSelectedPreset(preset);
    setEditingFoods(preset.foods.map(food => ({ ...food })));
    setShowEditor(true);
  };

  const updateFoodQuantity = (index: number, delta: number) => {
    const newFoods = [...editingFoods];
    const food = newFoods[index];
    const newQuantity = Math.max(10, food.quantity + delta);
    const ratio = newQuantity / food.quantity;
    
    newFoods[index] = {
      ...food,
      quantity: newQuantity,
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10
    };
    
    setEditingFoods(newFoods);
  };

  const removeFoodItem = (index: number) => {
    setEditingFoods(editingFoods.filter((_, i) => i !== index));
  };

  const confirmSelection = () => {
    if (selectedPreset && editingFoods.length > 0) {
      const totals = editingFoods.reduce((acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      onSelectPreset({
        ...selectedPreset,
        foods: editingFoods,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat
      });
      
      setShowEditor(false);
      setSelectedPreset(null);
    }
  };

  const cancelSelection = () => {
    setShowEditor(false);
    setSelectedPreset(null);
    setEditingFoods([]);
  };

  return (
    <div className="improved-quick-presets">
      <div className="preset-grid">
        {DEFAULT_PRESETS.map((preset, index) => (
          <motion.div
            key={preset.id}
            className="preset-card"
            onClick={() => handlePresetClick(preset)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="preset-emoji">{preset.emoji}</div>
            <div className="preset-name">{preset.name}</div>
            <div className="preset-calories">{preset.totalCalories}kcal</div>
            <div className="preset-macros">
              <span className="macro-item protein">P{preset.totalProtein}g</span>
              <span className="macro-item carbs">C{preset.totalCarbs}g</span>
              <span className="macro-item fat">F{preset.totalFat}g</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showEditor && selectedPreset && (
          <motion.div
            className="preset-editor-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelSelection}
          >
            <motion.div
              className="preset-editor"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="editor-header">
                <h3>{selectedPreset.emoji} {selectedPreset.name}をカスタマイズ</h3>
                <motion.button
                  className="close-btn"
                  onClick={cancelSelection}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {React.createElement(FaTimes)}
                </motion.button>
              </div>

              <div className="food-items-list">
                {editingFoods.map((food, index) => (
                  <motion.div
                    key={index}
                    className="food-item-editor"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="food-info">
                      <span className="food-name">{food.name}</span>
                      <span className="food-nutrition">
                        {food.calories}kcal | P:{food.protein}g | C:{food.carbs}g | F:{food.fat}g
                      </span>
                    </div>
                    
                    <div className="food-controls">
                      <div className="quantity-controls">
                        <motion.button
                          onClick={() => updateFoodQuantity(index, -10)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {React.createElement(FaMinus)}
                        </motion.button>
                        <span className="quantity">{food.quantity}{food.unit}</span>
                        <motion.button
                          onClick={() => updateFoodQuantity(index, 10)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {React.createElement(FaPlus)}
                        </motion.button>
                      </div>
                      
                      <motion.button
                        className="remove-btn"
                        onClick={() => removeFoodItem(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {React.createElement(FaTrash)}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {editingFoods.length === 0 && (
                <div className="empty-message">
                  すべての食品を削除しました。キャンセルするか、他のプリセットを選択してください。
                </div>
              )}

              <div className="editor-summary">
                <div className="summary-item">
                  <span>合計</span>
                  <span className="total-calories">
                    {editingFoods.reduce((sum, f) => sum + f.calories, 0)}kcal
                  </span>
                </div>
                <div className="summary-item">
                  <span>P</span>
                  <span>{editingFoods.reduce((sum, f) => sum + f.protein, 0).toFixed(1)}g</span>
                </div>
                <div className="summary-item">
                  <span>C</span>
                  <span>{editingFoods.reduce((sum, f) => sum + f.carbs, 0).toFixed(1)}g</span>
                </div>
                <div className="summary-item">
                  <span>F</span>
                  <span>{editingFoods.reduce((sum, f) => sum + f.fat, 0).toFixed(1)}g</span>
                </div>
              </div>

              <div className="editor-actions">
                <motion.button
                  className="cancel-btn"
                  onClick={cancelSelection}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  キャンセル
                </motion.button>
                <motion.button
                  className="confirm-btn"
                  onClick={confirmSelection}
                  disabled={editingFoods.length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {React.createElement(FaCheck)} この内容で記録
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImprovedQuickFoodPresets;