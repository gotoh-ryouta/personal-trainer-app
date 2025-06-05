import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBarcode, FaPlus, FaMinus, FaCheck } from 'react-icons/fa';
import { Food, NutritionEntry } from '../types';

interface ModernNutritionInputProps {
  onAddEntry: (foods: Food[], mealType: NutritionEntry['mealType']) => void;
}

const commonFoods = [
  { name: '白米', emoji: '🍚', calories: 168, protein: 2.5, carbs: 37.1, fat: 0.3, defaultQuantity: 150, unit: 'g' },
  { name: '鶏胸肉', emoji: '🍗', calories: 108, protein: 22.3, carbs: 0, fat: 1.5, defaultQuantity: 100, unit: 'g' },
  { name: 'たまご', emoji: '🥚', calories: 151, protein: 12.6, carbs: 1.6, fat: 10.3, defaultQuantity: 50, unit: 'g' },
  { name: 'ブロッコリー', emoji: '🥦', calories: 33, protein: 2.8, carbs: 5.6, fat: 0.4, defaultQuantity: 100, unit: 'g' },
  { name: 'サーモン', emoji: '🍣', calories: 200, protein: 22.5, carbs: 0, fat: 12.5, defaultQuantity: 100, unit: 'g' },
  { name: 'バナナ', emoji: '🍌', calories: 86, protein: 1.1, carbs: 22.8, fat: 0.2, defaultQuantity: 100, unit: 'g' },
  { name: 'アボカド', emoji: '🥑', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, defaultQuantity: 100, unit: 'g' },
  { name: 'プロテイン', emoji: '🥤', calories: 120, protein: 24, carbs: 3, fat: 1, defaultQuantity: 30, unit: 'g' },
];

const ModernNutritionInput: React.FC<ModernNutritionInputProps> = ({ onAddEntry }) => {
  const [selectedFoods, setSelectedFoods] = useState<Array<Food & { id: string }>>([]);
  const [mealType, setMealType] = useState<NutritionEntry['mealType']>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState<Food>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    quantity: 100,
    unit: 'g'
  });

  const filteredFoods = commonFoods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addCommonFood = (food: typeof commonFoods[0]) => {
    const newFood: Food & { id: string } = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      quantity: food.defaultQuantity,
      unit: food.unit
    };
    setSelectedFoods([...selectedFoods, newFood]);
  };

  const updateFoodQuantity = (id: string, delta: number) => {
    setSelectedFoods(selectedFoods.map(food => {
      if (food.id === id) {
        const newQuantity = Math.max(0, food.quantity + delta);
        const ratio = newQuantity / food.quantity;
        return {
          ...food,
          quantity: newQuantity,
          calories: Math.round(food.calories * ratio),
          protein: Math.round(food.protein * ratio * 10) / 10,
          carbs: Math.round(food.carbs * ratio * 10) / 10,
          fat: Math.round(food.fat * ratio * 10) / 10
        };
      }
      return food;
    }));
  };

  const removeFood = (id: string) => {
    setSelectedFoods(selectedFoods.filter(food => food.id !== id));
  };

  const handleSave = () => {
    if (selectedFoods.length > 0) {
      onAddEntry(selectedFoods, mealType);
      setSelectedFoods([]);
      setSearchQuery('');
    }
  };

  const addCustomFood = () => {
    if (customFood.name && customFood.quantity > 0) {
      const newFood: Food & { id: string } = {
        ...customFood,
        id: Date.now().toString()
      };
      setSelectedFoods([...selectedFoods, newFood]);
      setCustomFood({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        quantity: 100,
        unit: 'g'
      });
      setShowCustomFood(false);
    }
  };

  const totalNutrition = selectedFoods.reduce((acc, food) => ({
    calories: acc.calories + food.calories,
    protein: acc.protein + food.protein,
    carbs: acc.carbs + food.carbs,
    fat: acc.fat + food.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="modern-nutrition-input">
      {/* Meal Type Selector */}
      <div className="meal-type-selector">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
          <motion.button
            key={type}
            className={`meal-type-btn ${mealType === type ? 'active' : ''}`}
            onClick={() => setMealType(type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {type === 'breakfast' && '🌅 朝食'}
            {type === 'lunch' && '☀️ 昼食'}
            {type === 'dinner' && '🌙 夕食'}
            {type === 'snack' && '🍿 間食'}
          </motion.button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="food-search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="食品を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <motion.button
          className="barcode-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => alert('バーコードスキャン機能は開発中です')}
        >
          <FaBarcode />
        </motion.button>
      </div>

      {/* Common Foods Grid */}
      <div className="common-foods-grid">
        {filteredFoods.map((food, index) => (
          <motion.button
            key={food.name}
            className="food-item-card"
            onClick={() => addCommonFood(food)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="food-emoji">{food.emoji}</span>
            <span className="food-name">{food.name}</span>
            <div className="food-info">
              <span className="calories">{food.calories}kcal</span>
              <span className="quantity">{food.defaultQuantity}{food.unit}</span>
            </div>
          </motion.button>
        ))}
        <motion.button
          className="food-item-card custom"
          onClick={() => setShowCustomFood(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="food-emoji">➕</span>
          <span className="food-name">カスタム</span>
          <div className="food-info">
            <span className="calories">手動入力</span>
          </div>
        </motion.button>
      </div>

      {/* Custom Food Input Modal */}
      <AnimatePresence>
        {showCustomFood && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomFood(false)}
            />
            <motion.div
              className="custom-food-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <h3>カスタム食品を追加</h3>
            <input
              type="text"
              placeholder="食品名"
              value={customFood.name}
              onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
            />
            <div className="nutrition-inputs">
              <div className="input-group">
                <label>カロリー</label>
                <input
                  type="number"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood({ ...customFood, calories: Number(e.target.value) })}
                />
                <span>kcal</span>
              </div>
              <div className="input-group">
                <label>タンパク質</label>
                <input
                  type="number"
                  value={customFood.protein}
                  onChange={(e) => setCustomFood({ ...customFood, protein: Number(e.target.value) })}
                />
                <span>g</span>
              </div>
              <div className="input-group">
                <label>炭水化物</label>
                <input
                  type="number"
                  value={customFood.carbs}
                  onChange={(e) => setCustomFood({ ...customFood, carbs: Number(e.target.value) })}
                />
                <span>g</span>
              </div>
              <div className="input-group">
                <label>脂質</label>
                <input
                  type="number"
                  value={customFood.fat}
                  onChange={(e) => setCustomFood({ ...customFood, fat: Number(e.target.value) })}
                />
                <span>g</span>
              </div>
            </div>
            <div className="modal-actions">
              <motion.button
                className="cancel-btn"
                onClick={() => setShowCustomFood(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                キャンセル
              </motion.button>
              <motion.button
                className="add-btn"
                onClick={addCustomFood}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                追加
              </motion.button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Selected Foods List */}
      {selectedFoods.length > 0 && (
        <motion.div
          className="selected-foods-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>選択した食品</h3>
          {selectedFoods.map((food, index) => (
            <motion.div
              key={food.id}
              className="selected-food-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="food-details">
                <span className="food-name">{food.name}</span>
                <span className="food-calories">{food.calories}kcal</span>
              </div>
              <div className="quantity-controls">
                <motion.button
                  onClick={() => updateFoodQuantity(food.id, -10)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaMinus />
                </motion.button>
                <span>{food.quantity}{food.unit}</span>
                <motion.button
                  onClick={() => updateFoodQuantity(food.id, 10)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaPlus />
                </motion.button>
                <motion.button
                  className="remove-btn"
                  onClick={() => removeFood(food.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
            </motion.div>
          ))}
          
          {/* Total Nutrition Summary */}
          <div className="nutrition-summary">
            <div className="summary-item calories">
              <span>合計</span>
              <span>{totalNutrition.calories}kcal</span>
            </div>
            <div className="summary-item">
              <span>P</span>
              <span>{totalNutrition.protein.toFixed(1)}g</span>
            </div>
            <div className="summary-item">
              <span>C</span>
              <span>{totalNutrition.carbs.toFixed(1)}g</span>
            </div>
            <div className="summary-item">
              <span>F</span>
              <span>{totalNutrition.fat.toFixed(1)}g</span>
            </div>
          </div>

          <motion.button
            className="save-meal-btn"
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaCheck /> 食事を記録
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ModernNutritionInput;