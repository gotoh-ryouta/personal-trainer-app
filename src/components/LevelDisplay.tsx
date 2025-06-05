import React from 'react';
import { motion } from 'framer-motion';
import { UserStats } from '../hooks/useGameification';

interface LevelDisplayProps {
  userStats: UserStats;
  levelProgress: number;
  expForNext: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ userStats, levelProgress, expForNext }) => {
  return (
    <motion.div 
      className="level-display"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="level-header">
        <div className="level-info">
          <motion.h2
            key={userStats.level}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Level {userStats.level}
          </motion.h2>
          <p className="level-title">{getLevelTitle(userStats.level)}</p>
        </div>
        <div className="streak-info">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="streak-flame"
          >
            🔥
          </motion.div>
          <span>{userStats.streak}日連続</span>
        </div>
      </div>
      
      <div className="experience-bar">
        <div className="exp-info">
          <span>EXP: {userStats.totalExperience}</span>
          <span>次のレベルまで: {expForNext}</span>
        </div>
        <div className="progress-container">
          <motion.div 
            className="progress-fill level-progress"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="progress-glow" />
        </div>
      </div>

      <div className="badges-preview">
        {userStats.badges.slice(-3).map((badge, index) => (
          <motion.div
            key={badge.id}
            className="badge-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            {badge.icon}
          </motion.div>
        ))}
        {userStats.badges.length > 3 && (
          <span className="more-badges">+{userStats.badges.length - 3}</span>
        )}
      </div>
    </motion.div>
  );
};

const getLevelTitle = (level: number): string => {
  const titles = [
    '初心者', '見習い', 'ルーキー', 'チャレンジャー', 'ファイター',
    'ウォリアー', 'ベテラン', 'エキスパート', 'マスター', 'グランドマスター',
    'チャンピオン', 'レジェンド', 'ヒーロー', 'スーパーヒーロー', 'アイアンマン',
    'タイタン', 'オリンポス', 'ゴッド', 'レジェンダリー', 'ミシカル'
  ];
  return titles[Math.min(level - 1, titles.length - 1)] || 'アルティメット';
};

export default LevelDisplay;