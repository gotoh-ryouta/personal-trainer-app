import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, NutritionEntry, DailyGoals, UserProfile } from '../types';
import { format, differenceInDays, subDays } from 'date-fns';
import { FaWeight, FaUtensils, FaTasks, FaFire, FaDumbbell, FaClipboardList, FaLightbulb } from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

interface ModernDashboardProps {
  tasks: Task[];
  nutritionEntries: NutritionEntry[];
  dailyGoals: DailyGoals;
  userProfile: UserProfile;
  onQuickWeightRecord: () => void;
  onQuickFoodRecord: () => void;
  onQuickTaskAdd: () => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({
  tasks,
  nutritionEntries,
  dailyGoals,
  userProfile,
  onQuickWeightRecord,
  onQuickFoodRecord,
  onQuickTaskAdd
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 日付が変わったら自動更新
  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date();
      if (format(now, 'yyyy-MM-dd') !== format(currentDate, 'yyyy-MM-dd')) {
        setCurrentDate(now);
      }
    };

    // 1分ごとに日付をチェック
    const interval = setInterval(checkDateChange, 60000);
    
    return () => clearInterval(interval);
  }, [currentDate]);
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) {
      setGreeting('深夜もお疲れ様');
      setTimeOfDay('night');
    } else if (hour < 12) {
      setGreeting('おはようございます');
      setTimeOfDay('morning');
    } else if (hour < 17) {
      setGreeting('こんにちは');
      setTimeOfDay('afternoon');
    } else if (hour < 21) {
      setGreeting('お疲れ様です');
      setTimeOfDay('evening');
    } else {
      setGreeting('今日も一日お疲れ様');
      setTimeOfDay('night');
    }
  }, []);

  // Today's data - currentDateを使用
  const todayTasks = tasks.filter(
    task => format(task.dueDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  );
  const completedTasks = todayTasks.filter(task => task.completed);
  const taskProgress = todayTasks.length > 0 
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  const todayEntries = nutritionEntries.filter(
    entry => format(entry.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  );

  const todayNutrition = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.totalCalories,
      protein: acc.protein + entry.totalProtein,
      carbs: acc.carbs + entry.totalCarbs,
      fat: acc.fat + entry.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Weight history
  const weightHistory = JSON.parse(localStorage.getItem('weightHistory') || '[]');
  const latestWeight = weightHistory[weightHistory.length - 1];
  const previousWeight = weightHistory[weightHistory.length - 2];
  const weightChange = latestWeight && previousWeight 
    ? latestWeight.weight - previousWeight.weight 
    : 0;

  // Quick stats
  const calorieProgress = Math.round((todayNutrition.calories / dailyGoals.calories) * 100);
  const proteinProgress = Math.round((todayNutrition.protein / dailyGoals.protein) * 100);

  // Motivational message based on progress
  const getMotivationalMessage = () => {
    if (taskProgress >= 80) return '素晴らしい進捗です！🔥';
    if (taskProgress >= 50) return 'いい調子です！💪';
    if (taskProgress > 0) return '今日も頑張りましょう！✨';
    return 'さあ、始めましょう！🚀';
  };

  return (
    <div className="modern-dashboard">
      <motion.div 
        className="welcome-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>{greeting}、{userProfile.name}さん</h1>
        <p>{format(today, 'M月d日')} • {getMotivationalMessage()}</p>
      </motion.div>

      <div className="quick-actions">
        <motion.button
          className="quick-action-card weight"
          onClick={onQuickWeightRecord}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="action-icon">{React.createElement(FaWeight)}</div>
          <div className="action-content">
            <span className="action-label">体重記録</span>
            <span className="action-value">
              {userProfile.weight}kg
              {weightChange !== 0 && (
                <span className={`change ${weightChange > 0 ? 'gain' : 'loss'}`}>
                  {weightChange > 0 ? React.createElement(MdTrendingUp) : React.createElement(MdTrendingDown)}
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                </span>
              )}
            </span>
          </div>
        </motion.button>

        <motion.button
          className="quick-action-card food"
          onClick={onQuickFoodRecord}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="action-icon">{React.createElement(FaUtensils)}</div>
          <div className="action-content">
            <span className="action-label">食事記録</span>
            <span className="action-value">{todayEntries.length}食</span>
          </div>
        </motion.button>

        <motion.button
          className="quick-action-card task"
          onClick={onQuickTaskAdd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="action-icon">{React.createElement(FaTasks)}</div>
          <div className="action-content">
            <span className="action-label">タスク追加</span>
            <span className="action-value">{completedTasks.length}/{todayTasks.length}</span>
          </div>
        </motion.button>
      </div>

      <motion.div 
        className="progress-overview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>今日の進捗</h2>
        
        <div className="progress-cards">
          <motion.div 
            className="progress-card calories"
            whileHover={{ scale: 1.02 }}
          >
            <div className="progress-header">
              <span className="progress-icon">{React.createElement(FaFire)}</span>
              <span className="progress-label">カロリー</span>
            </div>
            <div className="progress-content">
              <div className="progress-text">
                <span className="current">{todayNutrition.calories}</span>
                <span className="target">/ {dailyGoals.calories} kcal</span>
              </div>
              <div className="progress-bar-container">
                <motion.div 
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(calorieProgress, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="progress-percentage">{calorieProgress}%</span>
            </div>
          </motion.div>

          <motion.div 
            className="progress-card protein"
            whileHover={{ scale: 1.02 }}
          >
            <div className="progress-header">
              <span className="progress-icon">{React.createElement(FaDumbbell)}</span>
              <span className="progress-label">タンパク質</span>
            </div>
            <div className="progress-content">
              <div className="progress-text">
                <span className="current">{todayNutrition.protein}</span>
                <span className="target">/ {dailyGoals.protein} g</span>
              </div>
              <div className="progress-bar-container">
                <motion.div 
                  className="progress-bar-fill protein"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(proteinProgress, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                />
              </div>
              <span className="progress-percentage">{proteinProgress}%</span>
            </div>
          </motion.div>

          <motion.div 
            className="progress-card tasks"
            whileHover={{ scale: 1.02 }}
          >
            <div className="progress-header">
              <span className="progress-icon">{React.createElement(FaClipboardList)}</span>
              <span className="progress-label">タスク</span>
            </div>
            <div className="progress-content">
              <div className="progress-text">
                <span className="current">{completedTasks.length}</span>
                <span className="target">/ {todayTasks.length} 完了</span>
              </div>
              <div className="progress-bar-container">
                <motion.div 
                  className="progress-bar-fill tasks"
                  initial={{ width: 0 }}
                  animate={{ width: `${taskProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <span className="progress-percentage">{taskProgress}%</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {todayTasks.filter(task => !task.completed).length > 0 && (
        <motion.div 
          className="upcoming-tasks"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>未完了のタスク</h3>
          <div className="task-list-preview">
            {todayTasks
              .filter(task => !task.completed)
              .slice(0, 3)
              .map((task, index) => (
                <motion.div
                  key={task.id}
                  className="task-preview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <span className="task-category-icon">
                    {task.category === 'exercise' && React.createElement(FaDumbbell)}
                    {task.category === 'nutrition' && React.createElement(FaUtensils)}
                    {task.category === 'lifestyle' && React.createElement(FaLightbulb)}
                  </span>
                  <span className="task-title">{task.title}</span>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      <motion.div 
        className="daily-tip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="tip-icon">{React.createElement(FaLightbulb)}</div>
        <div className="tip-content">
          <h4>今日のヒント</h4>
          <p>
            {timeOfDay === 'morning' && '朝の水分補給を忘れずに！体重測定のベストタイミングです。'}
            {timeOfDay === 'afternoon' && 'タンパク質が不足気味？プロテインシェイクがおすすめです。'}
            {timeOfDay === 'evening' && '夜の炭水化物は控えめに。明日に向けて体を休めましょう。'}
            {timeOfDay === 'night' && '睡眠は筋肉回復の鍵。7-8時間の睡眠を心がけましょう。'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernDashboard;