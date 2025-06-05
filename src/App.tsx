import React, { useState, useEffect, useRef } from 'react';
import './App.css';
// import Dashboard from './components/Dashboard';
import ModernDashboard from './components/ModernDashboard';
// import TaskList from './components/TaskList';
import SwipeableTaskList from './components/SwipeableTaskList';
import TaskForm from './components/TaskForm';
import NutritionTracker from './components/NutritionTracker';
import GoalSetting from './components/GoalSetting';
// import LevelDisplay from './components/LevelDisplay';
import AchievementNotification from './components/AchievementNotification';
// import MotivationalQuotes from './components/MotivationalQuotes';
import SmartTrainingRecommendation, { TrainingRecommendation } from './components/SmartTrainingRecommendation';
import UltimateAITrainer from './components/UltimateAITrainer';
import FloatingActionButton from './components/FloatingActionButton';
import BottomNavigation from './components/BottomNavigation';
import QuickWeightRecorder from './components/QuickWeightRecorder';
import InitialSetup from './components/InitialSetup';
import BasicAuth from './components/BasicAuth';
import Auth from './components/Auth';
import { Task, NutritionEntry, UserProfile, DailyGoals, FitnessPlan } from './types';
import { useGameification } from './hooks/useGameification';
import { useSound } from './hooks/useSound';
import { ThemeProvider } from './contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaRobot } from 'react-icons/fa';
import { supabase } from './lib/supabase';
import { 
  userProfileService, 
  taskService, 
  nutritionService, 
  weightService,
  getCurrentUserId 
} from './services/database';

const defaultGoals: DailyGoals = {
  calories: 2000,
  protein: 60,
  carbs: 250,
  fat: 65,
  water: 2000,
  steps: 10000,
  exerciseMinutes: 30,
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'nutrition' | 'goals'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'ユーザー',
    age: 30,
    height: 170,
    weight: 70,
    goalWeight: 65,
    activityLevel: 'moderate',
    goals: defaultGoals,
  });

  // Gamification and Sound hooks
  const { 
    userStats, 
    addExperience, 
    checkAndUnlockBadge 
    // getExperienceForNextLevel,
    // getCurrentLevelProgress 
  } = useGameification();
  const { playSuccess, playLevelUp, playClick } = useSound();
  
  // const [showAchievement, setShowAchievement] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  // const [achievementTrigger, setAchievementTrigger] = useState(0);
  const [showTrainingRecommendation, setShowTrainingRecommendation] = useState(false);
  const [showAdvancedTraining, setShowAdvancedTraining] = useState(false);
  const [showWeightRecorder, setShowWeightRecorder] = useState(false);
  // const [showQuickTaskForm, setShowQuickTaskForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // データベースからデータを読み込む
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
          setDataLoading(false);
          return;
        }
        
        setUserId(currentUserId);

        // プロフィールを読み込む
        const profile = await userProfileService.getProfile(currentUserId);
        if (profile) {
          setUserProfile({
            name: profile.name,
            age: profile.age,
            height: profile.height,
            weight: parseFloat(profile.weight),
            goalWeight: parseFloat(profile.goal_weight),
            activityLevel: profile.activity_level.replace('_', '') as 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
            bodyFat: profile.body_fat ? parseFloat(profile.body_fat) : undefined,
            goals: defaultGoals // TODO: goalsもDBに保存する
          });
          setIsFirstTime(false);
        } else {
          // ローカルストレージから移行
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            const localProfile = JSON.parse(savedProfile);
            await userProfileService.createOrUpdateProfile(currentUserId, localProfile);
            setUserProfile(localProfile);
            setIsFirstTime(false);
          }
        }

        // タスクを読み込む
        const tasks = await taskService.getTasks(currentUserId);
        if (tasks.length > 0) {
          setTasks(tasks);
        } else {
          // ローカルストレージから移行
          const savedTasks = localStorage.getItem('tasks');
          if (savedTasks) {
            const localTasks = JSON.parse(savedTasks, (key, value) => {
              if (key === 'dueDate' || key === 'createdAt') {
                return new Date(value);
              }
              return value;
            });
            // タスクをDBに保存
            for (const task of localTasks) {
              await taskService.createTask(currentUserId, task);
            }
            setTasks(localTasks);
          }
        }

        // 栄養記録を読み込む
        const nutritionEntries = await nutritionService.getNutritionEntries(currentUserId);
        if (nutritionEntries.length > 0) {
          setNutritionEntries(nutritionEntries);
        } else {
          // ローカルストレージから移行
          const savedNutrition = localStorage.getItem('nutritionEntries');
          if (savedNutrition) {
            const localNutrition = JSON.parse(savedNutrition, (key, value) => {
              if (key === 'date') {
                return new Date(value);
              }
              return value;
            });
            // 栄養記録をDBに保存
            for (const entry of localNutrition) {
              await nutritionService.createNutritionEntry(currentUserId, entry);
            }
            setNutritionEntries(localNutrition);
          }
        }

        // フィットネスプランはローカルストレージから読み込む（DBにテーブルがないため）
        const savedPlan = localStorage.getItem('fitnessPlan');
        if (savedPlan) {
          setFitnessPlan(JSON.parse(savedPlan, (key, value) => {
            if (key === 'startDate' || key === 'endDate' || key === 'createdAt' || key === 'targetDate') {
              return new Date(value);
            }
            return value;
          }));
        }

        setDataLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setDataLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nutritionEntries', JSON.stringify(nutritionEntries));
  }, [nutritionEntries]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (fitnessPlan) {
      localStorage.setItem('fitnessPlan', JSON.stringify(fitnessPlan));
    }
  }, [fitnessPlan]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!userId) return;
    
    try {
      const newTask = await taskService.createTask(userId, taskData);
      setTasks([...tasks, newTask]);
      
      // Add experience and check badges
      const result = addExperience(20);
      if (result.leveledUp) {
        playLevelUp();
        setLeveledUp(true);
      }
      if (result.newBadges.length > 0) {
        setNewBadges(result.newBadges);
      }
      
      // Check for first task badge
      if (tasks.length === 0) {
        const badge = checkAndUnlockBadge('first-task');
        if (badge) {
          setNewBadges([badge]);
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('タスクの追加に失敗しました');
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newCompleted = !task.completed;
    
    try {
      await taskService.updateTask(taskId, { completed: newCompleted });
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ));
      
      if (newCompleted) {
        playSuccess();
        
        // Add experience for completing task
        const result = addExperience(30);
        if (result.leveledUp) {
          playLevelUp();
          setLeveledUp(true);
        }
        if (result.newBadges.length > 0) {
          setNewBadges(result.newBadges);
        }
        
        // Check for perfect day
        const todayTasks = tasks.filter(t => {
          const taskDate = new Date(t.dueDate).toDateString();
          return taskDate === new Date().toDateString();
        });
        const allCompleted = todayTasks.every(t => t.id === taskId || t.completed);
        if (allCompleted && todayTasks.length > 0) {
          const badge = checkAndUnlockBadge('perfect-day');
          if (badge) {
            setNewBadges(prev => [...prev, badge]);
          }
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('タスクの更新に失敗しました');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('タスクの削除に失敗しました');
    }
  };
  
  const handleSetupComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    setIsFirstTime(false);
    
    // データベースに保存
    if (userId) {
      try {
        await userProfileService.createOrUpdateProfile(userId, profile);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('hasCompletedSetup', 'true');
    
    // 初回セットアップ完了のお祝い
    const badge = checkAndUnlockBadge('first-setup');
    if (badge) {
      setNewBadges([badge]);
    }
    
    // ウェルカムメッセージ付きでAIトレーナーを開く
    setTimeout(() => {
      setShowAdvancedTraining(true);
      setTimeout(() => {
        const event = new CustomEvent('requestWelcomePlan');
        window.dispatchEvent(event);
      }, 500);
    }, 1000);
  };

  const addNutritionEntry = async (entryData: Omit<NutritionEntry, 'id'>) => {
    if (!userId) return;
    
    try {
      const newEntry = await nutritionService.createNutritionEntry(userId, entryData);
      setNutritionEntries([...nutritionEntries, newEntry]);
      
      // Add experience for nutrition tracking
      const result = addExperience(15);
      if (result.leveledUp) {
        playLevelUp();
        setLeveledUp(true);
      }
      if (result.newBadges.length > 0) {
        setNewBadges(result.newBadges);
      }
    } catch (error) {
      console.error('Error adding nutrition entry:', error);
      alert('栄養記録の追加に失敗しました');
    }
  };

  if (dataLoading) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>データを読み込み中...</div>
        </div>
      </div>
    );
  }

  if (isFirstTime) {
    return <InitialSetup onComplete={handleSetupComplete} />;
  }

  return (
    <motion.div 
      className="App"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {(leveledUp || newBadges.length > 0) && (
        <AchievementNotification
          leveledUp={leveledUp}
          newBadges={newBadges}
          onClose={() => {
            setLeveledUp(false);
            setNewBadges([]);
          }}
        />
      )}
      
      <header className="App-header-minimal">
        <div className="header-content">
          <motion.div 
            className="app-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1>FitLife</h1>
          </motion.div>
          <motion.div 
            className="level-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="level-icon">{React.createElement(FaStar)}</span>
            <span className="level-number">Lv.{userStats.level}</span>
          </motion.div>
        </div>
      </header>


      <main>
        {activeTab === 'dashboard' && (
          <>
            <motion.div 
              className="ai-trainer-card"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="ai-trainer-card-content">
                <div className="ai-trainer-card-icon">
                  <FaRobot />
                </div>
                <div className="ai-trainer-card-text">
                  <h3>AIパーソナルトレーナー</h3>
                  <p>あなたの目標達成を24時間サポート</p>
                </div>
                <div className="ai-trainer-buttons">
                  <motion.button
                    className="ai-trainer-card-button primary"
                    onClick={() => {
                      setShowAdvancedTraining(true);
                      // 今日のプランを自動生成
                      setTimeout(() => {
                        const event = new CustomEvent('requestDailyPlan');
                        window.dispatchEvent(event);
                      }, 500);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    今日のプランを見る
                  </motion.button>
                  <motion.button
                    className="ai-trainer-card-button"
                    onClick={() => setShowAdvancedTraining(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    相談する
                  </motion.button>
                </div>
              </div>
            </motion.div>
            <ModernDashboard
              tasks={tasks}
              nutritionEntries={nutritionEntries}
              dailyGoals={userProfile.goals}
              userProfile={userProfile}
              onQuickWeightRecord={() => setShowWeightRecorder(true)}
              onQuickFoodRecord={() => setActiveTab('nutrition')}
              onQuickTaskAdd={() => {
                setActiveTab('tasks');
                // setShowQuickTaskForm(true);
              }}
            />
          </>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-container">
            {showTrainingRecommendation ? (
              <SmartTrainingRecommendation
                userProfile={userProfile}
                todayTasks={tasks.filter(t => {
                  const taskDate = new Date(t.dueDate).toDateString();
                  return taskDate === new Date().toDateString();
                })}
                onAcceptRecommendation={(recommendation: TrainingRecommendation) => {
                  const newTask = {
                    title: recommendation.title,
                    description: recommendation.exercises.join(', '),
                    category: 'exercise' as const,
                    completed: false,
                    dueDate: new Date()
                  };
                  addTask(newTask);
                  setShowTrainingRecommendation(false);
                }}
                onClose={() => setShowTrainingRecommendation(false)}
              />
            ) : (
              <>
                <TaskForm onAddTask={addTask} />
                <SwipeableTaskList
                  tasks={tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())}
                  onToggleComplete={toggleTaskComplete}
                  onDeleteTask={deleteTask}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'nutrition' && (
          <NutritionTracker
            entries={nutritionEntries}
            dailyGoals={userProfile.goals}
            onAddEntry={addNutritionEntry}
          />
        )}

        {activeTab === 'goals' && (
          <GoalSetting
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            onPlanGenerated={setFitnessPlan}
          />
        )}
      </main>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          // Handle camera capture from FAB
          if (e.target.files?.[0]) {
            setActiveTab('nutrition');
            // Store the file for NutritionTracker to process
            localStorage.setItem('pendingFoodImage', 'true');
            // Trigger a custom event
            window.dispatchEvent(new CustomEvent('foodImageSelected', { 
              detail: { file: e.target.files[0] } 
            }));
          }
        }}
      />
      
      <FloatingActionButton
        onCameraClick={() => {
          fileInputRef.current?.click();
        }}
        onVoiceClick={() => {
          // Simple voice input using Web Speech API
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'ja-JP';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onstart = () => {
              alert('音声入力中... 🎤\nタスクを話してください');
            };
            
            recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              // Add as a task
              const taskData = {
                title: transcript,
                description: '音声入力で追加',
                category: 'lifestyle' as const,
                completed: false,
                dueDate: new Date()
              };
              addTask(taskData);
              alert(`タスクを追加しました: ${transcript}`);
            };
            
            recognition.onerror = (event: any) => {
              alert('音声認識エラー: ' + event.error);
            };
            
            recognition.start();
          } else {
            alert('お使いのブラウザは音声入力に対応していません');
          }
        }}
        onQuickTaskClick={() => {
          setActiveTab('tasks');
        }}
      />
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          playClick();
          setActiveTab(tab as any);
        }}
      />
      
      <AnimatePresence>
        {showWeightRecorder && (
          <QuickWeightRecorder
            currentWeight={userProfile.weight}
            currentBodyFat={userProfile.bodyFat}
            onUpdateWeight={async (weight, bodyFat) => {
              if (!userId) return;
              
              try {
                await weightService.createWeightRecord(userId, weight, bodyFat);
                setUserProfile(prev => ({ ...prev, weight, bodyFat }));
              } catch (error) {
                console.error('Error saving weight record:', error);
                alert('体重記録の保存に失敗しました');
              }
            }}
            onClose={() => setShowWeightRecorder(false)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showAdvancedTraining && (
          <UltimateAITrainer
            userProfile={userProfile}
            todayTasks={tasks}
            nutritionData={nutritionEntries}
            onAcceptRecommendation={(recommendation) => {
              if (recommendation.type === 'navigate') {
                setActiveTab(recommendation.target);
              } else {
                const categoryMap: { [key: string]: any } = {
                  'exercise': 'exercise',
                  'meal': 'diet',
                  'habit': 'lifestyle'
                };
                const newTask = {
                  title: recommendation.title,
                  description: recommendation.description,
                  category: categoryMap[recommendation.type] || 'exercise' as const,
                  completed: false,
                  dueDate: new Date()
                };
                addTask(newTask);
              }
            }}
            onClose={() => setShowAdvancedTraining(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッションをチェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // セッション変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {!session ? (
        <Auth />
      ) : (
        <AppContent />
      )}
    </ThemeProvider>
  );
}

export default App;
