export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface SelfAssessmentRequest {
  messages: ChatMessage[];
}

export interface SelfAssessmentResponse {
  reply: ChatMessage;
  surveyDone: boolean;
}
