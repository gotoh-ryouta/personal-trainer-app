import React from 'react';
import { Task, NutritionEntry, DailyGoals } from '../types';
import { format } from 'date-fns';

interface DashboardProps {
  tasks: Task[];
  nutritionEntries: NutritionEntry[];
  dailyGoals: DailyGoals;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, nutritionEntries, dailyGoals }) => {
  const today = new Date();
  const todayTasks = tasks.filter(
    (task) => format(task.dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );
  const completedTasks = todayTasks.filter((task) => task.completed);
  const taskCompletionRate = todayTasks.length > 0 
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  const todayEntries = nutritionEntries.filter(
    (entry) => format(entry.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
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

  const getMotivationalMessage = () => {
    if (taskCompletionRate >= 80) {
      return '素晴らしい！今日も頑張っていますね！💪';
    } else if (taskCompletionRate >= 50) {
      return '良いペースです！この調子で続けましょう！';
    } else {
      return '今日はまだ始まったばかり。一緒に頑張りましょう！';
    }
  };

  const getNutritionAdvice = () => {
    const caloriePercentage = (todayNutrition.calories / dailyGoals.calories) * 100;
    const proteinPercentage = (todayNutrition.protein / dailyGoals.protein) * 100;

    if (caloriePercentage < 50) {
      return 'カロリー摂取が不足しています。バランスの良い食事を心がけましょう。';
    } else if (proteinPercentage < 50) {
      return 'タンパク質が不足気味です。肉、魚、大豆製品を取り入れてみましょう。';
    } else if (caloriePercentage > 120) {
      return 'カロリー摂取が目標を超えています。運動を追加してバランスを取りましょう。';
    } else {
      return '栄養バランスが良好です！この調子を維持しましょう。';
    }
  };

  return (
    <div className="dashboard">
      <h1>今日のダッシュボード</h1>
      <p className="date">{format(today, 'yyyy年MM月dd日')}</p>
      
      <div className="motivational-message">
        <p>{getMotivationalMessage()}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>タスク完了率</h3>
          <div className="stat-value">{taskCompletionRate}%</div>
          <p>{completedTasks.length} / {todayTasks.length} 完了</p>
        </div>

        <div className="stat-card">
          <h3>カロリー摂取</h3>
          <div className="stat-value">{todayNutrition.calories}</div>
          <p>/ {dailyGoals.calories} kcal</p>
        </div>

        <div className="stat-card">
          <h3>タンパク質</h3>
          <div className="stat-value">{todayNutrition.protein}g</div>
          <p>/ {dailyGoals.protein} g</p>
        </div>

        <div className="stat-card">
          <h3>今日の重要タスク</h3>
          <div className="priority-tasks">
            {todayTasks
              .filter((task) => !task.completed)
              .slice(0, 3)
              .map((task) => (
                <p key={task.id} className="priority-task">
                  • {task.title}
                </p>
              ))}
            {todayTasks.filter((task) => !task.completed).length === 0 && (
              <p className="all-complete">全て完了しました！</p>
            )}
          </div>
        </div>
      </div>

      <div className="advice-section">
        <h3>今日のアドバイス</h3>
        <p>{getNutritionAdvice()}</p>
      </div>
    </div>
  );
};

export default Dashboard;