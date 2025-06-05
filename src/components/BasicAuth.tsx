import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';

interface BasicAuthProps {
  children: React.ReactNode;
}

const BasicAuth: React.FC<BasicAuthProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // セッションストレージから認証状態を確認
    const authStatus = sessionStorage.getItem('basicAuth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'admin' && password === '!Sarami9300') {
      setIsAuthenticated(true);
      sessionStorage.setItem('basicAuth', 'authenticated');
      setError('');
    } else {
      setError('ユーザー名またはパスワードが正しくありません');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="basic-auth-overlay">
      <motion.div
        className="basic-auth-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="basic-auth-icon">
          <FaLock />
        </div>
        
        <h2>認証が必要です</h2>
        <p>FitLife Appにアクセスするには認証が必要です</p>
        
        <form onSubmit={handleLogin} className="basic-auth-form">
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="basic-auth-input"
            autoComplete="username"
          />
          
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="basic-auth-input"
            autoComplete="current-password"
          />
          
          {error && (
            <motion.div
              className="basic-auth-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            className="basic-auth-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ログイン
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default BasicAuth;