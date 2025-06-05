import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Badge } from '../hooks/useGameification';

interface AchievementNotificationProps {
  leveledUp: boolean;
  newBadges: Badge[];
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  leveledUp, 
  newBadges, 
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const notifications = [
    ...(leveledUp ? [{ type: 'levelup', content: 'レベルアップ！' }] : []),
    ...newBadges.map(badge => ({ type: 'badge', content: badge }))
  ];

  useEffect(() => {
    if (notifications.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications.length]);

  useEffect(() => {
    if (currentIndex < notifications.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (currentIndex === notifications.length - 1 && notifications.length > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, notifications.length, onClose]);

  if (notifications.length === 0) return null;

  const current = notifications[currentIndex];

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="achievement-notification"
          initial={{ scale: 0, y: -100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {current.type === 'levelup' ? (
            <div className="level-up-content">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="star-icon"
              >
                ⭐
              </motion.div>
              <h2>LEVEL UP!</h2>
              <p>新しいレベルに到達しました！</p>
            </div>
          ) : (
            <div className="badge-unlock-content">
              <motion.div
                className="badge-showcase"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5 }}
              >
                {(current.content as Badge).icon}
              </motion.div>
              <h2>バッジ獲得！</h2>
              <h3>{(current.content as Badge).name}</h3>
              <p>{(current.content as Badge).description}</p>
            </div>
          )}
          
          <div className="progress-dots">
            {notifications.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'passed' : ''}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default AchievementNotification;