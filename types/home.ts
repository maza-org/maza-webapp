import { Course } from './course';

export interface UserCourse {
  id: number;
  course: Course | null;
  progress: number;
  status: 'InProgress' | 'Completed' | 'NotStarted';
  updatedAt: string;
  createdAt: string;
}
export interface Subject {
  id: number;
  documentId: string;
  name: string;
}

export interface CourseSection {
  title: string;
  courses: Course[];
  loading: boolean;
  onViewAll: () => void;
  onCoursePress: (course: Course) => void;
}
