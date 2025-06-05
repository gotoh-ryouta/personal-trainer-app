import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useSound } from '../hooks/useSound';
import { FaTimes, FaCheck, FaChartLine, FaChartArea } from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

interface WeightRecord {
  date: string;
  weight: number;
  bodyFat?: number;
}

interface QuickWeightRecorderProps {
  currentWeight: number;
  currentBodyFat?: number;
  onUpdateWeight: (weight: number, bodyFat?: number) => void;
  onClose: () => void;
}

const QuickWeightRecorder: React.FC<QuickWeightRecorderProps> = ({
  currentWeight,
  currentBodyFat,
  onUpdateWeight,
  onClose
}) => {
  const [weight, setWeight] = useState(currentWeight.toString());
  const [bodyFat, setBodyFat] = useState(currentBodyFat?.toString() || '');
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const { playSuccess } = useSound();

  useEffect(() => {
    const saved = localStorage.getItem('weightHistory');
    if (saved) {
      setWeightHistory(JSON.parse(saved));
    }
  }, []);

  const handleQuickAdjust = (amount: number) => {
    const currentValue = parseFloat(weight) || currentWeight;
    setWeight((currentValue + amount).toFixed(1));
  };

  const handleSave = () => {
    const weightValue = parseFloat(weight);
    const bodyFatValue = bodyFat ? parseFloat(bodyFat) : undefined;

    if (!isNaN(weightValue)) {
      // Update profile
      onUpdateWeight(weightValue, bodyFatValue);

      // Save to history
      const newRecord: WeightRecord = {
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: weightValue,
        bodyFat: bodyFatValue
      };

      const updatedHistory = [...weightHistory, newRecord];
      setWeightHistory(updatedHistory);
      localStorage.setItem('weightHistory', JSON.stringify(updatedHistory));

      // Show success animation
      playSuccess();
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const latestChange = weightHistory.length > 1 
    ? (parseFloat(weight) - weightHistory[weightHistory.length - 1].weight).toFixed(1)
    : '0';

  return (
    <motion.div
      className="quick-weight-recorder-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="quick-weight-recorder"
        initial={{ scale: 0.8, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="recorder-header">
          <h2>体重を記録</h2>
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {React.createElement(FaTimes)}
          </motion.button>
        </div>

        <div className="weight-input-section">
          <div className="weight-display">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="weight-input"
              step="0.1"
              autoFocus
            />
            <span className="unit">kg</span>
          </div>

          <div className="quick-adjust-buttons">
            <motion.button
              onClick={() => handleQuickAdjust(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              -1.0
            </motion.button>
            <motion.button
              onClick={() => handleQuickAdjust(-0.5)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              -0.5
            </motion.button>
            <motion.button
              onClick={() => handleQuickAdjust(-0.1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              -0.1
            </motion.button>
            <motion.button
              onClick={() => handleQuickAdjust(0.1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +0.1
            </motion.button>
            <motion.button
              onClick={() => handleQuickAdjust(0.5)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +0.5
            </motion.button>
            <motion.button
              onClick={() => handleQuickAdjust(1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +1.0
            </motion.button>
          </div>

          {latestChange !== '0' && (
            <div className={`weight-change ${parseFloat(latestChange) > 0 ? 'gain' : 'loss'}`}>
              {parseFloat(latestChange) > 0 ? React.createElement(MdTrendingUp) : React.createElement(MdTrendingDown)}
              {parseFloat(latestChange) > 0 ? '+' : ''}{latestChange}kg
            </div>
          )}
        </div>

        <div className="body-fat-section">
          <label>体脂肪率（任意）</label>
          <div className="body-fat-input">
            <input
              type="number"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="20.5"
              step="0.1"
            />
            <span className="unit">%</span>
          </div>
        </div>

        <motion.button
          className="save-button"
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          記録する
        </motion.button>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="success-overlay"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              {React.createElement(FaCheck)} 記録完了！
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default QuickWeightRecorder;