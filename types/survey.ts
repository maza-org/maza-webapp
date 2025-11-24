// Survey Question Types
export interface SurveyAnswerOption {
  id: number;
  documentId: string;
  answer: string;
}

export interface SurveyQuestion {
  id: number;
  documentId: string;
  question: string;
  survey_answer_options: SurveyAnswerOption[];
}

export interface SurveyQuestionsResponse {
  data: SurveyQuestion[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Survey Submission Types
export interface SurveyAnswer {
  question: string; // documentId of the question
  answer: string; // documentId of the answer
}

export interface SurveySubmissionRequest {
  data: SurveyAnswer[];
}

export interface SurveySubmissionResponse {
  success: boolean;
  message?: string;
}

export interface SurveyErrorResponse {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, any>;
  };
}
