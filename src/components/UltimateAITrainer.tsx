import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { FaTimes, FaRobot, FaPaperPlane, FaChartLine, FaMedal, FaFire, FaHeart, FaBed, FaUtensils } from 'react-icons/fa';
import { MdFitnessCenter, MdRestaurant, MdPsychology, MdAutoAwesome } from 'react-icons/md';

interface UltimateAITrainerProps {
  userProfile: UserProfile;
  todayTasks?: any[];
  nutritionData?: any;
  onAcceptRecommendation: (recommendation: any) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: Action[];
  type?: 'text' | 'recommendation' | 'chart' | 'achievement';
}

interface Action {
  id: string;
  label: string;
  icon: React.ReactElement;
  primary?: boolean;
  onClick: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactElement;
  query: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'daily-plan',
    label: '今日のプラン',
    icon: React.createElement(FaChartLine),
    query: 'GENERATE_DAILY_PLAN',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'muscle',
    label: '筋肉を増やしたい',
    icon: React.createElement(MdFitnessCenter),
    query: '筋肉量を効率的に増やすためのトレーニングと食事プランを教えて',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'weight-loss',
    label: '体重を落としたい',
    icon: React.createElement(FaFire),
    query: '健康的に体重を減らすための具体的な方法を教えて',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 'meal',
    label: '今何を食べるべき？',
    icon: React.createElement(MdRestaurant),
    query: '現在の時間帯と目標に最適な食事を提案して',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'tired',
    label: '体調が優れない',
    icon: React.createElement(FaHeart),
    query: '体調があまり良くないのですが、どうすればいいですか',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 'motivation',
    label: 'やる気が出ない',
    icon: React.createElement(MdPsychology),
    query: 'モチベーションを上げる具体的な方法を教えて',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
];

const UltimateAITrainer: React.FC<UltimateAITrainerProps> = ({
  userProfile,
  todayTasks = [],
  nutritionData = [],
  onAcceptRecommendation,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [userStats, setUserStats] = useState({
    streak: 0,
    totalWorkouts: 0,
    avgCalories: 0,
    progress: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 初期メッセージ
    const greeting = getPersonalizedGreeting();
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content: greeting,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([initialMessage]);
    
    // ユーザー統計を計算
    calculateUserStats();
    
    // デイリープランリクエストのリスナー
    const handleDailyPlanRequest = () => {
      setTimeout(() => {
        generateDailyPlan();
      }, 100);
    };
    
    // ウェルカムプランリクエストのリスナー
    const handleWelcomePlanRequest = () => {
      setTimeout(() => {
        generateWelcomePlan();
      }, 100);
    };
    
    window.addEventListener('requestDailyPlan', handleDailyPlanRequest);
    window.addEventListener('requestWelcomePlan', handleWelcomePlanRequest);
    
    return () => {
      window.removeEventListener('requestDailyPlan', handleDailyPlanRequest);
      window.removeEventListener('requestWelcomePlan', handleWelcomePlanRequest);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPersonalizedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const timeString = `${hour}:${minutes.toString().padStart(2, '0')}`;
    const name = userProfile.name;
    const weightDiff = userProfile.weight - userProfile.goalWeight;
    const completedTasks = todayTasks.filter(t => t.completed).length;
    
    let greeting = '';
    let timeAdvice = '';
    
    if (hour >= 5 && hour < 9) {
      greeting = `おはようございます、${name}さん！☀️ 現在${timeString}`;
      timeAdvice = '\n朝の運動は代謝を上げるのに最適な時間帯です。';
    } else if (hour >= 9 && hour < 12) {
      greeting = `おはようございます、${name}さん！現在${timeString}`;
      timeAdvice = '\n午前中は集中力が高い時間。トレーニングにも最適です。';
    } else if (hour >= 12 && hour < 14) {
      greeting = `こんにちは、${name}さん！現在${timeString}`;
      timeAdvice = '\nランチタイムですね。栄養バランスを意識した食事を。';
    } else if (hour >= 14 && hour < 17) {
      greeting = `こんにちは、${name}さん！現在${timeString}`;
      timeAdvice = '\n午後の眠気に注意。軽いストレッチで気分転換を。';
    } else if (hour >= 17 && hour < 19) {
      greeting = `お疲れ様です、${name}さん！現在${timeString}`;
      timeAdvice = '\n夕方のトレーニングは筋力アップに効果的です。';
    } else if (hour >= 19 && hour < 21) {
      greeting = `お疲れ様です、${name}さん！現在${timeString}`;
      timeAdvice = '\n夕食は就寝3時間前までに。消化の良いものを選びましょう。';
    } else if (hour >= 21 && hour < 23) {
      greeting = `今日も一日お疲れ様でした、${name}さん！🌙 現在${timeString}`;
      timeAdvice = '\nそろそろリラックスタイム。激しい運動は控えめに。';
    } else if (hour >= 23 || hour < 2) {
      greeting = `まだ起きていらっしゃるんですね、${name}さん。現在${timeString}`;
      timeAdvice = '\n睡眠は筋肉の回復に重要。早めの就寝を心がけましょう。';
    } else {
      greeting = `深夜の活動お疲れ様です、${name}さん。現在${timeString}`;
      timeAdvice = '\n健康のため、規則正しい睡眠リズムを大切に。';
    }
    
    greeting += timeAdvice;

    if (completedTasks > 0) {
      greeting += `\n今日はすでに${completedTasks}個のタスクを完了！素晴らしいです！`;
    }

    if (Math.abs(weightDiff) < 2) {
      greeting += '\n目標体重まであと少し！一緒に頑張りましょう！';
    }

    greeting += '\n\n何でも聞いてください。体調のことでも、トレーニングのことでも、食事のことでも、あなたの状況に合わせて最適なアドバイスをします！';
    
    return greeting;
  };

  const calculateUserStats = () => {
    // 仮の統計計算（実際のデータから計算）
    const totalWorkouts = todayTasks.filter(t => t.category === 'exercise').length;
    const avgCalories = nutritionData.length > 0 
      ? nutritionData.reduce((sum: number, entry: any) => sum + entry.totalCalories, 0) / nutritionData.length
      : 0;
    
    setUserStats({
      streak: 7, // 仮の値
      totalWorkouts,
      avgCalories: Math.round(avgCalories),
      progress: 65 // 仮の値
    });
  };

  const handleSendMessage = async (message: string = inputValue) => {
    if (!message.trim()) return;

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowQuickActions(false);
    setIsTyping(true);

    // AI応答をシミュレート
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content: '',
      timestamp: new Date(),
      type: 'text'
    };

    // 体調不良のキーワードをチェック
    const isUnwell = lowerMessage.includes('風邪') || lowerMessage.includes('体調') || 
                     lowerMessage.includes('疲れ') || lowerMessage.includes('だるい') ||
                     lowerMessage.includes('熱') || lowerMessage.includes('咳') ||
                     lowerMessage.includes('頭痛') || lowerMessage.includes('腹痛');
    
    // 詳細なプランのリクエストをチェック
    if (lowerMessage.includes('休養プラン') && lowerMessage.includes('詳しい')) {
      response.content = `体調不良時の詳しい休養プランです：

🛌 **24時間休養スケジュール**

【朝】7:00-9:00
- ゆっくり起床、無理に起きない
- 白湯を飲んで体を温める
- 軽い朝食（おかゆ、スープなど）
- 体温測定と体調チェック

【昼】12:00-14:00
- 消化の良い昼食
- 15分程度の昼寝OK
- 水分補給を忘れずに

【夕方】17:00-19:00
- 軽いストレッチ（無理しない程度）
- 温かいお風呂（38-40度、15分以内）
- リラックスタイム

【夜】21:00-23:00
- 早めの就寝準備
- スマホ・PCは控える
- 部屋を暗くして睡眠環境を整える

💊 **回復を早めるポイント**
- 部屋の湿度を50-60%に保つ
- 1日2L以上の水分摂取
- ビタミンC・亜鉛を意識的に摂る
- ストレスを避ける`;
      return response;
    }
    
    if (lowerMessage.includes('食事メニュー') && lowerMessage.includes('体調不良')) {
      response.content = `体調不良時のおすすめ食事メニュー：

🍲 **朝食メニュー**
1. おかゆセット
   - 梅干しがゆ
   - 具なし味噌汁
   - りんごのすりおろし

2. スープセット
   - 野菜スープ（じゃがいも、人参）
   - 食パン1/2枚
   - ヨーグルト

🥣 **昼食メニュー**
1. うどんセット
   - かけうどん（ネギ少々）
   - 温泉卵
   - バナナ1/2本

2. 雑炊セット
   - 卵雑炊
   - ほうれん草のおひたし
   - みかん

🍵 **夕食メニュー**
1. 和食セット
   - 白身魚の煮付け
   - 大根の煮物
   - 豆腐の味噌汁

2. 洋食セット
   - チキンスープ
   - マッシュポテト
   - 温野菜

💧 **水分補給**
- 経口補水液
- スポーツドリンク（薄めて）
- 温かいほうじ茶
- 生姜湯`;
      return response;
    }
    
    if (lowerMessage.includes('5分') && lowerMessage.includes('運動')) {
      response.content = `5分間の簡単エクササイズ：

⏱️ **5分間プログラム**

0:00-1:00【ウォームアップ】
- 首回し（左右各5回）
- 肩回し（前後各10回）
- 腕振り（20回）

1:00-2:00【下半身】
- その場足踏み（30秒）
- 軽いスクワット（10回）
- かかと上げ（20回）

2:00-3:00【上半身】
- 壁プッシュアップ（10回）
- 腕の上下運動（15回）
- 肩甲骨ストレッチ（左右各10秒）

3:00-4:00【体幹】
- 立ったまま腹筋（お腹を凹ませる）20秒
- サイドベンド（左右各10回）
- 軽いツイスト（20回）

4:00-5:00【クールダウン】
- 深呼吸（5回）
- 前屈ストレッチ（20秒）
- 首と肩のストレッチ

✨ **ポイント**
- 無理をしない
- 呼吸を止めない
- 水分補給を忘れずに`;
      
      response.actions = [
        {
          id: 'done-workout',
          label: '完了！',
          icon: React.createElement(FaFire),
          primary: true,
          onClick: () => {
            handleSendMessage('5分運動を完了しました！次は何をすればいい？');
          }
        }
      ];
      return response;
    }

    // 体調不良の場合は休養を優先
    if (isUnwell) {
      response.content = `体調がすぐれないようですね。お大事にしてください。

😷 **今は休養が最優先です**

体調不良時のアドバイス：
1. **十分な休息**
   - 睡眠を7-8時間以上確保
   - 無理な運動は避ける
   - ストレスを減らす

2. **栄養補給**
   - 温かいスープや消化の良い食事
   - ビタミンC豊富な果物
   - 水分をこまめに摂取（1日2L以上）

3. **軽い活動のみ**
   - 軽いストレッチ程度に留める
   - 体調が回復してから運動再開
   - 深呼吸や瞑想でリラックス

${lowerMessage.includes('痩せ') || lowerMessage.includes('ダイエット') ? 
`\n💡 **体調回復後のダイエットアドバイス**
- 急激な減量は避け、健康的なペースで
- まずは体調を整えることが成功への近道
- 回復後、一緒に無理のない計画を立てましょう` : ''}

体調が良くなったら、また相談してくださいね。
今は無理せず、ゆっくり休んでください。`;
      
      response.actions = [
        {
          id: 'rest-plan',
          label: '休養プランを見る',
          icon: React.createElement(FaBed),
          primary: true,
          onClick: () => {
            handleSendMessage('体調不良時の詳しい休養プランを教えて');
          }
        },
        {
          id: 'nutrition-sick',
          label: '体調不良時の食事',
          icon: React.createElement(FaUtensils),
          onClick: () => {
            handleSendMessage('体調不良時におすすめの食事メニューを教えて');
          }
        }
      ];
      return response;
    }

    // キーワードに基づいて応答を生成
    if (lowerMessage.includes('筋肉') || lowerMessage.includes('増やす')) {
      response.type = 'recommendation';
      response.content = `筋肉量を増やすための最適なプランを作成しました！

💪 **トレーニングプラン**
1. **週4回の筋トレ**
   - 月曜: 胸・三頭筋
   - 火曜: 背中・二頭筋
   - 木曜: 脚・臀筋
   - 土曜: 肩・腹筋

2. **progressive overload法**
   - 毎週、重量を2.5%ずつ増加
   - セット間休憩: 2-3分

🍖 **栄養プラン**
- タンパク質: 体重×2g/日
- 炭水化物: 体重×4g/日
- 脂質: 体重×0.8g/日
- カロリー: 基礎代謝×1.5

💤 **回復**
- 睡眠: 7-8時間/日
- 水分: 3L/日
- ストレッチ: 毎日10分`;
      
      response.actions = [
        {
          id: 'start-plan',
          label: 'このプランを開始',
          icon: React.createElement(FaFire),
          primary: true,
          onClick: () => {
            onAcceptRecommendation({
              title: '筋肉増強プログラム',
              description: response.content,
              type: 'training'
            });
          }
        },
        {
          id: 'customize',
          label: 'カスタマイズ',
          icon: React.createElement(MdAutoAwesome),
          onClick: () => {
            handleSendMessage('このプランをもっと詳しくカスタマイズして');
          }
        }
      ];
    } else if (lowerMessage.includes('体重') || lowerMessage.includes('減らす') || lowerMessage.includes('痩せ')) {
      response.type = 'recommendation';
      response.content = `健康的な減量プランを提案します！

🔥 **減量戦略**
1. **カロリー管理**
   - 1日の摂取カロリー: ${Math.round(userProfile.weight * 25)}kcal
   - 週0.5-1kgの減量ペース

2. **有酸素運動**
   - 朝の有酸素運動: 30分
   - HIIT: 週3回×20分
   - 歩数目標: 10,000歩/日

3. **食事のタイミング**
   - 16:8間欠的断食
   - 炭水化物は運動前後に集中
   - 就寝3時間前から食事なし

📊 **予想結果**
- 1ヶ月: -2〜4kg
- 3ヶ月: -6〜12kg
- 体脂肪率: -3〜5%`;

      response.actions = [
        {
          id: 'start-diet',
          label: '減量開始',
          icon: React.createElement(FaChartLine),
          primary: true,
          onClick: () => {
            onAcceptRecommendation({
              title: '健康的減量プログラム',
              description: response.content,
              type: 'diet'
            });
          }
        }
      ];
    } else if (lowerMessage.includes('食べ') || lowerMessage.includes('食事')) {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hour}:${minutes.toString().padStart(2, '0')}`;
      
      let mealTime = '';
      let mealAdvice = '';
      
      if (hour >= 5 && hour < 10) {
        mealTime = '朝食';
        mealAdvice = '朝食は1日のエネルギー源。しっかり食べましょう！';
      } else if (hour >= 10 && hour < 12) {
        mealTime = '間食';
        mealAdvice = 'もうすぐランチタイム。軽めにしておきましょう。';
      } else if (hour >= 12 && hour < 14) {
        mealTime = '昼食';
        mealAdvice = '午後のエネルギー補給。バランスよく摂りましょう。';
      } else if (hour >= 14 && hour < 17) {
        mealTime = '間食';
        mealAdvice = '午後の集中力キープ。プロテインバーなどがおすすめ。';
      } else if (hour >= 17 && hour < 20) {
        mealTime = '夕食';
        mealAdvice = '就寝3時間前までに。消化に良いものを選びましょう。';
      } else if (hour >= 20 && hour < 22) {
        mealTime = '軽食';
        mealAdvice = '遅い時間の食事は控えめに。消化の良いものを。';
      } else {
        mealTime = '夜食';
        mealAdvice = '⚠️ 深夜の食事は避けましょう。どうしても空腹なら軽いものを。';
      }
      
      response.content = `現在${timeString} - ${mealTime}のおすすめメニュー：
${mealAdvice}

${hour >= 22 || hour < 5 ? 
`⚠️ **深夜の食事は控えめに**
- プロテインドリンク（低カロリー）
- 無糖ヨーグルト 100g
- ナッツ 10粒程度
- 合計: 200kcal以下に抑える

💡 **深夜に空腹を感じたら**
- 温かいお茶を飲む
- 水を飲んで空腹感を紛らわす
- どうしても我慢できない時のみ上記の軽食を` :
`🍽️ **オプション1: バランス重視**
- 鶏胸肉のグリル 150g
- 玄米 100g
- 野菜サラダ（ノンオイルドレッシング）
- 合計: 450kcal（P:35g C:45g F:8g）

🥗 **オプション2: 時短メニュー**
- プロテインシェイク
- バナナ 1本
- アーモンド 20g
- 合計: 380kcal（P:28g C:40g F:12g）

🍱 **オプション3: コンビニ飯**
- サラダチキン
- おにぎり（鮭）
- 野菜スープ
- 合計: 420kcal（P:30g C:50g F:6g）`}`;

      response.actions = [
        {
          id: 'log-meal',
          label: '食事を記録',
          icon: React.createElement(MdRestaurant),
          primary: true,
          onClick: () => {
            // 食事タブに切り替える（親コンポーネントで処理）
            onAcceptRecommendation({
              type: 'navigate',
              target: 'nutrition'
            });
            onClose();
          }
        }
      ];
    } else if (lowerMessage.includes('回復') && !isUnwell) {
      response.content = `リカバリーは成長の鍵です！

🛀 **効果的な回復方法**
1. アクティブリカバリー
   - 軽いヨガ: 15分
   - ストレッチ: 10分
   - 呼吸法: 5分

2. 栄養補給
   - タンパク質を適切に摂取
   - ビタミン・ミネラル補給
   - 水分補給（体重×40ml）

3. 睡眠の質向上
   - 就寝90分前に入浴
   - 室温: 18-20度
   - リラックス環境作り

💆 **継続的な回復習慣**
- 週1-2回の完全休養日
- セルフケアの習慣化
- ストレス管理`;
    } else if (lowerMessage.includes('やる気') || lowerMessage.includes('モチベーション')) {
      response.type = 'achievement';
      response.content = `モチベーションアップ戦略！

🎯 **今すぐできること**
1. 小さな成功体験を作る
   - 5分だけ運動する
   - 水を1杯飲む
   - 深呼吸を3回

2. 目標の可視化
   - 理想の体型写真を見る
   - 進捗グラフを確認
   - 成功者のストーリーを読む

🏆 **あなたの実績**
- 継続日数: ${userStats.streak}日
- 完了タスク: ${todayTasks.filter(t => t.completed).length}個
- 進捗率: ${userStats.progress}%

💡 **名言**
「千里の道も一歩から。今日の一歩があなたの未来を変える」`;

      response.actions = [
        {
          id: 'quick-workout',
          label: '5分運動開始',
          icon: React.createElement(FaFire),
          primary: true,
          onClick: () => {
            handleSendMessage('今すぐできる5分間の簡単な運動を教えて');
          }
        }
      ];
    } else {
      // デフォルト応答
      response.content = `了解しました！「${userMessage}」について、もう少し詳しく教えていただけますか？

例えば：
- 具体的な目標は何ですか？
- 現在の状況はどうですか？
- どんなサポートが必要ですか？

あなたに最適なアドバイスをするために、詳細を教えてください。`;
    }

    return response;
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.query === 'GENERATE_DAILY_PLAN') {
      generateDailyPlan();
    } else {
      handleSendMessage(action.query);
    }
  };
  
  const generateDailyPlan = () => {
    setShowQuickActions(false);
    setIsTyping(true);
    
    const now = new Date();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
    const hour = now.getHours();
    const weightDiff = userProfile.weight - userProfile.goalWeight;
    const needsWeightLoss = weightDiff > 0;
    
    // カロリー計算
    const basalMetabolicRate = userProfile.weight * 24; // 簡易計算
    const dailyCalories = needsWeightLoss 
      ? Math.round(basalMetabolicRate * 1.2 * 0.85) // 15%減
      : Math.round(basalMetabolicRate * 1.5); // 増量時
    
    const dailyPlan = `${userProfile.name}さんの今日（${dayOfWeek}曜日）のパーソナルプラン：

📊 **今日の目標**
- 摂取カロリー: ${dailyCalories}kcal
- タンパク質: ${Math.round(userProfile.weight * 2)}g
- 水分補給: 2.5L
- 歩数: 8,000歩以上

🍽️ **食事プラン**

【朝食】${hour < 10 ? '(これから)' : '(済)'}
${needsWeightLoss ? 
`- オートミール 40g + プロテイン
- ギリシャヨーグルト + ベリー
- ブラックコーヒー
合計: 約350kcal, P:25g` :
`- 玄米 150g + 納豆
- 鶏胸肉 100g + サラダ
- 味噌汁
合計: 約500kcal, P:35g`}

【昼食】${hour < 14 ? '(これから)' : '(済)'}
${needsWeightLoss ?
`- 鶏胸肉サラダボウル
- 全粒粉パン 1枚
- 野菜スープ
合計: 約400kcal, P:35g` :
`- パスタ 100g + ツナ
- サラダ + オリーブオイル
- プロテインシェイク
合計: 約650kcal, P:40g`}

【間食】${hour < 16 ? '(これから)' : '(済)'}
- プロテインバー or ナッツ20g
- 約150kcal, P:10-15g

【夕食】${hour < 20 ? '(これから)' : '(済)'}
${needsWeightLoss ?
`- 白身魚 150g
- 温野菜たっぷり
- 玄米 100g
合計: 約450kcal, P:35g` :
`- 牛赤身肉 150g
- じゃがいも 200g
- ブロッコリー + アスパラ
合計: 約600kcal, P:40g`}

💪 **運動プラン**

${hour < 12 ? '【午前】' : hour < 17 ? '【午後】' : '【夕方以降】'}
${(() => {
  const exerciseDay = now.getDay() % 3;
  if (exerciseDay === 0) {
    return `上半身トレーニング（30-40分）
- ベンチプレス or 腕立て伏せ 3×10
- ラットプルダウン or 懸垂 3×8
- ショルダープレス 3×10
- アームカール 3×12
- 有酸素運動 15分`;
  } else if (exerciseDay === 1) {
    return `下半身トレーニング（30-40分）
- スクワット 4×10
- デッドリフト 3×8
- レッグプレス 3×12
- カーフレイズ 3×15
- 有酸素運動 15分`;
  } else {
    return `アクティブリカバリー（20-30分）
- ヨガ or ストレッチ 15分
- ウォーキング 30分
- 体幹トレーニング 10分
- 呼吸エクササイズ`;
  }
})()}

🌙 **生活習慣チェック**
□ 起床後すぐに水を飲む
□ 3時間おきに水分補給
□ 食事は腹八分目
□ 就寝3時間前から食事なし
□ 22時までにお風呂
□ 23時までに就寝準備
□ スマホは寝室に持ち込まない

✨ **今日のポイント**
${needsWeightLoss ? 
'カロリー管理を意識しながら、タンパク質をしっかり摂って筋肉を維持しましょう。' :
'しっかり食べて、ハードなトレーニングに備えましょう。回復も大切です。'}

このプランでよければ「実行する」を、調整が必要なら教えてください！`;
    
    setTimeout(() => {
      const planMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: dailyPlan,
        timestamp: new Date(),
        type: 'recommendation',
        actions: [
          {
            id: 'accept-plan',
            label: '今日はこれでいく！',
            icon: React.createElement(FaFire),
            primary: true,
            onClick: () => {
              // プランをタスクに追加
              const tasks = extractTasksFromPlan(dailyPlan);
              tasks.forEach(task => {
                onAcceptRecommendation(task);
              });
              handleSendMessage('プランを実行します！頑張ります！');
            }
          },
          {
            id: 'adjust-plan',
            label: '調整したい',
            icon: React.createElement(MdAutoAwesome),
            onClick: () => {
              handleSendMessage('プランを調整したいです。どの部分を変更しましょうか？');
            }
          }
        ]
      };
      setMessages(prev => [...prev, planMessage]);
      setIsTyping(false);
    }, 2000);
  };
  
  const generateWelcomePlan = () => {
    setShowQuickActions(false);
    setIsTyping(true);
    
    const weightDiff = userProfile.weight - userProfile.goalWeight;
    const needsWeightLoss = weightDiff > 0;
    const bmi = userProfile.weight / ((userProfile.height / 100) ** 2);
    
    const welcomeMessage = `${userProfile.name}さん、FitLifeへようこそ！🎉

あなたのプロフィールを確認しました：
- 現在: ${userProfile.weight}kg（BMI: ${bmi.toFixed(1)}）
- 目標: ${userProfile.goalWeight}kg
- ${needsWeightLoss ? `${weightDiff.toFixed(1)}kgの減量` : `${Math.abs(weightDiff).toFixed(1)}kgの増量`}が目標

🎯 **あなたの成功プラン**

1. **現実的な目標設定**
   - 週に${needsWeightLoss ? '0.5-1kg' : '0.3-0.5kg'}のペース
   - 予想達成期間: ${Math.ceil(Math.abs(weightDiff) / (needsWeightLoss ? 0.75 : 0.4))}週間
   - 1日の摂取カロリー: ${userProfile.goals.calories}kcal

2. **健康的なアプローチ**
   ${needsWeightLoss ? 
   `- 極端な食事制限はNG
   - 筋肉を維持しながら脂肪を減らす
   - リバウンドしない習慣作り` :
   `- 良質なタンパク質を中心に
   - 筋トレで筋肉量アップ
   - 適切な休養も大切`}

3. **毎日のサポート**
   - AIが毎日パーソナルプランを作成
   - 進捗に応じて自動調整
   - 無理のない範囲で継続

⚠️ **大切なお約束**
${Math.abs(weightDiff) > 20 ? 
`目標達成には時間がかかりますが、焦らず確実に進めましょう。
急激な変化は体に負担をかけ、リバウンドの原因になります。` :
`目標は十分達成可能です！一緒に頑張りましょう。`}

今から一緒に、理想の体を作っていきましょう！
まずは今日のプランから始めてみませんか？`;
    
    setTimeout(() => {
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: welcomeMessage,
        timestamp: new Date(),
        type: 'recommendation',
        actions: [
          {
            id: 'show-daily-plan',
            label: '今日のプランを見る',
            icon: React.createElement(FaChartLine),
            primary: true,
            onClick: () => {
              generateDailyPlan();
            }
          },
          {
            id: 'learn-more',
            label: 'アプリの使い方',
            icon: React.createElement(MdAutoAwesome),
            onClick: () => {
              handleSendMessage('このアプリの使い方を教えて');
            }
          }
        ]
      };
      setMessages(prev => [...prev, welcomeMsg]);
      setIsTyping(false);
    }, 2000);
  };
  
  const extractTasksFromPlan = (plan: string) => {
    const tasks = [];
    const now = new Date();
    
    // 運動タスク
    if (plan.includes('上半身トレーニング')) {
      tasks.push({
        title: '上半身トレーニング',
        description: 'ベンチプレス、ラットプルダウン、ショルダープレス',
        type: 'exercise'
      });
    } else if (plan.includes('下半身トレーニング')) {
      tasks.push({
        title: '下半身トレーニング',
        description: 'スクワット、デッドリフト、レッグプレス',
        type: 'exercise'
      });
    } else {
      tasks.push({
        title: 'アクティブリカバリー',
        description: 'ヨガ、ウォーキング、ストレッチ',
        type: 'exercise'
      });
    }
    
    // 食事タスク
    if (now.getHours() < 10) {
      tasks.push({
        title: '朝食を摂る',
        description: plan.match(/【朝食】.*?合計:.*?P:\d+g/s)?.[0] || '栄養バランスの良い朝食',
        type: 'meal'
      });
    }
    
    if (now.getHours() < 14) {
      tasks.push({
        title: '昼食を摂る',
        description: plan.match(/【昼食】.*?合計:.*?P:\d+g/s)?.[0] || '栄養バランスの良い昼食',
        type: 'meal'
      });
    }
    
    if (now.getHours() < 20) {
      tasks.push({
        title: '夕食を摂る',
        description: plan.match(/【夕食】.*?合計:.*?P:\d+g/s)?.[0] || '栄養バランスの良い夕食',
        type: 'meal'
      });
    }
    
    // 習慣タスク
    tasks.push({
      title: '水分補給2.5L',
      description: '3時間おきに水分補給を忘れずに',
      type: 'habit'
    });
    
    tasks.push({
      title: '8,000歩歩く',
      description: '日常の移動で歩数を稼ぎましょう',
      type: 'habit'
    });
    
    return tasks;
  };

  return (
    <motion.div
      className="ultimate-ai-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="ultimate-ai-container"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        {/* ヘッダー */}
        <div className="ai-header">
          <div className="ai-header-left">
            <FaRobot className="ai-icon" />
            <div>
              <h2>AI パーソナルトレーナー</h2>
              <p>24時間365日、あなたの目標達成をサポート</p>
            </div>
          </div>
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>
        </div>

        {/* ユーザー統計バー */}
        <div className="user-stats-bar">
          <div className="stat-item">
            <FaFire />
            <span>{userStats.streak}日連続</span>
          </div>
          <div className="stat-item">
            <MdFitnessCenter />
            <span>{userStats.totalWorkouts}回運動</span>
          </div>
          <div className="stat-item">
            <FaMedal />
            <span>進捗 {userStats.progress}%</span>
          </div>
        </div>

        {/* チャットエリア */}
        <div className="chat-area">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`message ${message.role} ${message.type || 'text'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {message.role === 'ai' && (
                  <div className="message-avatar">
                    <FaRobot />
                  </div>
                )}
                <div className="message-content">
                  <pre>{message.content}</pre>
                  {message.actions && (
                    <div className="message-actions">
                      {message.actions.map(action => (
                        <motion.button
                          key={action.id}
                          className={`action-btn ${action.primary ? 'primary' : ''}`}
                          onClick={action.onClick}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {action.icon}
                          <span>{action.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              className="typing-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* クイックアクション */}
        <AnimatePresence>
          {showQuickActions && messages.length === 1 && (
            <motion.div
              className="quick-actions-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {QUICK_ACTIONS.map((action, index) => (
                <motion.button
                  key={action.id}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: action.color }}
                >
                  <div className="quick-action-icon">{action.icon}</div>
                  <span>{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 入力エリア */}
        <div className="input-area">
          <input
            ref={inputRef}
            type="text"
            placeholder="質問や相談を入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <motion.button
            className="send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaPaperPlane />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UltimateAITrainer;