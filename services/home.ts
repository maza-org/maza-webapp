import { useQuery } from '@tanstack/react-query';
import api from './api';
import { Course } from '@/types/course';
import { UserCourse, Subject } from '@/types/home';

// Get all subjects from courses
export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async (): Promise<Subject[]> => {
      const response = await api.get('/courses');
      const data = response.data;

      const allSubjects: Subject[] = data.data.flatMap((course: Course) => course.subjects);
      const uniqueSubjects = Array.from(new Map(allSubjects.map((subject: Subject) => [subject.id, subject])).values());

      return uniqueSubjects.slice(0, 3);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get popular courses
export function usePopularCourses() {
  return useQuery({
    queryKey: ['courses', 'popular'],
    queryFn: async (): Promise<Course[]> => {
      const response = await api.get('/courses?sort=subscribed%3Adesc&pageSize=15&page=1');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Get new courses
export function useNewCourses() {
  return useQuery({
    queryKey: ['courses', 'new'],
    queryFn: async (): Promise<Course[]> => {
      const response = await api.get('/courses?sort=publishedAt%3Adesc&pageSize=10&page=1');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Get suggested courses
export function useSuggestedCourses() {
  return useQuery({
    queryKey: ['courses', 'suggested'],
    queryFn: async (): Promise<Course[]> => {
      const response = await api.get('/courses?sort=rating_avg%3Adesc&pageSize=10&page=1');
      const data = response.data.data;

      // Filter courses with high rating
      const filtered = data.filter((course: Course) => course.rating_avg >= 4);

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Get user courses in progress
export function useUserCourses(token: string) {
  return useQuery({
    queryKey: ['user-courses', 'in-progress'],
    queryFn: async (): Promise<UserCourse[]> => {
      const response = await api.get('/user-courses?status=InProgress', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.data;
      // Sort by updatedAt in descending order
      const sortedCourses: UserCourse[] = [...data].sort((a: UserCourse, b: UserCourse) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });

      return sortedCourses;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
