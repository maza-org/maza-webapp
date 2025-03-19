import { Course } from '@/app/(tabs)/profile';

export interface User {
  id: string;
  documentId: string;
  email: string;
  fullname: string;
  phone: string;
  yomaId: string;
  token: string;
  interests: Subject[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    documentId: string;
    email: string | null;
    fullname: string;
    phone: string;
    yoma_id: string | null;
  };
  jwt: string;
  interests: Subject[];
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
  course: Course;
}

export function mapLoginResponseToUser(response: LoginResponse): User {
  return {
    id: response.user.id.toString(),
    documentId: response.user.documentId,
    email: response.user.email || '',
    fullname: response.user.fullname,
    phone: response.user.phone,
    yomaId: response.user.yoma_id || '',
    token: response.jwt,
    interests: response.interests,
  };
}
