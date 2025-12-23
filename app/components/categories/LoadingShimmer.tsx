import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Shimmer from '@/components/Shimmer';

interface LoadingShimmerProps {
  itemCount?: number;
}

export default function LoadingShimmer({ itemCount = 5 }: LoadingShimmerProps) {
  const renderShimmerItem = () => (
    <View style={styles.courseCard}>
      {/* Thumbnail shimmer */}
      <View style={styles.thumbnailContainer}>
        <Shimmer>
          <View style={styles.thumbnail} />
        </Shimmer>
      </View>

      {/* Content shimmer */}
      <View style={styles.courseInfo}>
        <Shimmer style={styles.shimmerMargin}>
          <View style={styles.titleShimmer} />
        </Shimmer>

        <View style={styles.detailsContainer}>
          <Shimmer>
            <View style={styles.descriptionShimmer} />
          </Shimmer>
          <Shimmer>
            <View style={[styles.descriptionShimmer, styles.narrowShimmer]} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
        <Text style={styles.loadingText}>Carregando os cursos...</Text>
      </View>

      <FlatList
        data={Array.from({ length: itemCount }, (_, index) => ({ id: index }))}
        keyExtractor={(item) => `shimmer-${item.id}`}
        renderItem={renderShimmerItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 25,
    marginBottom: 24,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  courseCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 100,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#29292E',
  },
  courseInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  shimmerMargin: {
    marginBottom: 8,
  },
  titleShimmer: {
    height: 20,
    backgroundColor: '#29292E',
    borderRadius: 4,
    width: '80%',
  },
  detailsContainer: {
    gap: 8,
  },
  descriptionShimmer: {
    height: 16,
    backgroundColor: '#29292E',
    borderRadius: 4,
    width: '60%',
  },
  narrowShimmer: {
    width: '40%',
  },
});
