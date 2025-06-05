import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { FaDumbbell, FaLock, FaUser, FaApple, FaRunning, FaHeartbeat } from 'react-icons/fa';
import '../styles/Auth.css';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Supabaseでログイン
      const { error } = await supabase.auth.signInWithPassword({
        email: email.includes('@') ? email : `${email}@fitlife.app`,
        password: password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません');
        } else {
          setError('ログインに失敗しました');
        }
      }
    } catch (error: any) {
      setError('ログインエラーが発生しました');
    }
    
    setLoading(false);
  };


  const floatingIcons = [
    { icon: FaDumbbell, delay: 0 },
    { icon: FaApple, delay: 0.2 },
    { icon: FaRunning, delay: 0.4 },
    { icon: FaHeartbeat, delay: 0.6 },
  ];

  return (
    <div className="auth-wrapper">
      {/* 背景のアニメーションアイコン */}
      <div className="auth-bg-icons">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="floating-icon"
            initial={{ y: '100vh', x: Math.random() * window.innerWidth }}
            animate={{ 
              y: '-100vh',
              x: Math.random() * window.innerWidth 
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              delay: item.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <item.icon size={30 + Math.random() * 20} />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ロゴセクション */}
        <motion.div 
          className="auth-logo-section"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
        >
          <div className="auth-logo">
            <FaDumbbell size={40} />
          </div>
          <h1 className="auth-title">FitLife</h1>
          <p className="auth-subtitle">理想の体を、あなたの手に</p>
        </motion.div>

        {/* ログインフォーム */}
        <form onSubmit={handleAuth} className="auth-form">
          <motion.div 
            className="auth-input-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="メールアドレスまたはユーザー名"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              autoComplete="username"
            />
          </motion.div>

          <motion.div 
            className="auth-input-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              minLength={6}
              autoComplete="current-password"
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="loading-spinner"
                >
                  <div className="spinner"></div>
                </motion.div>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  さあ、始めよう
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        {/* フッター */}
        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="auth-footer-text">
            健康的な生活習慣を、今日から始めましょう
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;