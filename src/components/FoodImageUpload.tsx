import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeFood } from '../services/geminiService';
import { FoodAnalysis, NutritionEntry } from '../types';

interface FoodImageUploadProps {
  onAnalysisComplete: (analysis: FoodAnalysis, mealType: NutritionEntry['mealType']) => void;
}

const FoodImageUpload: React.FC<FoodImageUploadProps> = ({ onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [mealType, setMealType] = useState<NutritionEntry['mealType']>('lunch');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // 画像選択後、自動で分析を開始
      setTimeout(() => {
        handleAnalyzeWithFile(file);
      }, 500);
    }
  };

  const handleAnalyzeWithFile = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFood(file);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert('画像の分析中にエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // handleAnalyze is kept for potential future use with manual trigger
  // const handleAnalyze = async () => {
  //   if (!selectedImage) return;
  //   handleAnalyzeWithFile(selectedImage);
  // };

  // ドラッグ&ドロップ対応
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        // 自動で分析開始
        setTimeout(() => {
          handleAnalyzeWithFile(file);
        }, 500);
      }
    }
  }, []);

  const handleSaveAnalysis = () => {
    if (analysis) {
      onAnalysisComplete(analysis, mealType);
      // Reset state
      setSelectedImage(null);
      setImagePreview('');
      setAnalysis(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      className={`food-image-upload ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>食事画像をアップロード</h3>
      
      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        
        <AnimatePresence>
          {!imagePreview && (
            <motion.div 
              className="upload-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="drag-drop-zone">
                <p className="drag-text">
                  {isDragging ? '🎆 ここにドロップ！' : '📷 画像をドラッグ&ドロップ'}
                </p>
                <p className="or-text">または</p>
                <div className="upload-buttons">
                  <motion.button 
                    onClick={handleCameraCapture} 
                    className="camera-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📷 カメラで撮影
                  </motion.button>
                  <motion.button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="gallery-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🖼️ ギャラリーから選択
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {imagePreview && !analysis && (
            <motion.div 
              className="image-preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <img src={imagePreview} alt="Selected food" />
              {isAnalyzing && (
                <div className="analyzing-overlay">
                  <motion.div
                    className="analyzing-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    🔍
                  </motion.div>
                  <p>画像を分析中...</p>
                </div>
              )}
              <div className="meal-type-quick-select">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                  <motion.button
                    key={type}
                    className={`meal-type-btn ${mealType === type ? 'active' : ''}`}
                    onClick={() => setMealType(type)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {type === 'breakfast' && '🍳 朝食'}
                    {type === 'lunch' && '🍱 昼食'}
                    {type === 'dinner' && '🍝 夕食'}
                    {type === 'snack' && '🍪 間食'}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {analysis && (
          <motion.div 
            className="analysis-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
          <h4>分析結果</h4>
          <div className="nutrition-info">
            <div className="nutrition-item">
              <span className="label">推定カロリー:</span>
              <span className="value">{analysis.estimatedCalories} kcal</span>
            </div>
            <div className="nutrition-item">
              <span className="label">タンパク質:</span>
              <span className="value">{analysis.estimatedProtein} g</span>
            </div>
            <div className="nutrition-item">
              <span className="label">炭水化物:</span>
              <span className="value">{analysis.estimatedCarbs} g</span>
            </div>
            <div className="nutrition-item">
              <span className="label">脂質:</span>
              <span className="value">{analysis.estimatedFat} g</span>
            </div>
          </div>
          
          <div className="food-items">
            <h5>検出された食品:</h5>
            <ul>
              {analysis.foodItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="suggestions">
            <h5>アドバイス:</h5>
            {analysis.suggestions.map((suggestion, index) => (
              <p key={index}>{suggestion}</p>
            ))}
          </div>

          <motion.button 
            onClick={handleSaveAnalysis} 
            className="save-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✨ この分析結果を保存
          </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FoodImageUpload;