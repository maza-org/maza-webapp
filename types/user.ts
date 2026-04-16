import { Course, Picture } from '@/types/course';

export interface User {
  id: number;
  documentId: string;
  email: string;
  phone: string;
  name: string;
  surname: string;
  middlename?: string;
  fullname: string;
  username: string;
  yoma_id: string | null;
  gender?: string;
  dateOfBirth?: string;
  nationalID?: string;
  province?: string;
  district?: string;
  occupation?: string;
  academicInstitution?: string;
  academicLevel?: string;
  token?: string;
  interests: Subject[];
  profile_image: Picture | null;
  survey?: string | null;
}

export interface Subject {
  id: number;
  documentId: string;
  name: string;
}

export interface Certificate {
  id: number;
  documentId: string;
  createdAt: string;
  course: Course | null;
}

export interface Interest {
  id: number;
  documentId: string;
  name: string;
  sname: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  jwt: string;
  user: User;
}

export interface ErrorResponse {
  error?: {
    message?: string;
    details?: {
      message?: string;
    };
  };
}
