import { Course } from '@/app/(tabs)/profile';
import { Picture } from '@/types/course';

export interface User {
  id: string;
  documentId: string;
  email: string;
  fullname: string;
  phone: string;
  yomaId: string;
  token: string;
  interests: Subject[];
  profile_image: Picture;
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
