import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Platform } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCompletedCourses } from '@/app/hooks/useCoursesQueries';
import { router } from 'expo-router';

interface CompletedCoursesProps {
  onRetry?: () => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CourseCard = ({ courseData }: { courseData: any }) => {
  const { course } = courseData;
  const imageUrl = course?.picture?.formats?.thumbnail?.url;
  const completionDate = courseData.updatedAt ? formatDate(courseData.updatedAt) : 'Recentemente';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        router.push({ pathname: '/room/lessons', params: { documentId: course.documentId } });
      }}
      style={styles.cardContainer}
    >
      <View style={styles.cardMain}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.courseImage} />
          <View style={styles.checkBadge}>
            <MaterialCommunityIcons name="check-decagram" size={20} color="#2EA8FF" />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.authorText}>{course.author}</Text>
            <Text style={styles.titleText} numberOfLines={2}>
              {course.title}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color="#8F8F8F" />
              <Text style={styles.statText}>{course.duration || '2h 15m'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FBA94C" />
              <Text style={[styles.statText, { color: '#FBA94C' }]}>
                {course.rating_avg?.toFixed(1) || '5.0'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Text style={styles.completedLabel}>Concluído em</Text>
          <Text style={styles.dateText}>{completionDate}</Text>
        </View>

        <TouchableOpacity style={styles.certificateBtn}>
          <Text style={styles.certificateText}>Ver Certificado</Text>
          <MaterialCommunityIcons name="certificate-outline" size={16} color="#0B1727" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function CompletedCourses({ onRetry }: CompletedCoursesProps) {
  const { data: courses = [], isLoading, error, refetch } = useCompletedCourses();

  const handleRetry = () => {
    onRetry?.();
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color="#FF4444" />
        <Text style={styles.errorText}>Erro ao obter cursos terminados</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="award" size={48} color="#8F8F8F" />
        <Text style={styles.emptyText}>Nenhum curso concluído</Text>
        <Text style={styles.emptySubtext}>Seus certificados aparecerão aqui</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {courses.map((courseData) => (
        <CourseCard key={courseData?.id} courseData={courseData} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
  },
  cardContainer: {
    backgroundColor: '#202024',
    borderRadius: 16,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
    gap: 14,
  },
  imageWrapper: {
    position: 'relative',
  },
  courseImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#29292E',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  authorText: {
    color: '#2EA8FF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  titleText: {
    color: '#E1E1E6',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#8F8F8F',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#323238',
    marginHorizontal: 8,
  },
  cardFooter: {
    backgroundColor: '#1c1c1f',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#29292E',
  },
  dateContainer: {
    gap: 2,
  },
  completedLabel: {
    color: '#8F8F8F',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dateText: {
    color: '#E1E1E6',
    fontSize: 12,
    fontWeight: '600',
  },
  certificateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2EA8FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  certificateText: {
    color: '#0B1727',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#E1E1E6',
    fontSize: 16,
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#29292E',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#E1E1E6',
  },
  emptyText: {
    color: '#E1E1E6',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#8F8F8F',
    marginTop: 8,
  },
});
