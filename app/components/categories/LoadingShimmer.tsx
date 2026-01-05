import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Shimmer from '@/components/Shimmer';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface LoadingShimmerProps {
  itemCount?: number;
}

export default function LoadingShimmer({ itemCount = 5 }: LoadingShimmerProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 24,
        },
        loadingText: {
          color: colors.textSecondary,
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
          backgroundColor: colors.cardBackground,
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
          backgroundColor: colors.inputBackground,
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
          backgroundColor: colors.inputBackground,
          borderRadius: 4,
          width: '80%',
        },
        detailsContainer: {
          gap: 8,
        },
        descriptionShimmer: {
          height: 16,
          backgroundColor: colors.inputBackground,
          borderRadius: 4,
          width: '60%',
        },
        narrowShimmer: {
          width: '40%',
        },
      }),
    [colors]
  );

  const renderShimmerItem = () => (
    <View style={themedStyles.courseCard}>
      {/* Thumbnail shimmer */}
      <View style={themedStyles.thumbnailContainer}>
        <Shimmer style={{}}>
          <View style={themedStyles.thumbnail} />
        </Shimmer>
      </View>

      {/* Content shimmer */}
      <View style={themedStyles.courseInfo}>
        <Shimmer style={themedStyles.shimmerMargin}>
          <View style={themedStyles.titleShimmer} />
        </Shimmer>

        <View style={themedStyles.detailsContainer}>
          <Shimmer style={{}}>
            <View style={themedStyles.descriptionShimmer} />
          </Shimmer>
          <Shimmer style={{}}>
            <View style={[themedStyles.descriptionShimmer, themedStyles.narrowShimmer]} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={themedStyles.loadingText}>Carregando os cursos...</Text>
      </View>

      <FlatList
        data={Array.from({ length: itemCount }, (_, index) => ({ id: index }))}
        keyExtractor={(item) => `shimmer-${item.id}`}
        renderItem={renderShimmerItem}
        contentContainerStyle={themedStyles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}
