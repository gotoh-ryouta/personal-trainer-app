import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { generateFitnessPlan, getDailyAdvice } from '../services/geminiService';
import { FaTimes, FaChevronLeft, FaSpinner, FaDumbbell, FaUtensils, FaBed, FaHeart, FaBrain, FaFire } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';

interface AIPersonalTrainerProps {
  userProfile: UserProfile;
  onAcceptRecommendation: (recommendation: any) => void;
  onClose: () => void;
  todayTasks?: any[];
  nutritionData?: any;
}

interface Suggestion {
  id: string;
  title: string;
  icon: React.ReactElement;
  color: string;
  description: string;
  action: () => void;
}

const AIPersonalTrainer: React.FC<AIPersonalTrainerProps> = ({
  userProfile,
  onAcceptRecommendation,
  onClose,
  todayTasks = [],
  nutritionData
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'suggestion'>('menu');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<{ role: string; content: string }[]>([]);

  // ユーザーの状況を分析してAIに渡すコンテキストを生成
  const analyzeUserContext = () => {
    const now = new Date().getHours();
    const timeOfDay = now < 12 ? '朝' : now < 17 ? '昼' : now < 21 ? '夜' : '深夜';
    
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const taskCompletion = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0;
    
    const weightDiff = userProfile.weight - userProfile.goalWeight;
    const needsWeightLoss = weightDiff > 0;
    
    return {
      timeOfDay,
      taskCompletion,
      needsWeightLoss,
      weightDiff: Math.abs(weightDiff),
      currentWeight: userProfile.weight,
      goalWeight: userProfile.goalWeight,
      activityLevel: userProfile.activityLevel
    };
  };

  // 初期提案を生成
  const generateInitialSuggestions = async () => {
    setIsLoading(true);
    const context = analyzeUserContext();
    
    const suggestions: Suggestion[] = [
      {
        id: 'workout',
        title: `${context.timeOfDay}のトレーニング提案`,
        icon: React.createElement(FaDumbbell),
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        description: 'あなたの目標と現在の状態に最適なトレーニング',
        action: () => handleSuggestionClick('workout')
      },
      {
        id: 'nutrition',
        title: '今食べるべき食事',
        icon: React.createElement(FaUtensils),
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        description: `${context.needsWeightLoss ? 'カロリーを抑えた' : 'バランスの良い'}食事提案`,
        action: () => handleSuggestionClick('nutrition')
      },
      {
        id: 'recovery',
        title: 'リカバリー＆休息',
        icon: React.createElement(FaBed),
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        description: '疲労回復とパフォーマンス向上のアドバイス',
        action: () => handleSuggestionClick('recovery')
      },
      {
        id: 'motivation',
        title: 'モチベーション管理',
        icon: React.createElement(FaHeart),
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        description: `達成率${Math.round(context.taskCompletion)}%の今、必要なアドバイス`,
        action: () => handleSuggestionClick('motivation')
      },
      {
        id: 'stress',
        title: 'ストレス＆メンタル',
        icon: React.createElement(FaBrain),
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        description: '心と体のバランスを整える提案',
        action: () => handleSuggestionClick('stress')
      },
      {
        id: 'challenge',
        title: '今日のチャレンジ',
        icon: React.createElement(FaFire),
        color: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
        description: '限界を超えるための特別メニュー',
        action: () => handleSuggestionClick('challenge')
      }
    ];
    
    setSuggestions(suggestions);
    setIsLoading(false);
  };

  useEffect(() => {
    generateInitialSuggestions();
  }, []);

  const handleSuggestionClick = async (type: string) => {
    setIsLoading(true);
    setCurrentView('suggestion');
    
    const context = analyzeUserContext();
    
    try {
      let prompt = '';
      
      switch (type) {
        case 'workout':
          prompt = `
            ユーザー情報:
            - 現在体重: ${context.currentWeight}kg
            - 目標体重: ${context.goalWeight}kg
            - 時間帯: ${context.timeOfDay}
            - 活動レベル: ${context.activityLevel}
            
            ${context.timeOfDay}に最適なトレーニングメニューを提案してください。
            具体的な種目、セット数、レップ数、休憩時間を含めてください。
          `;
          break;
          
        case 'nutrition':
          prompt = `
            ユーザー情報:
            - 体重差: ${context.weightDiff}kg ${context.needsWeightLoss ? '減量必要' : '増量必要'}
            - 時間帯: ${context.timeOfDay}
            
            ${context.timeOfDay}の食事として最適なメニューを3つ提案してください。
            カロリー、栄養バランス、簡単な作り方も含めてください。
          `;
          break;
          
        case 'recovery':
          prompt = `
            ユーザーの活動レベル: ${context.activityLevel}
            タスク達成率: ${context.taskCompletion}%
            
            効果的な休息とリカバリー方法を提案してください。
            ストレッチ、睡眠、栄養補給の観点から具体的にアドバイスしてください。
          `;
          break;
          
        case 'motivation':
          prompt = `
            現在のタスク達成率: ${context.taskCompletion}%
            体重目標まで: ${context.weightDiff}kg
            
            モチベーションを維持・向上させるための具体的なアドバイスと、
            今すぐできる行動を3つ提案してください。
          `;
          break;
          
        case 'stress':
          prompt = `
            時間帯: ${context.timeOfDay}
            活動レベル: ${context.activityLevel}
            
            ストレス解消とメンタルヘルス向上のための具体的な方法を提案してください。
            呼吸法、瞑想、軽い運動など、すぐに実践できるものを中心に。
          `;
          break;
          
        case 'challenge':
          prompt = `
            ユーザーの現在体重: ${context.currentWeight}kg
            活動レベル: ${context.activityLevel}
            
            今日の特別チャレンジを提案してください。
            少しハードだが達成可能で、達成感を得られるものを。
          `;
          break;
      }
      
      // TODO: 実際のGemini APIコール
      // const response = await getDailyAdvice(userProfile, prompt);
      
      // モックレスポンス
      const mockResponse = {
        title: getSuggestionTitle(type),
        content: getMockContent(type),
        actionItems: getMockActionItems(type)
      };
      
      setSelectedSuggestion(mockResponse);
      setConversation([
        { role: 'ai', content: mockResponse.content }
      ]);
      
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      workout: 'あなたのためのトレーニングプラン',
      nutrition: '理想的な食事メニュー',
      recovery: 'リカバリー＆休息プラン',
      motivation: 'モチベーションアップ戦略',
      stress: 'ストレス解消プログラム',
      challenge: '今日のスペシャルチャレンジ'
    };
    return titles[type] || 'AIからの提案';
  };

  const getMockContent = (type: string) => {
    const context = analyzeUserContext();
    
    const contents: { [key: string]: string } = {
      workout: `${context.timeOfDay}のトレーニングとして、以下をおすすめします：\n\n1. ウォームアップ（5分）\n2. スクワット 3セット×12回\n3. プッシュアップ 3セット×10回\n4. プランク 3セット×30秒\n5. クールダウン（5分）\n\n合計約20分で効果的なトレーニングができます。`,
      nutrition: `${context.needsWeightLoss ? '減量中' : '筋肉増強'}のあなたにおすすめ：\n\n1. 鶏胸肉のグリル（150g）+ サラダ\n2. 玄米おにぎり（2個）+ 味噌汁\n3. プロテインスムージー + ナッツ\n\nタンパク質を中心に、バランスよく摂取しましょう。`,
      recovery: '効果的なリカバリー方法：\n\n1. 軽いストレッチ（10分）\n2. 温かいお風呂でリラックス\n3. 質の良い睡眠（7-8時間）\n4. 水分補給を忘れずに',
      motivation: `素晴らしい！達成率${Math.round(context.taskCompletion)}%です！\n\n今すぐできること：\n1. 小さな成功を記録する\n2. 明日の目標を1つ決める\n3. 自分へのご褒美を設定する`,
      stress: 'ストレス解消法：\n\n1. 4-7-8呼吸法を3セット\n2. 5分間の瞑想\n3. 好きな音楽を聴く\n4. 軽い散歩に出る',
      challenge: '今日のチャレンジ：\n\n🔥 バーピー30回チャレンジ！\n\n10回×3セットに分けてOK。\n達成したら必ずご褒美を！'
    };
    
    return contents[type] || '提案を生成中...';
  };

  const getMockActionItems = (type: string) => {
    const items: { [key: string]: string[] } = {
      workout: ['トレーニングを開始', '詳細を見る', 'カスタマイズ'],
      nutrition: ['食事を記録', 'レシピを見る', '買い物リスト作成'],
      recovery: ['ストレッチ開始', 'タイマーセット', '睡眠記録'],
      motivation: ['目標を更新', '進捗を確認', '仲間とシェア'],
      stress: ['瞑想を開始', '呼吸エクササイズ', '日記を書く'],
      challenge: ['チャレンジ開始', '友達に挑戦', '記録する']
    };
    return items[type] || ['実行する'];
  };

  const handleUserQuestion = async () => {
    if (!userInput.trim()) return;
    
    setConversation(prev => [...prev, { role: 'user', content: userInput }]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // TODO: Gemini APIで質問に回答
      const mockAnswer = 'はい、そのアプローチで問題ありません。さらに効果を高めるには...';
      
      setConversation(prev => [...prev, { role: 'ai', content: mockAnswer }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRecommendation = () => {
    if (selectedSuggestion) {
      onAcceptRecommendation({
        title: selectedSuggestion.title,
        description: selectedSuggestion.content,
        exercises: selectedSuggestion.content.split('\n').filter((line: string) => line.trim())
      });
      onClose();
    }
  };

  return (
    <motion.div
      className="ai-trainer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="ai-trainer-container"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        <div className="ai-trainer-header">
          {currentView === 'suggestion' && (
            <motion.button
              className="back-button"
              onClick={() => setCurrentView('menu')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaChevronLeft />
            </motion.button>
          )}
          <h2>AIパーソナルトレーナー</h2>
          <motion.button
            className="close-button"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'menu' ? (
            <motion.div
              key="menu"
              className="suggestions-menu"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <p className="menu-subtitle">今のあなたに最適な提案を選んでください</p>
              
              {isLoading ? (
                <div className="loading-state">
                  <FaSpinner className="spinner" />
                  <p>あなたの状況を分析中...</p>
                </div>
              ) : (
                <div className="suggestions-grid">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.id}
                      className="suggestion-card"
                      onClick={suggestion.action}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ background: suggestion.color }}
                    >
                      <div className="suggestion-icon">{suggestion.icon}</div>
                      <h3>{suggestion.title}</h3>
                      <p>{suggestion.description}</p>
                    </motion.button>
                  ))}
                </div>
              )}

              <motion.button
                className="refresh-button"
                onClick={generateInitialSuggestions}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdRefresh /> 他の提案を見る
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="suggestion"
              className="suggestion-detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              {isLoading ? (
                <div className="loading-state">
                  <FaSpinner className="spinner" />
                  <p>最適な提案を生成中...</p>
                </div>
              ) : selectedSuggestion && (
                <>
                  <h3>{selectedSuggestion.title}</h3>
                  
                  <div className="conversation-area">
                    {conversation.map((msg, index) => (
                      <motion.div
                        key={index}
                        className={`message ${msg.role}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <pre>{msg.content}</pre>
                      </motion.div>
                    ))}
                  </div>

                  <div className="action-buttons">
                    {selectedSuggestion.actionItems?.map((item: string, index: number) => (
                      <motion.button
                        key={index}
                        className="action-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (index === 0) acceptRecommendation();
                        }}
                      >
                        {item}
                      </motion.button>
                    ))}
                  </div>

                  <div className="question-input">
                    <input
                      type="text"
                      placeholder="質問があれば入力してください..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUserQuestion()}
                    />
                    <motion.button
                      onClick={handleUserQuestion}
                      disabled={!userInput.trim() || isLoading}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      送信
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AIPersonalTrainer;