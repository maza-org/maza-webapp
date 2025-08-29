export interface Option {
  id: number;
  description: string;
  comment: string | null;
  is_correct: boolean;
}

export interface Question {
  id: number;
  description: string;
  format: 'SingleOption' | 'AllThatApply';
  options: Option[];
}

export interface Duration {
  id: number;
  type: 'hours' | 'minutes' | 'seconds';
  value: number;
}

export interface QuizModule {
  id: number;
  pass_grade: number;
  questions: Question[];
  duration: Duration;
}

export interface SelectedAnswersMap {
  [key: number]: number | number[];
}
