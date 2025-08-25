import { Course } from './course';

export interface UserCourse {
  id: number;
  course: Course;
  progress: number;
  status: 'InProgress' | 'Completed' | 'NotStarted';
  updatedAt: string;
  createdAt: string;
}

export interface HomePageData {
  subjects: Subject[];
  popularCourses: Course[];
  newCourses: Course[];
  suggestedCourses: Course[];
  userCourses: UserCourse[];
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

export interface UserCoursesSection {
  userCourses: UserCourse[];
  loading: boolean;
  onCoursePress: (course: Course) => void;
  onViewAll: () => void;
}
