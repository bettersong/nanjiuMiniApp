export interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
  time?: string;
  status: number // 0: 发送中 1: 思考中 2: 回答中 3: 回答完成
}
