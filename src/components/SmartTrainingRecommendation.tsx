import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, UserProfile } from '../types';
import { FaTimes } from 'react-icons/fa';

interface TrainingRecommendation {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'strength' | 'cardio' | 'flexibility' | 'recovery';
  emoji: string;
  exercises: string[];
}

interface SmartTrainingRecommendationProps {
  userProfile: UserProfile;
  todayTasks: Task[];
  onAcceptRecommendation: (recommendation: TrainingRecommendation) => void;
  onClose?: () => void;
}

const SmartTrainingRecommendation: React.FC<SmartTrainingRecommendationProps> = ({
  userProfile,
  todayTasks,
  onAcceptRecommendation,
  onClose
}) => {
  const [recommendation, setRecommendation] = useState<TrainingRecommendation | null>(null);
  const [userCondition, setUserCondition] = useState<'great' | 'good' | 'tired' | null>(null);

  const generateRecommendation = (condition: 'great' | 'good' | 'tired') => {
    const completedToday = todayTasks.filter(t => t.completed && t.category === 'exercise').length;
    const hour = new Date().getHours();
    
    let recommendations: TrainingRecommendation[] = [];

    if (condition === 'great') {
      recommendations = [
        {
          id: 'hiit-morning',
          title: '朝のHIITトレーニング',
          description: '短時間で効果的！代謝を上げて一日をスタート',
          duration: 20,
          difficulty: 'hard',
          category: 'cardio',
          emoji: '🔥',
          exercises: ['バーピー 30秒', 'マウンテンクライマー 30秒', 'ジャンピングジャック 30秒', '休憩 30秒', '4セット繰り返し']
        },
        {
          id: 'strength-upper',
          title: '上半身筋トレ',
          description: '胸・背中・腕を鍛える本格トレーニング',
          duration: 45,
          difficulty: 'hard',
          category: 'strength',
          emoji: '💪',
          exercises: ['ベンチプレス 3×10', 'ラットプルダウン 3×10', 'ショルダープレス 3×10', 'アームカール 3×12']
        }
      ];
    } else if (condition === 'good') {
      recommendations = [
        {
          id: 'bodyweight-circuit',
          title: '自重サーキット',
          description: 'ジムに行かなくてもOK！自宅でできる全身運動',
          duration: 30,
          difficulty: 'medium',
          category: 'strength',
          emoji: '🏃',
          exercises: ['腕立て伏せ 15回', 'スクワット 20回', 'プランク 30秒', 'ランジ 各足10回', '3セット']
        },
        {
          id: 'yoga-flow',
          title: 'パワーヨガフロー',
          description: '筋力と柔軟性を同時に向上',
          duration: 30,
          difficulty: 'medium',
          category: 'flexibility',
          emoji: '🧘',
          exercises: ['太陽礼拝 5回', 'ウォーリアポーズ 各30秒', 'プランクポーズ 45秒', 'ダウンドッグ 1分']
        }
      ];
    } else {
      recommendations = [
        {
          id: 'recovery-stretch',
          title: 'リカバリーストレッチ',
          description: '疲労回復に最適な軽めのストレッチ',
          duration: 15,
          difficulty: 'easy',
          category: 'recovery',
          emoji: '🌿',
          exercises: ['首回し 10回', '肩甲骨ストレッチ 30秒', 'ハムストリングストレッチ 各30秒', '深呼吸 5回']
        },
        {
          id: 'light-walk',
          title: '軽めのウォーキング',
          description: 'アクティブレスト。軽く体を動かして回復促進',
          duration: 20,
          difficulty: 'easy',
          category: 'cardio',
          emoji: '🚶',
          exercises: ['準備運動 3分', 'ゆっくりウォーキング 15分', 'クールダウン 2分']
        }
      ];
    }

    // 時間帯による調整
    if (hour < 10) {
      recommendations = recommendations.filter(r => r.duration <= 30);
    } else if (hour > 21) {
      recommendations = recommendations.filter(r => r.category === 'recovery' || r.category === 'flexibility');
    }

    // すでに運動している場合は軽めのものを提案
    if (completedToday > 0) {
      recommendations = recommendations.filter(r => r.difficulty !== 'hard');
    }

    const selected = recommendations[Math.floor(Math.random() * recommendations.length)];
    setRecommendation(selected);
  };

  const handleAccept = () => {
    if (recommendation) {
      onAcceptRecommendation(recommendation);
      setRecommendation(null);
      setUserCondition(null);
    }
  };

  return (
    <div className="smart-training-recommendation">
      {onClose && (
        <div className="recommendation-header">
          <motion.button
            className="close-button"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {React.createElement(FaTimes)}
          </motion.button>
        </div>
      )}
      {!userCondition && (
        <motion.div 
          className="condition-check"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>今日の調子はどうですか？</h3>
          <div className="condition-buttons">
            <motion.button
              className="condition-btn great"
              onClick={() => {
                setUserCondition('great');
                generateRecommendation('great');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="emoji">💪</span>
              <span>絶好調！</span>
            </motion.button>
            <motion.button
              className="condition-btn good"
              onClick={() => {
                setUserCondition('good');
                generateRecommendation('good');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="emoji">😊</span>
              <span>普通</span>
            </motion.button>
            <motion.button
              className="condition-btn tired"
              onClick={() => {
                setUserCondition('tired');
                generateRecommendation('tired');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="emoji">😴</span>
              <span>疲れ気味</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {recommendation && (
          <motion.div
            className="recommendation-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="recommendation-header">
              <span className="recommendation-emoji">{recommendation.emoji}</span>
              <div className="recommendation-info">
                <h3>{recommendation.title}</h3>
                <p>{recommendation.description}</p>
              </div>
            </div>
            
            <div className="recommendation-details">
              <div className="detail-row">
                <span className="detail-label">時間:</span>
                <span className="detail-value">{recommendation.duration}分</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">難易度:</span>
                <span className={`difficulty ${recommendation.difficulty}`}>
                  {recommendation.difficulty === 'easy' && '初級'}
                  {recommendation.difficulty === 'medium' && '中級'}
                  {recommendation.difficulty === 'hard' && '上級'}
                </span>
              </div>
            </div>

            <div className="exercises-preview">
              <h4>エクササイズ内容:</h4>
              <ul>
                {recommendation.exercises.map((exercise, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {exercise}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="recommendation-actions">
              <motion.button
                className="accept-btn"
                onClick={handleAccept}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                このトレーニングをやる！
              </motion.button>
              <motion.button
                className="other-btn"
                onClick={() => userCondition && generateRecommendation(userCondition)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                他の提案を見る
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartTrainingRecommendation;
export type { TrainingRecommendation };