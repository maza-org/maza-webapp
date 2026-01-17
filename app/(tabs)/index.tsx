import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUser from '@/hooks/useUser';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import HomepageCategories from '@/components/HomepageCategories';
import HomeHeader from '@/components/HomeHeader';
import SearchBar from '@/components/SearchBar';
import ContinueCourseCard from '@/components/ContinueCourseCard';
import UserCoursesSection from '@/components/UserCoursesSection';
import CourseSection from '@/components/CourseSection';
import CreateAccountSection from '@/components/CreateAccountSection';
import ExploreOpportunitiesSection from '@/components/ExploreOpportunitiesSection';
import { usePopularCourses, useNewCourses, useSuggestedCourses, useUserCourses } from '@/services/home';
import { navigateToCourse, navigateToCategories, navigateToSearch, navigateToCourses } from '@/util/navigation';
import { router } from 'expo-router';
import { Subject } from '@/app/types/profile';
import { useDeleteInterest } from '@/app/hooks/useProfileQueries';
import InterestsSection from '@/app/components/profile/InterestsSection';
import Button from '@/components/Button';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { data: user } = useUser();
  const { data: popularCourses = [], isLoading: loadingPopularCourses } = usePopularCourses();
  const { data: newCourses = [], isLoading: loadingNewCourses } = useNewCourses();
  const { data: suggestedCourses = [], isLoading: loadingSuggestedCourses } = useSuggestedCourses(user?.token);
  const { data: userCourses = [], isLoading: loadingUserCourses } = useUserCourses(user?.token || '');

  const [isEditing, setIsEditing] = useState(false);
  const [deletingInterestId, setDeletingInterestId] = useState<number | null>(null);
  const deleteInterestMutation = useDeleteInterest();

  const handleCoursePress = (course: any) => {
    navigateToCourse(course);
  };

  const handlePopularCoursesViewAll = () => {
    navigateToCategories('popular', 'Cursos Populares', 0);
  };

  const handleNewCoursesViewAll = () => {
    navigateToCategories('new', 'Cursos Recentes', 0);
  };

  const handleSuggestedCoursesViewAll = () => {
    navigateToCategories('suggested', 'Cursos Recomendados', 0);
  };

  const handleUserCoursesViewAll = () => {
    navigateToCourses();
  };

  const handleSearchPress = () => {
    navigateToSearch();
  };

  const handleHeaderPress = () => {
    // router.push('//missions/');
  };

  const handleCustomizeSurvey = () => {
    router.push({
      pathname: '/onboarding/survey',
      params: { fromProfile: 'true' },
    });
  };

  const handleAddInterest = () => {
    router.push({
      pathname: '/start/customize',
      params: {
        interests: user?.interests ? JSON.stringify(user?.interests) : undefined,
      },
    });
  };

  const handleDeleteInterest = async (subject: Subject) => {
    Alert.alert('Confirmar', 'Tem certeza que deseja remover este interesse?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setDeletingInterestId(subject.id);
          try {
            await deleteInterestMutation.mutateAsync(subject);
          } finally {
            setDeletingInterestId(null);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HomeHeader onPress={handleHeaderPress} />

        {/* Search Bar */}
        <SearchBar onPress={handleSearchPress} />

        {/* Category Icons */}
        <HomepageCategories />

        {/* Create Account Section - Only shown when user is not authenticated */}
        {!user?.token && <CreateAccountSection />}

        {/* Continue Course Section */}
        {user?.token && !loadingUserCourses && userCourses.length > 0 && (
          <View style={styles.courseSection}>
            <ContinueCourseCard userCourse={userCourses[0]} onPress={handleCoursePress} />
          </View>
        )}

        {/* Courses in Progress */}
        {user?.token && userCourses.length > 1 && (
          <UserCoursesSection
            userCourses={userCourses.slice(1)}
            loading={loadingUserCourses}
            onCoursePress={handleCoursePress}
            onViewAll={handleUserCoursesViewAll}
          />
        )}

        {/* Suggested Courses Section */}
        {user?.token && suggestedCourses && suggestedCourses.length > 0 && (
          <CourseSection
            title="Cursos Recomendados"
            courses={suggestedCourses}
            loading={loadingSuggestedCourses}
            onViewAll={handleSuggestedCoursesViewAll}
            onCoursePress={handleCoursePress}
            badge={{ type: 'recommended', icon: 'thumbs-up' }}
          />
        )}

        {/* New Courses Section */}
        <CourseSection
          title="Cursos recentes"
          courses={newCourses}
          loading={loadingNewCourses}
          onViewAll={handleNewCoursesViewAll}
          onCoursePress={handleCoursePress}
          badge={{ type: 'new', icon: 'clock' }}
        />

        {/* Popular Courses */}
        <CourseSection
          title="Cursos populares"
          courses={popularCourses}
          loading={loadingPopularCourses}
          onViewAll={handlePopularCoursesViewAll}
          onCoursePress={handleCoursePress}
        />

        {/* Explore Opportunities Section */}
        <ExploreOpportunitiesSection />

        {/* Interests Teaser Section */}
        {user?.token && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Seus Interesses</Text>
            </View>

            <View style={styles.tagsContainer}>
              {user.interests && user.interests.length > 0 ? (
                <>
                  <>
                    {user.interests.slice(0, 6).map((subject: Subject) => (
                      <View
                        key={subject.id}
                        style={[
                          styles.interestTag,
                          {
                            backgroundColor: theme === 'dark' ? 'rgba(31, 162, 223, 0.1)' : '#F0F9FF',
                            borderColor: theme === 'dark' ? 'rgba(31, 162, 223, 0.2)' : '#E0F2FE',
                          },
                        ]}
                      >
                        <Text
                          style={[styles.interestTagText, { color: colors.primary }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {subject.name}
                        </Text>
                      </View>
                    ))}
                    {user.interests.length > 6 && (
                      <View
                        style={[
                          styles.moreTag,
                          { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F5F5F7' },
                        ]}
                      >
                        <Text style={[styles.moreTagText, { color: colors.textMuted }]}>
                          +{user.interests.length - 6}
                        </Text>
                      </View>
                    )}
                  </>
                </>
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>
                  Adicione interesses para melhorar seu feed.
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.bottomLinkButton} onPress={handleAddInterest}>
              <Text style={styles.bottomLinkText}>Personalizar Interesses</Text>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Customize Experience / Assessment Row */}
        {user?.token && (
          <View style={styles.sectionContainer}>
            <View
              style={[styles.assessmentCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            >
              <View style={styles.assessmentContent}>
                <View style={styles.assessmentHeader}>
                  <Text style={[styles.assessmentTitle, { color: colors.text }]}>Personalizar Experiência</Text>
                </View>

                <Text style={[styles.assessmentSubtitle, { color: colors.textMuted }]}>
                  Descubra o que combina com você. Responda perguntas rápidas para melhorar suas recomendações.
                </Text>

                <View style={styles.assessmentButtonContainer}>
                  <Button
                    text="Começar Agora"
                    handle={handleCustomizeSurvey}
                    variant="primary"
                    style={{ marginBottom: 0 }} // Override default margin
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Platform.OS === 'web' ? 0 : 25,
    paddingEnd: 25,
    paddingStart: 25,
  },
  scrollContainer: {
    ...(Platform.OS === 'web' ? { paddingHorizontal: 25, paddingVertical: 25 } : undefined),
  },
  courseSection: {
    marginVertical: 10,
  },
  sectionContainer: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  iconButton: {
    padding: 4,
  },
  bottomLinkButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  bottomLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22ACE3',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  interestTag: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 50,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  moreTag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    justifyContent: 'center',
  },
  moreTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assessmentCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  assessmentContent: {
    width: '100%',
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  assessmentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'ManropeBold',
  },
  assessmentSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'ManropeRegular',
    marginBottom: 20,
  },
  assessmentButtonContainer: {
    width: '100%',
  },
});
