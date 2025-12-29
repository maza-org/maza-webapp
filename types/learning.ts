export interface Content {
  id: number;
  title: string;
  format: string;
  youtubeID: string;
  url: string;
  description: string | null;
}

export interface QuestionOption {
  id: number;
  description: string;
  comment: string | null;
  is_correct: boolean;
}

export interface Question {
  id: number;
  description: string;
  format: string;
  options: QuestionOption[];
}

export interface Quiz {
  id: number;
  pass_grade: number;
  questions: Question[];
}

export interface Module {
  id: number;
  title: string;
  quiz: any;
  description: string;
  contents: Content[];
}

export interface CourseDetail {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  subjects: { id: number; documentId: string; name: string }[];
  final_test: Quiz;
  modules: Module[];
  isFavorite?: boolean;
  cover: { formats?: { thumbnail?: { url: string } } };
  description?: string;
  level?: 'Básico' | 'Intermédio' | 'Avançado';
}

export interface CertificateSummary {
  createdAt: string;
  id: number;
  documentId: string;
  course: {
    id: number;
    documentId: string;
    title: string;
    author: string;
    rating_avg: number;
    subscribed: number;
  };
  user: {
    id: number;
    documentId: string;
    email: string;
    phone: string;
  };
}

export interface AuthUser {
  id: string;
  documentId: string;
  email: string;
  fullname: string;
  phone: string;
  yoma_id: string;
  token: string;
}

export interface ForumUser {
  id: number;
  documentId: string;
  name: string;
  surname: string;
  fullname: string;
  email: string;
  gender: string;
  profile_image: string | null;
}

export interface ForumComment {
  id: number;
  uuid: string;
  comment: string;
  date: string;
  replies: ForumComment[];
  user: ForumUser;
}

export interface ReviewUser {
  id: number;
  documentId: string;
  fullname: string;
  profile_image: string | null;
}

export interface Review {
  id: number;
  documentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser | null;
}

export type ContentState = 'NotStarted' | 'InProgress' | 'Finished';

export interface UserCourseContent {
  id: number;
  contentId: number;
  format: string;
  date: string | null;
  state: ContentState;
  title: string;
  url: string;
  youtubeID: string | null;
  description: string;
}

export interface UserCourseModule {
  id: number;
  moduleId: number;
  progress: number;
  title: string;
  quiz: any;
  contents: UserCourseContent[];
  picture: string | null;
}

export interface UserCourseQuizDuration {
  id: number;
  type: string;
  value: number;
}

export interface UserCourseQuizQuestion {
  id: number;
  description: string;
  format: 'SingleOption' | 'AllThatApply';
  options: QuestionOption[];
}

export interface UserCourseQuiz {
  id: number;
  quizId: number;
  pass_grade: number;
  state: ContentState;
  date: string | null;
  grade: number | null;
  questions: UserCourseQuizQuestion[];
  duration: UserCourseQuizDuration;
}

export interface UserCourseDetails {
  id: number;
  documentId: string;
  is_favorite: boolean;
  progress: number;
  state: 'NotStarted' | 'InProgress' | 'Completed';
  certificate: any;
  quiz: UserCourseQuiz | null;
  modules: UserCourseModule[];
  userCourseId: string;
}
