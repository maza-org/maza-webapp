import { router } from 'expo-router';
import { Course } from '@/types/course';

export function navigateToCourse(course: Course) {
  router.push({
    pathname: '/room/lessons',
    params: {
      documentId: course.documentId,
    },
  });
}

export function navigateToCategories(type: string, name: string, id: number) {
  router.push({
    pathname: '/categories/[id]',
    params: {
      type,
      name,
      id,
    },
  });
}

export function navigateToSearch() {
  router.push('/search');
}

export function navigateToCourses() {
  router.push('/(tabs)/courses');
}

export function navigateToCustomize() {
  router.push('/start/customize');
}
