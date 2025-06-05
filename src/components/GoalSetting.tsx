import React, { useState, useEffect } from 'react';
import { UserProfile, FitnessGoal, FitnessPlan } from '../types';
import { generateFitnessPlan } from '../services/geminiService';
import { format, addWeeks } from 'date-fns';
import { FaRedo } from 'react-icons/fa';

interface GoalSettingProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onPlanGenerated: (plan: FitnessPlan) => void;
}

const GoalSetting: React.FC<GoalSettingProps> = ({ userProfile, onUpdateProfile, onPlanGenerated }) => {
  const [targetWeight, setTargetWeight] = useState(userProfile.goalWeight || userProfile.weight);
  const [targetMuscleMass, setTargetMuscleMass] = useState(0);
  const [targetBodyFat, setTargetBodyFat] = useState(15);
  const [currentBodyFat, setCurrentBodyFat] = useState(20);
  const [timeframe, setTimeframe] = useState(12); // weeks
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Calculate muscle mass from body weight and body fat percentage
  useEffect(() => {
    const currentFatMass = userProfile.weight * (currentBodyFat / 100);
    // const currentLeanMass = userProfile.weight - currentFatMass; // For future use
    const targetFatMass = targetWeight * (targetBodyFat / 100);
    const calculatedTargetMuscleMass = targetWeight - targetFatMass;
    
    setTargetMuscleMass(Math.round(calculatedTargetMuscleMass * 10) / 10);
  }, [userProfile.weight, currentBodyFat, targetWeight, targetBodyFat]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const planData = await generateFitnessPlan(
        userProfile.weight,
        targetWeight,
        targetMuscleMass,
        currentBodyFat,
        targetBodyFat,
        userProfile.activityLevel,
        timeframe
      );

      setGeneratedPlan(planData);

      // Create structured fitness plan
      const fitnessPlan: FitnessPlan = {
        id: Date.now().toString(),
        userId: userProfile.name,
        startDate: new Date(),
        endDate: addWeeks(new Date(), timeframe),
        phases: extractPhasesFromPlan(planData.rawPlan),
        weeklyPlan: extractWeeklyPlanFromPlan(planData.rawPlan),
        createdAt: new Date()
      };

      // Update user profile with fitness goal
      const fitnessGoal: FitnessGoal = {
        targetWeight,
        targetMuscleMass,
        targetBodyFatPercentage: targetBodyFat,
        targetDate: addWeeks(new Date(), timeframe),
        currentMuscleMass: userProfile.weight - (userProfile.weight * (currentBodyFat / 100)),
        currentBodyFatPercentage: currentBodyFat
      };

      const updatedProfile = {
        ...userProfile,
        fitnessGoal
      };

      onUpdateProfile(updatedProfile);
      onPlanGenerated(fitnessPlan);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('プラン生成中にエラーが発生しました。APIキーを確認してください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const extractPhasesFromPlan = (rawPlan: string): any[] => {
    // This is a simplified extraction. In a real app, you'd parse the response more carefully
    return [
      {
        name: '準備期',
        duration: 2,
        focus: 'maintenance',
        dailyCalories: 2200,
        proteinTarget: 150,
        carbsTarget: 220,
        fatTarget: 70,
        workoutFrequency: 4
      },
      {
        name: targetWeight > userProfile.weight ? '増量期' : '減量期',
        duration: timeframe - 4,
        focus: targetWeight > userProfile.weight ? 'bulking' : 'cutting',
        dailyCalories: targetWeight > userProfile.weight ? 2800 : 1800,
        proteinTarget: targetMuscleMass * 2.2,
        carbsTarget: targetWeight > userProfile.weight ? 350 : 150,
        fatTarget: 60,
        workoutFrequency: 5
      },
      {
        name: '調整期',
        duration: 2,
        focus: 'maintenance',
        dailyCalories: 2200,
        proteinTarget: targetMuscleMass * 2,
        carbsTarget: 250,
        fatTarget: 70,
        workoutFrequency: 4
      }
    ];
  };

  const extractWeeklyPlanFromPlan = (rawPlan: string): any => {
    // Simplified weekly plan
    return {
      monday: { workoutType: 'chest', exercises: [], nutritionFocus: '高タンパク質' },
      tuesday: { workoutType: 'back', exercises: [], nutritionFocus: '炭水化物補給' },
      wednesday: { workoutType: 'rest', exercises: [], nutritionFocus: '回復重視' },
      thursday: { workoutType: 'legs', exercises: [], nutritionFocus: '高カロリー' },
      friday: { workoutType: 'shoulders', exercises: [], nutritionFocus: 'バランス重視' },
      saturday: { workoutType: 'arms', exercises: [], nutritionFocus: '高タンパク質' },
      sunday: { workoutType: 'cardio', exercises: [], nutritionFocus: '低脂質' }
    };
  };

  return (
    <div className="goal-setting">
      <h2>目標設定とプラン作成</h2>
      
      <div className="current-stats">
        <h3>現在の状態</h3>
        <div className="stat-grid">
          <div className="stat-item">
            <label>現在の体重</label>
            <span>{userProfile.weight} kg</span>
          </div>
          <div className="stat-item">
            <label>現在の体脂肪率</label>
            <input
              type="number"
              value={currentBodyFat}
              onChange={(e) => setCurrentBodyFat(Number(e.target.value))}
              min="5"
              max="40"
              step="0.5"
            />
            <span>%</span>
          </div>
          <div className="stat-item">
            <label>推定筋肉量</label>
            <span>{(userProfile.weight - (userProfile.weight * (currentBodyFat / 100))).toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      <div className="target-stats">
        <h3>目標設定</h3>
        <div className="stat-grid">
          <div className="stat-item">
            <label>目標体重</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value))}
              min="40"
              max="150"
              step="0.5"
            />
            <span>kg</span>
          </div>
          <div className="stat-item">
            <label>目標体脂肪率</label>
            <input
              type="number"
              value={targetBodyFat}
              onChange={(e) => setTargetBodyFat(Number(e.target.value))}
              min="5"
              max="30"
              step="0.5"
            />
            <span>%</span>
          </div>
          <div className="stat-item">
            <label>目標筋肉量</label>
            <span>{targetMuscleMass} kg</span>
          </div>
          <div className="stat-item">
            <label>達成期間</label>
            <input
              type="number"
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              min="4"
              max="52"
              step="1"
            />
            <span>週間</span>
          </div>
        </div>
      </div>

      <div className="plan-actions">
        <button 
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="generate-plan-button"
        >
          {isGenerating ? 'プラン生成中...' : 'AIプランを生成'}
        </button>
        <button
          onClick={() => {
            if (window.confirm('初期設定をやり直しますか？すべてのデータがリセットされます。')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="reset-button"
          title="初期設定をやり直す"
        >
          <FaRedo /> 初期設定をやり直す
        </button>
      </div>

      {generatedPlan && (
        <div className="generated-plan">
          <h3>生成されたプラン</h3>
          <div className="plan-summary">
            <p>開始日: {format(new Date(), 'yyyy年MM月dd日')}</p>
            <p>終了日: {format(addWeeks(new Date(), timeframe), 'yyyy年MM月dd日')}</p>
            <p>体重変化: {userProfile.weight}kg → {targetWeight}kg ({targetWeight - userProfile.weight > 0 ? '+' : ''}{(targetWeight - userProfile.weight).toFixed(1)}kg)</p>
            <p>体脂肪率変化: {currentBodyFat}% → {targetBodyFat}% ({targetBodyFat - currentBodyFat > 0 ? '+' : ''}{(targetBodyFat - currentBodyFat).toFixed(1)}%)</p>
          </div>
          <div className="plan-details">
            <pre>{generatedPlan.rawPlan}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSetting;