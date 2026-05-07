import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteCoursesGrid from '@/components/FavoriteCoursesGrid';
import CoursesInProgress from '@/components/CourseInProgress';
import useUser from '@/hooks/useUser';
import {
  LoginPrompt,
  CoursesHeader,
  CoursesTabs,
  CertificatesTab,
  FilterOptions,
  CourseTabType,
} from '@/app/components/courses';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function Courses() {
  const { data: user } = useUser();
  const [selectedFilter, setSelectedFilter] = useState<CourseTabType>('inProgress');
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flex: 1,
    },
  }), [colors]);

  if (!user?.token) {
    return <LoginPrompt />;
  }

  const handleFilterApply = (filters: FilterOptions) => {};

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <View style={[themedStyles.contentContainer, Platform.OS === 'web' && { alignSelf: 'center', maxWidth: 1200, width: '100%', flex: 1 }]}>
        <CoursesHeader />
        <View style={Platform.OS === 'web' ? { maxWidth: 400, width: '100%', marginBottom: 16 } : undefined}>
          <CoursesTabs selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        </View>
        {selectedFilter === 'favorites' && <FavoriteCoursesGrid />}
        {selectedFilter === 'inProgress' && <CoursesInProgress />}
        {selectedFilter === 'certificates' && <CertificatesTab />}
      </View>
    </SafeAreaView>
  );
}
