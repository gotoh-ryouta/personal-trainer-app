import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';
import { FaPlus, FaCamera, FaMicrophone, FaDumbbell } from 'react-icons/fa';

interface FloatingActionButtonProps {
  onCameraClick: () => void;
  onVoiceClick: () => void;
  onQuickTaskClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCameraClick,
  onVoiceClick,
  onQuickTaskClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { playClick } = useSound();

  const toggleMenu = () => {
    playClick();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    playClick();
    action();
    setIsOpen(false);
  };

  const menuVariants = {
    open: {
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.8,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <div className="floating-action-button-container">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fab-menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <motion.button
                className="fab-item camera"
                variants={itemVariants}
                onClick={() => handleAction(onCameraClick)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="fab-icon">{React.createElement(FaCamera)}</span>
                <span className="fab-label">食事を撮影</span>
              </motion.button>

              <motion.button
                className="fab-item voice"
                variants={itemVariants}
                onClick={() => handleAction(onVoiceClick)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="fab-icon">{React.createElement(FaMicrophone)}</span>
                <span className="fab-label">音声で記録</span>
              </motion.button>

              <motion.button
                className="fab-item task"
                variants={itemVariants}
                onClick={() => handleAction(onQuickTaskClick)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="fab-icon">{React.createElement(FaDumbbell)}</span>
                <span className="fab-label">クイックタスク</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="fab-main"
          onClick={toggleMenu}
          animate={{ rotate: isOpen ? 45 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="fab-icon">{React.createElement(FaPlus)}</span>
        </motion.button>
      </div>
    </>
  );
};

export default FloatingActionButton;