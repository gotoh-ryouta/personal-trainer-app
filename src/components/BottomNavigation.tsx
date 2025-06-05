import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaTasks, FaAppleAlt, FaBullseye } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: string; icon: IconType; label: string }[] = [
    { id: 'dashboard', icon: FaHome, label: 'ホーム' },
    { id: 'tasks', icon: FaTasks, label: 'タスク' },
    { id: 'nutrition', icon: FaAppleAlt, label: '栄養' },
    { id: 'goals', icon: FaBullseye, label: '目標' }
  ];

  return (
    <motion.nav 
      className="bottom-navigation"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.span 
            className="nav-icon"
            animate={{ 
              scale: activeTab === tab.id ? 1.2 : 1,
              rotate: activeTab === tab.id ? [0, -10, 10, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <tab.icon />
          </motion.span>
          <span className="nav-label">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              className="active-indicator"
              layoutId="activeIndicator"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </motion.nav>
  );
};

export default BottomNavigation;