import { FoodAnalysis } from '../types';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export const analyzeFood = async (imageFile: File): Promise<FoodAnalysis> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  // Convert image to base64
  const base64Image = await fileToBase64(imageFile);
  
  const prompt = `この食事画像を分析して、以下の情報を日本語で提供してください：
1. 含まれている食品の名前
2. 推定カロリー（kcal）
3. 推定タンパク質（g）
4. 推定炭水化物（g）
5. 推定脂質（g）
6. 栄養バランスについてのアドバイス

できるだけ正確な推定値を提供してください。`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { 
              inline_data: {
                mime_type: imageFile.type,
                data: base64Image.split(',')[1]
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 1,
          topP: 0.9,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Parse the response and extract nutrition information
    return parseNutritionResponse(responseText);
  } catch (error) {
    console.error('Error analyzing food:', error);
    throw error;
  }
};

export const generateFitnessPlan = async (
  currentWeight: number,
  targetWeight: number,
  targetMuscleMass: number,
  currentBodyFat: number,
  targetBodyFat: number,
  activityLevel: string,
  timeframe: number // in weeks
): Promise<any> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `
パーソナルトレーナーとして、以下の情報を基に詳細なフィットネスプランを作成してください：

現在の状態：
- 体重: ${currentWeight}kg
- 体脂肪率: ${currentBodyFat}%
- 活動レベル: ${activityLevel}

目標：
- 目標体重: ${targetWeight}kg
- 目標筋肉量: ${targetMuscleMass}kg
- 目標体脂肪率: ${targetBodyFat}%
- 期間: ${timeframe}週間

以下の形式でプランを提供してください：

1. フェーズ分け（増量期、減量期、維持期など）
2. 各フェーズの期間と目標
3. 1日の摂取カロリーとマクロ栄養素（タンパク質、炭水化物、脂質）
4. 週間トレーニングスケジュール（各曜日の部位と休息日）
5. 各トレーニング日の推奨エクササイズ（セット数、レップ数含む）
6. 食事のタイミングとサプリメントの推奨
7. 進捗確認のマイルストーン

実現可能で健康的なプランを提供してください。`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 0.9,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return parseFitnessPlanResponse(data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Error generating fitness plan:', error);
    throw error;
  }
};

export const getDailyAdvice = async (
  todayNutrition: any,
  todayTasks: any[],
  goals: any
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `
パーソナルトレーナーとして、今日の進捗に基づいてアドバイスを提供してください：

今日の栄養摂取：
- カロリー: ${todayNutrition.calories}kcal (目標: ${goals.calories}kcal)
- タンパク質: ${todayNutrition.protein}g (目標: ${goals.protein}g)
- 炭水化物: ${todayNutrition.carbs}g (目標: ${goals.carbs}g)
- 脂質: ${todayNutrition.fat}g (目標: ${goals.fat}g)

完了したタスク: ${todayTasks.filter(t => t.completed).length}/${todayTasks.length}

以下について簡潔にアドバイスしてください：
1. 栄養バランスの改善点
2. 残りの食事で気をつけるべきこと
3. モチベーション維持のための一言
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 1,
          topP: 0.9,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting daily advice:', error);
    throw error;
  }
};

// Helper functions
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const parseNutritionResponse = (responseText: string): FoodAnalysis => {
  // Extract numbers from the response text
  const caloriesMatch = responseText.match(/(\d+)\s*kcal/i);
  const proteinMatch = responseText.match(/タンパク質[：:]\s*(\d+\.?\d*)\s*g/i);
  const carbsMatch = responseText.match(/炭水化物[：:]\s*(\d+\.?\d*)\s*g/i);
  const fatMatch = responseText.match(/脂質[：:]\s*(\d+\.?\d*)\s*g/i);
  
  // Extract food items
  const foodItemsMatch = responseText.match(/食品[：:]\s*(.+?)(?=\n|$)/i);
  const foodItems = foodItemsMatch 
    ? foodItemsMatch[1].split(/[、,]/).map(item => item.trim())
    : [];

  // Extract suggestions
  const suggestionsMatch = responseText.match(/アドバイス[：:]\s*(.+?)$/is);
  const suggestions = suggestionsMatch 
    ? [suggestionsMatch[1].trim()]
    : ['栄養バランスを考慮した食事を心がけましょう'];

  return {
    estimatedCalories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
    estimatedProtein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
    estimatedCarbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
    estimatedFat: fatMatch ? parseFloat(fatMatch[1]) : 0,
    foodItems,
    confidence: 0.8, // Fixed confidence for now
    suggestions
  };
};

const parseFitnessPlanResponse = (responseText: string): any => {
  // This is a simplified parser. In a real app, you'd want more robust parsing
  return {
    rawPlan: responseText,
    // Additional parsing logic would go here to extract structured data
  };
};