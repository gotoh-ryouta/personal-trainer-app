import { useState, useEffect } from 'react';

export interface UserStats {
  level: number;
  experience: number;
  totalExperience: number;
  streak: number;
  lastActivityDate: string;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

const BADGES: Badge[] = [
  { id: 'first-task', name: '初めの一歩', description: '最初のタスクを完了', icon: '🎯' },
  { id: 'week-warrior', name: '週間戦士', description: '7日連続でタスクを完了', icon: '⚔️' },
  { id: 'nutrition-master', name: '栄養マスター', description: '30日間栄養目標を達成', icon: '🥗' },
  { id: 'level-10', name: 'レベル10達成', description: 'レベル10に到達', icon: '🏆' },
  { id: 'perfect-day', name: '完璧な一日', description: '1日の全タスクを完了', icon: '⭐' },
  { id: 'early-bird', name: '早起き鳥', description: '朝6時前にタスクを完了', icon: '🌅' },
  { id: 'consistency', name: '継続の達人', description: '30日連続でログイン', icon: '📅' },
  { id: 'photo-food', name: 'フードフォトグラファー', description: '食事画像を10回アップロード', icon: '📸' },
];

const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, // Level 1-10
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15200, 17600, 20200 // Level 11-20
];

export const useGameification = () => {
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('userStats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      level: 1,
      experience: 0,
      totalExperience: 0,
      streak: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      badges: []
    };
  });

  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }, [userStats]);

  const addExperience = (points: number): { leveledUp: boolean; newBadges: Badge[] } => {
    let newStats = { ...userStats };
    newStats.experience += points;
    newStats.totalExperience += points;
    
    let leveledUp = false;
    const newBadges: Badge[] = [];
    
    // Check for level up
    while (newStats.level < LEVEL_THRESHOLDS.length && 
           newStats.totalExperience >= LEVEL_THRESHOLDS[newStats.level]) {
      newStats.level++;
      leveledUp = true;
      
      // Check for level badges
      if (newStats.level === 10) {
        const badge = BADGES.find(b => b.id === 'level-10');
        if (badge && !newStats.badges.find(b => b.id === badge.id)) {
          newStats.badges.push({ ...badge, unlockedAt: new Date() });
          newBadges.push(badge);
        }
      }
    }
    
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = new Date(newStats.lastActivityDate);
    const todayDate = new Date(today);
    const dayDiff = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      newStats.streak++;
      if (newStats.streak === 7) {
        const badge = BADGES.find(b => b.id === 'week-warrior');
        if (badge && !newStats.badges.find(b => b.id === badge.id)) {
          newStats.badges.push({ ...badge, unlockedAt: new Date() });
          newBadges.push(badge);
        }
      }
      if (newStats.streak === 30) {
        const badge = BADGES.find(b => b.id === 'consistency');
        if (badge && !newStats.badges.find(b => b.id === badge.id)) {
          newStats.badges.push({ ...badge, unlockedAt: new Date() });
          newBadges.push(badge);
        }
      }
    } else if (dayDiff > 1) {
      newStats.streak = 1;
    }
    
    newStats.lastActivityDate = today;
    setUserStats(newStats);
    
    return { leveledUp, newBadges };
  };

  const checkAndUnlockBadge = (badgeId: string): Badge | null => {
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge && !userStats.badges.find(b => b.id === badge.id)) {
      const newBadge = { ...badge, unlockedAt: new Date() };
      setUserStats({
        ...userStats,
        badges: [...userStats.badges, newBadge]
      });
      return badge;
    }
    return null;
  };

  const getExperienceForNextLevel = (): number => {
    if (userStats.level >= LEVEL_THRESHOLDS.length) {
      return 0;
    }
    return LEVEL_THRESHOLDS[userStats.level] - userStats.totalExperience;
  };

  const getCurrentLevelProgress = (): number => {
    if (userStats.level >= LEVEL_THRESHOLDS.length) {
      return 100;
    }
    const currentLevelExp = userStats.level > 0 ? LEVEL_THRESHOLDS[userStats.level - 1] : 0;
    const nextLevelExp = LEVEL_THRESHOLDS[userStats.level];
    const progress = ((userStats.totalExperience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return {
    userStats,
    addExperience,
    checkAndUnlockBadge,
    getExperienceForNextLevel,
    getCurrentLevelProgress,
    allBadges: BADGES
  };
};