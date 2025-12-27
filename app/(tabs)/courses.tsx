import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteCoursesGrid from '@/components/FavoriteCoursesGrid';
import CoursesInProgress from '@/components/CourseInProgress';
import useUser from '@/hooks/useUser';
import {
  LoginPrompt,
  CompletedCourses,
  CoursesHeader,
  CoursesTabs,
  FilterOptions,
  CourseTabType,
} from '@/app/components/courses';
export default function Courses() {
  const { data: user } = useUser();
  const [selectedFilter, setSelectedFilter] = useState<CourseTabType>('inProgress');

  if (!user?.token) {
    return <LoginPrompt />;
  }

  const handleFilterApply = (filters: FilterOptions) => {};

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CoursesHeader />
      <CoursesTabs selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
      {selectedFilter === 'favorites' && <FavoriteCoursesGrid />}
      {selectedFilter === 'completed' && <CompletedCourses />}
      {selectedFilter === 'inProgress' && <CoursesInProgress />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#29292E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterIcon: {
    marginRight: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
