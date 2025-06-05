import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { FaUser, FaWeight, FaRuler, FaBirthdayCake, FaRunning, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { MdNavigateNext } from 'react-icons/md';

interface InitialSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    age: 30,
    height: 170,
    weight: 70,
    goalWeight: 65,
    activityLevel: 'moderate',
    goals: {
      calories: 2000,
      protein: 60,
      carbs: 250,
      fat: 65,
      water: 2000,
      steps: 10000,
      exerciseMinutes: 30,
    }
  });
  const [errors, setErrors] = useState<string[]>([]);

  const validateAndProceed = () => {
    const newErrors: string[] = [];
    
    if (step === 1 && !profile.name) {
      newErrors.push('お名前を入力してください');
    }
    
    if (step === 2) {
      if (!profile.age || profile.age < 10 || profile.age > 100) {
        newErrors.push('年齢は10〜100歳の間で入力してください');
      }
      if (!profile.height || profile.height < 100 || profile.height > 250) {
        newErrors.push('身長は100〜250cmの間で入力してください');
      }
    }
    
    if (step === 3) {
      if (!profile.weight || profile.weight < 30 || profile.weight > 200) {
        newErrors.push('体重は30〜200kgの間で入力してください');
      }
      if (!profile.goalWeight || profile.goalWeight < 30 || profile.goalWeight > 200) {
        newErrors.push('目標体重は30〜200kgの間で入力してください');
      }
      
      // 危険な目標設定をチェック
      const weightDiff = Math.abs(profile.weight! - profile.goalWeight!);
      const weightChangePercent = (weightDiff / profile.weight!) * 100;
      
      if (weightChangePercent > 30) {
        newErrors.push('⚠️ 体重の30%以上の変化は健康に悪影響を与える可能性があります');
      }
      
      if (profile.goalWeight! < 18.5 * (profile.height! / 100) ** 2) {
        newErrors.push('⚠️ 目標体重がBMI18.5未満になります。健康的な範囲で設定してください');
      }
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      // カロリー計算
      const bmr = profile.weight! * 24;
      const activityMultiplier = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
      }[profile.activityLevel as string] || 1.55;
      
      const dailyCalories = Math.round(bmr * activityMultiplier);
      const needsWeightLoss = profile.weight! > profile.goalWeight!;
      
      const completeProfile: UserProfile = {
        name: profile.name!,
        age: profile.age!,
        height: profile.height!,
        weight: profile.weight!,
        goalWeight: profile.goalWeight!,
        activityLevel: profile.activityLevel as any,
        goals: {
          calories: needsWeightLoss ? Math.round(dailyCalories * 0.85) : Math.round(dailyCalories * 1.1),
          protein: Math.round(profile.weight! * 2),
          carbs: Math.round(dailyCalories * 0.45 / 4),
          fat: Math.round(dailyCalories * 0.25 / 9),
          water: 2500,
          steps: 10000,
          exerciseMinutes: 30,
        }
      };
      
      onComplete(completeProfile);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="setup-step"
          >
            <div className="step-icon">
              <FaUser />
            </div>
            <h2>ようこそ！まずはお名前を教えてください</h2>
            <p>あなたに合わせたパーソナルプランを作成します</p>
            
            <div className="input-group">
              <input
                type="text"
                placeholder="お名前（ニックネームでもOK）"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="setup-input"
                autoFocus
              />
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="setup-step"
          >
            <div className="step-icon">
              <FaBirthdayCake />
            </div>
            <h2>{profile.name}さんの基本情報を教えてください</h2>
            <p>正確なアドバイスのために必要です</p>
            
            <div className="input-grid">
              <div className="input-group">
                <label>年齢</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                    className="setup-input"
                  />
                  <span className="unit">歳</span>
                </div>
              </div>
              
              <div className="input-group">
                <label>身長</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                    className="setup-input"
                  />
                  <span className="unit">cm</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="setup-step"
          >
            <div className="step-icon">
              <FaWeight />
            </div>
            <h2>現在の体重と目標を設定しましょう</h2>
            <p>無理のない健康的な目標を立てることが成功の秘訣です</p>
            
            <div className="input-grid">
              <div className="input-group">
                <label>現在の体重</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    step="0.1"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                    className="setup-input"
                  />
                  <span className="unit">kg</span>
                </div>
              </div>
              
              <div className="input-group">
                <label>目標体重</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    step="0.1"
                    value={profile.goalWeight}
                    onChange={(e) => setProfile({ ...profile, goalWeight: parseFloat(e.target.value) || 0 })}
                    className="setup-input"
                  />
                  <span className="unit">kg</span>
                </div>
              </div>
            </div>
            
            {profile.weight && profile.goalWeight && (
              <div className="weight-analysis">
                <div className="analysis-item">
                  <span>変化量</span>
                  <strong>{Math.abs(profile.weight - profile.goalWeight).toFixed(1)}kg</strong>
                </div>
                <div className="analysis-item">
                  <span>推奨期間</span>
                  <strong>{Math.ceil(Math.abs(profile.weight - profile.goalWeight) / 0.5)}週間</strong>
                </div>
              </div>
            )}
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="setup-step"
          >
            <div className="step-icon">
              <FaRunning />
            </div>
            <h2>普段の活動レベルを教えてください</h2>
            <p>適切なカロリー計算のために必要です</p>
            
            <div className="activity-options">
              {[
                { value: 'sedentary', label: 'ほとんど運動しない', desc: 'デスクワーク中心' },
                { value: 'light', label: '軽い運動', desc: '週1-2回の運動' },
                { value: 'moderate', label: '適度な運動', desc: '週3-4回の運動' },
                { value: 'active', label: '活発', desc: '週5-6回の運動' },
                { value: 'veryActive', label: 'とても活発', desc: '毎日激しい運動' }
              ].map(option => (
                <motion.button
                  key={option.value}
                  className={`activity-option ${profile.activityLevel === option.value ? 'selected' : ''}`}
                  onClick={() => setProfile({ ...profile, activityLevel: option.value as any })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="option-label">{option.label}</div>
                  <div className="option-desc">{option.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="initial-setup-overlay">
      <motion.div 
        className="initial-setup-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="setup-progress">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`progress-dot ${i <= step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        
        {errors.length > 0 && (
          <motion.div
            className="error-messages"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.map((error, index) => (
              <div key={index} className="error-message">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            ))}
          </motion.div>
        )}
        
        <div className="setup-actions">
          {step > 1 && (
            <motion.button
              className="back-button"
              onClick={() => {
                setErrors([]);
                setStep(step - 1);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              戻る
            </motion.button>
          )}
          
          <motion.button
            className="next-button"
            onClick={validateAndProceed}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{step === 4 ? '始める' : '次へ'}</span>
            <MdNavigateNext />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default InitialSetup;