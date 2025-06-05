import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOTIVATIONAL_QUOTES = [
  { text: "今日の一歩が、明日の大きな飛躍になる！", author: "💪" },
  { text: "限界は、あなたが決めるものじゃない。超えるものだ！", author: "🔥" },
  { text: "昨日の自分を超えていこう！", author: "🚀" },
  { text: "筋肉は裏切らない。努力も裏切らない。", author: "💯" },
  { text: "最高の投資は、自分の体への投資だ！", author: "🏆" },
  { text: "疲れた時こそ、成長のチャンス！", author: "⚡" },
  { text: "1%でも昨日より良くなろう！", author: "📈" },
  { text: "痛みは一時的、諦めは一生。", author: "🎯" },
  { text: "強い体は、強い心を作る。", author: "🧠" },
  { text: "今日も最高の自分を更新しよう！", author: "✨" }
];

const ACHIEVEMENT_MESSAGES = [
  "素晴らしい！その調子！🎉",
  "最高だね！キミならできる！🌟",
  "やったね！新記録更新だ！🏅",
  "完璧！この勢いで行こう！🚀",
  "すごい！限界突破だ！💥",
  "最強！誰にも止められない！⚡",
  "天才！その努力は必ず報われる！🌈",
  "レジェンド誕生の瞬間だ！👑",
  "神ってる！この調子で頂点へ！🏔️",
  "無敵！君は既にヒーローだ！🦸"
];

interface MotivationalQuotesProps {
  trigger?: number; // 更新トリガー
  showAchievement?: boolean;
}

const MotivationalQuotes: React.FC<MotivationalQuotesProps> = ({ trigger, showAchievement }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [achievementMessage, setAchievementMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000); // 10秒ごとに切り替え

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showAchievement) {
      const randomMessage = ACHIEVEMENT_MESSAGES[Math.floor(Math.random() * ACHIEVEMENT_MESSAGES.length)];
      setAchievementMessage(randomMessage);
      const timer = setTimeout(() => setAchievementMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAchievement, trigger]);

  return (
    <div className="motivational-section">
      <AnimatePresence mode="wait">
        {achievementMessage ? (
          <motion.div
            key="achievement"
            className="achievement-message"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <h2>{achievementMessage}</h2>
          </motion.div>
        ) : (
          <motion.div
            key={currentQuote}
            className="quote-container"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <blockquote>
              <p>"{MOTIVATIONAL_QUOTES[currentQuote].text}"</p>
              <footer>{MOTIVATIONAL_QUOTES[currentQuote].author}</footer>
            </blockquote>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotivationalQuotes;