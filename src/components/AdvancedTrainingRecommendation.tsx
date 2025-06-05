import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { generateFitnessPlan } from '../services/geminiService';
import { FaDumbbell, FaFire, FaHeart, FaBrain, FaRunning, FaMedal } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp, GiNightSleep } from 'react-icons/gi';
import { MdMoodBad, MdMood, MdSentimentVerySatisfied } from 'react-icons/md';

interface AdvancedTrainingRecommendationProps {
  userProfile: UserProfile;
  onAcceptRecommendation: (training: any) => void;
  onClose: () => void;
}

interface TrainingGoal {
  id: string;
  name: string;
  icon: React.ReactElement;
  description: string;
  color: string;
}

interface MoodOption {
  id: string;
  name: string;
  icon: React.ReactElement;
  energyLevel: number;
}

interface BodyPart {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

const TRAINING_GOALS: TrainingGoal[] = [
  {
    id: 'muscle',
    name: '筋肉増強',
    icon: React.createElement(GiMuscleUp),
    description: '筋肉量を増やしてパワーアップ',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'weight-loss',
    name: '体重減少',
    icon: React.createElement(FaFire),
    description: '効率的に脂肪を燃焼',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 'endurance',
    name: '持久力向上',
    icon: React.createElement(FaRunning),
    description: 'スタミナを強化',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'flexibility',
    name: '柔軟性向上',
    icon: React.createElement(FaHeart),
    description: '体の柔軟性を高める',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 'stress-relief',
    name: 'ストレス解消',
    icon: React.createElement(FaBrain),
    description: 'メンタルヘルスを重視',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'competition',
    name: '競技力向上',
    icon: React.createElement(FaMedal),
    description: 'パフォーマンスを最大化',
    color: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)'
  }
];

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'tired',
    name: '疲れている',
    icon: React.createElement(MdMoodBad),
    energyLevel: 30
  },
  {
    id: 'normal',
    name: '普通',
    icon: React.createElement(MdMood),
    energyLevel: 60
  },
  {
    id: 'energetic',
    name: '元気いっぱい',
    icon: React.createElement(MdSentimentVerySatisfied),
    energyLevel: 90
  }
];

const BODY_PARTS: BodyPart[] = [
  { id: 'chest', name: '胸', icon: '💪', selected: false },
  { id: 'back', name: '背中', icon: '🔙', selected: false },
  { id: 'legs', name: '脚', icon: '🦵', selected: false },
  { id: 'shoulders', name: '肩', icon: '🤷', selected: false },
  { id: 'arms', name: '腕', icon: '💪', selected: false },
  { id: 'core', name: '体幹', icon: '🎯', selected: false }
];

const AdvancedTrainingRecommendation: React.FC<AdvancedTrainingRecommendationProps> = ({
  userProfile,
  onAcceptRecommendation,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedParts, setSelectedParts] = useState<BodyPart[]>(BODY_PARTS);
  const [trainingTime, setTrainingTime] = useState(30);
  const [equipment, setEquipment] = useState<'gym' | 'home' | 'none'>('home');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleBodyPart = (id: string) => {
    setSelectedParts(parts =>
      parts.map(part =>
        part.id === id ? { ...part, selected: !part.selected } : part
      )
    );
  };

  const generateRecommendation = async () => {
    setIsGenerating(true);
    
    const selectedBodyParts = selectedParts.filter(p => p.selected).map(p => p.name);
    const prompt = `
      ユーザー情報:
      - 目標: ${selectedGoal?.name}
      - 今の気分: ${selectedMood?.name} (エネルギーレベル: ${selectedMood?.energyLevel}%)
      - トレーニング時間: ${trainingTime}分
      - 鍛えたい部位: ${selectedBodyParts.join(', ')}
      - 利用可能な設備: ${equipment === 'gym' ? 'ジム' : equipment === 'home' ? '自宅' : '器具なし'}
      - 体重: ${userProfile.weight}kg
      - 目標体重: ${userProfile.goalWeight}kg
      
      上記の条件に基づいて、最適なトレーニングメニューを提案してください。
      気分とエネルギーレベルを考慮し、無理のない範囲で効果的なメニューを作成してください。
    `;

    try {
      // Simulate API call - replace with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRecommendation = {
        title: `${selectedGoal?.name}のための${trainingTime}分トレーニング`,
        description: `今日の気分: ${selectedMood?.name}に合わせた${selectedBodyParts.join('・')}トレーニング`,
        exercises: [
          `ウォームアップ: 軽いストレッチ 5分`,
          `メイン1: ${selectedBodyParts[0] || '全身'}エクササイズ ${Math.floor(trainingTime * 0.3)}分`,
          `メイン2: ${selectedBodyParts[1] || 'コア'}トレーニング ${Math.floor(trainingTime * 0.3)}分`,
          `クールダウン: ストレッチ 5分`
        ],
        intensity: selectedMood?.energyLevel || 60,
        tips: [
          '水分補給を忘れずに',
          '無理せず自分のペースで',
          '呼吸を意識して'
        ]
      };
      
      setRecommendation(mockRecommendation);
      setStep(5);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2>今日の目標は何ですか？</h2>
            <div className="goal-grid">
              {TRAINING_GOALS.map((goal, index) => (
                <motion.button
                  key={goal.id}
                  className={`goal-card ${selectedGoal?.id === goal.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGoal(goal)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: selectedGoal?.id === goal.id ? goal.color : 'white'
                  }}
                >
                  <div className="goal-icon">{goal.icon}</div>
                  <h3>{goal.name}</h3>
                  <p>{goal.description}</p>
                </motion.button>
              ))}
            </div>
            <div className="step-actions">
              <motion.button
                className="next-btn"
                onClick={() => setStep(2)}
                disabled={!selectedGoal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                次へ
              </motion.button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2>今の気分は？</h2>
            <div className="mood-grid">
              {MOOD_OPTIONS.map((mood, index) => (
                <motion.button
                  key={mood.id}
                  className={`mood-card ${selectedMood?.id === mood.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="mood-icon">{mood.icon}</div>
                  <h3>{mood.name}</h3>
                  <div className="energy-bar">
                    <div 
                      className="energy-fill"
                      style={{ width: `${mood.energyLevel}%` }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="step-actions">
              <motion.button
                className="back-btn"
                onClick={() => setStep(1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                戻る
              </motion.button>
              <motion.button
                className="next-btn"
                onClick={() => setStep(3)}
                disabled={!selectedMood}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                次へ
              </motion.button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="body-parts"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2>どこを鍛えたい？（複数選択可）</h2>
            <div className="body-parts-grid">
              {selectedParts.map((part, index) => (
                <motion.button
                  key={part.id}
                  className={`body-part-card ${part.selected ? 'selected' : ''}`}
                  onClick={() => toggleBodyPart(part.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="part-icon">{part.icon}</span>
                  <span className="part-name">{part.name}</span>
                </motion.button>
              ))}
            </div>
            <div className="step-actions">
              <motion.button
                className="back-btn"
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                戻る
              </motion.button>
              <motion.button
                className="next-btn"
                onClick={() => setStep(4)}
                disabled={!selectedParts.some(p => p.selected)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                次へ
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2>トレーニングの詳細</h2>
            <div className="training-details">
              <div className="detail-section">
                <h3>トレーニング時間</h3>
                <div className="time-selector">
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="15"
                    value={trainingTime}
                    onChange={(e) => setTrainingTime(Number(e.target.value))}
                  />
                  <span className="time-display">{trainingTime}分</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>利用可能な設備</h3>
                <div className="equipment-options">
                  <motion.button
                    className={`equipment-btn ${equipment === 'gym' ? 'selected' : ''}`}
                    onClick={() => setEquipment('gym')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {React.createElement(GiWeightLiftingUp)} ジム
                  </motion.button>
                  <motion.button
                    className={`equipment-btn ${equipment === 'home' ? 'selected' : ''}`}
                    onClick={() => setEquipment('home')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {React.createElement(FaDumbbell)} 自宅
                  </motion.button>
                  <motion.button
                    className={`equipment-btn ${equipment === 'none' ? 'selected' : ''}`}
                    onClick={() => setEquipment('none')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {React.createElement(GiNightSleep)} 器具なし
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="step-actions">
              <motion.button
                className="back-btn"
                onClick={() => setStep(3)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                戻る
              </motion.button>
              <motion.button
                className="generate-btn"
                onClick={generateRecommendation}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? '生成中...' : 'トレーニングを生成'}
              </motion.button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2>あなたのトレーニングプラン</h2>
            {recommendation && (
              <div className="recommendation-result">
                <motion.div 
                  className="recommendation-header"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3>{recommendation.title}</h3>
                  <p>{recommendation.description}</p>
                  <div className="intensity-indicator">
                    <span>強度</span>
                    <div className="intensity-bar">
                      <motion.div 
                        className="intensity-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${recommendation.intensity}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="exercises-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4>トレーニングメニュー</h4>
                  {recommendation.exercises.map((exercise: string, index: number) => (
                    <motion.div
                      key={index}
                      className="exercise-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {exercise}
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div 
                  className="tips-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h4>アドバイス</h4>
                  {recommendation.tips.map((tip: string, index: number) => (
                    <motion.div
                      key={index}
                      className="tip-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      💡 {tip}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
            <div className="step-actions">
              <motion.button
                className="back-btn"
                onClick={() => setStep(4)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                やり直す
              </motion.button>
              <motion.button
                className="accept-btn"
                onClick={() => {
                  onAcceptRecommendation(recommendation);
                  onClose();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                このプランで始める
              </motion.button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="advanced-training-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="advanced-training-modal"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="progress-dots">
            {[1, 2, 3, 4, 5].map((num) => (
              <motion.div
                key={num}
                className={`dot ${step >= num ? 'active' : ''}`}
                animate={{ scale: step === num ? 1.2 : 1 }}
              />
            ))}
          </div>
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedTrainingRecommendation;