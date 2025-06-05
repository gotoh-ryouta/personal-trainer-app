// AIトレーナーの文脈理解サービス

interface ConversationContext {
  previousMessages: Array<{
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>;
  currentTopic?: string;
  userGoal?: string;
  lastAction?: string;
}

export class AIContextService {
  private context: ConversationContext = {
    previousMessages: [],
  };

  // 会話履歴を追加
  addMessage(role: 'user' | 'ai', content: string) {
    this.context.previousMessages.push({
      role,
      content,
      timestamp: new Date()
    });
    
    // 最新20件のみ保持
    if (this.context.previousMessages.length > 20) {
      this.context.previousMessages = this.context.previousMessages.slice(-20);
    }
  }

  // 文脈を解析して適切な応答を生成
  analyzeContext(userMessage: string): {
    intent: string;
    topic: string;
    needsClarification: boolean;
    suggestedResponse?: string;
  } {
    const lowerMessage = userMessage.toLowerCase();
    
    // 直前のAIメッセージを確認
    const lastAIMessage = this.context.previousMessages
      .filter(m => m.role === 'ai')
      .slice(-1)[0];
    
    // プラン調整の文脈を理解
    if (lastAIMessage?.content.includes('パーソナルプラン') && 
        (lowerMessage.includes('調整') || lowerMessage.includes('変更'))) {
      return {
        intent: 'modify_plan',
        topic: 'daily_plan',
        needsClarification: true,
        suggestedResponse: '了解しました！プランのどの部分を調整しますか？\n\n• 食事内容\n• 運動メニュー\n• カロリー目標\n• タイミング\n\n具体的に教えてください。'
      };
    }

    // 有酸素運動に関する文脈
    if (lastAIMessage?.content.includes('有酸素運動') && 
        (lowerMessage.includes('できない') || lowerMessage.includes('無理'))) {
      return {
        intent: 'modify_exercise',
        topic: 'cardio',
        needsClarification: false,
        suggestedResponse: '有酸素運動を外して調整しますね！\n\n代わりに以下のオプションはいかがでしょう：\n• ストレッチ 15分\n• 軽い筋トレ追加（腹筋など）\n• 早歩きでの移動を意識\n\nどれか選んでいただければ、詳しいメニューを提案します。'
      };
    }

    // フラストレーション検出
    if (lowerMessage === 'おい' || lowerMessage === 'は？' || lowerMessage.includes('バカ')) {
      return {
        intent: 'frustration',
        topic: 'communication',
        needsClarification: false,
        suggestedResponse: 'すみません、うまく理解できていませんでした。\n\nもう一度整理させてください。何についてサポートが必要ですか？'
      };
    }

    // 体調関連
    if (lowerMessage.includes('体調') || lowerMessage.includes('疲れ') || 
        lowerMessage.includes('だるい') || lowerMessage.includes('風邪')) {
      return {
        intent: 'health_concern',
        topic: 'condition',
        needsClarification: false,
        suggestedResponse: '体調がすぐれないようですね。無理は禁物です。\n\n今日は：\n• 十分な休養を\n• 水分補給をこまめに\n• 軽い食事で胃腸を休める\n\n回復を優先しましょう。明日以降のプランは体調次第で調整します。'
      };
    }

    // 質問・相談
    if (lowerMessage.includes('？') || lowerMessage.includes('どう') || 
        lowerMessage.includes('教えて')) {
      return {
        intent: 'question',
        topic: 'general',
        needsClarification: true
      };
    }

    // デフォルト
    return {
      intent: 'unknown',
      topic: 'general',
      needsClarification: true
    };
  }

  // 現在の文脈を取得
  getContext(): ConversationContext {
    return this.context;
  }

  // 文脈をリセット
  resetContext() {
    this.context = {
      previousMessages: []
    };
  }
}