import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCourseReviews, useSubmitReview } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { Review } from '@/types/learning';
import LoginBottomSheet from './LoginBottomSheet';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ReviewsProps {
  courseId: string;
  onReviewSubmitted?: () => void;
}

const formatReviewDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const isToday =
    date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

  if (isToday) {
    if (diffInSeconds < 60) return 'Agora';
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `Há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Há ${hours} h`;
  }

  return date.toLocaleDateString();
};

const StarRating = ({
  rating,
  size = 16,
  onRatingChange,
  interactive = false,
}: {
  rating: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && onRatingChange?.(star)}
          disabled={!interactive}
          style={styles.starButton}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FFD700' : colors.textMuted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewItem = ({ review }: { review: Review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongComment = review.comment.length > 200;
  const displayedComment = isExpanded || !isLongComment ? review.comment : `${review.comment.substring(0, 200)}...`;
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const userName = review.user?.fullname || 'Utilizador anónimo';
  const userInitial = userName.charAt(0).toUpperCase();

  const styles = useMemo(() => StyleSheet.create({
    reviewCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.inputBackground : 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    reviewUserInfo: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    ratingDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 8,
    },
    reviewDate: {
      color: colors.textMuted,
      fontSize: 12,
    },
    reviewText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
    },
    viewMoreButton: {
      marginTop: 8,
      alignSelf: 'flex-end',
    },
    viewMoreText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  }), [colors]);


  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatarContainer}>
          {review.user?.profile_image ? (
            <Image source={{ uri: review.user.profile_image }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Text style={styles.avatarText}>{userInitial}</Text>
          )}
        </View>
        <View style={styles.reviewUserInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.ratingDateRow}>
            <StarRating rating={review.rating} size={14} />
            <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.reviewText}>{displayedComment}</Text>
      {isLongComment && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>{isExpanded ? 'Ver menos' : 'Ver mais'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const RatingSummary = ({ reviews }: { reviews: Review[] }) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = useMemo(() => StyleSheet.create({
    summaryContainer: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginTop: 16,
      marginBottom: 16,
    },
    summaryLeft: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 16,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    averageRating: {
      color: colors.text,
      fontSize: 36,
      fontWeight: '700',
      marginBottom: 4,
    },
    totalReviews: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
    summaryRight: {
      flex: 1,
      paddingLeft: 16,
      justifyContent: 'center',
    },
    ratingBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 2,
    },
    ratingBarLabel: {
      color: colors.textMuted,
      fontSize: 12,
      width: 12,
      marginRight: 4,
    },
    ratingBarTrack: {
      flex: 1,
      height: 6,
      backgroundColor: colors.inputBackground,
      borderRadius: 3,
      marginHorizontal: 8,
      overflow: 'hidden',
    },
    ratingBarFill: {
      height: '100%',
      backgroundColor: '#FFD700',
      borderRadius: 3,
    },
    ratingBarCount: {
      color: colors.textMuted,
      fontSize: 12,
      width: 24,
      textAlign: 'right',
    },
  }), [colors]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating - 1]++;
      }
    });
    return counts;
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryLeft}>
        <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
        <StarRating rating={Math.round(averageRating)} size={20} />
        <Text style={styles.totalReviews}>{reviews.length} {reviews.length === 1 ? 'opinião' : 'opiniões'}</Text>
      </View>
      <View style={styles.summaryRight}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingCounts[star - 1];
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <View key={star} style={styles.ratingBar}>
              <Text style={styles.ratingBarLabel}>{star}</Text>
              <Ionicons name="star" size={12} color="#FFD700" />
              <View style={styles.ratingBarTrack}>
                <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.ratingBarCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const Reviews = ({ courseId, onReviewSubmitted }: ReviewsProps) => {
  const { data: user } = useAuthUser();
  const token = user?.token || '';
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { data: reviews = [], isLoading, error, refetch } = useCourseReviews(courseId);
  const submitReviewMutation = useSubmitReview();

  const [loginSheetVisible, setLoginSheetVisible] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    errorText: {
      color: colors.textMuted,
      fontSize: 16,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
    },
    retryButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
    addReviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginBottom: 16,
      gap: 8,
    },
    addReviewButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '500',
    },
    loginPromptButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginBottom: 16,
      gap: 8,
    },
    loginPromptButtonText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    reviewForm: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginBottom: 16,
    },
    reviewFormTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    ratingSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    ratingSelectorLabel: {
      color: colors.textMuted,
      fontSize: 14,
      marginRight: 12,
    },
    ratingText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 16,
      textAlign: 'center',
    },
    reviewInput: {
      backgroundColor: isDark ? colors.inputBackground : 'rgba(0,0,0,0.1)',
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 14,
      minHeight: 100,
      marginBottom: 16,
    },
    reviewFormButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      paddingVertical: 12,
      borderRadius: 50,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    submitButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    submitButtonDisabled: {
      backgroundColor: colors.inputBackground,
      opacity: 0.5,
    },
    submitButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
    formErrorText: {
      color: '#FF4B4B',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 12,
    },
    sortContainer: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reviewsCountText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sortText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    listContent: {
      padding: 24,
      paddingTop: 0,
      paddingBottom: 100,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 32,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
    },
  }), [colors]);

  const handleSubmitReview = async () => {
    if (rating === 0) return;

    try {
      await submitReviewMutation.mutateAsync({
        courseId,
        rating,
        comment,
        token,
      });
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      onReviewSubmitted?.();
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    return [...reviews].sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }, [reviews, sortOrder]);

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'newest':
        return 'Mais recentes';
      case 'oldest':
        return 'Mais antigos';
      case 'highest':
        return 'Maior nota';
      case 'lowest':
        return 'Menor nota';
    }
  };

  const cycleSortOrder = () => {
    const orders: Array<'newest' | 'oldest' | 'highest' | 'lowest'> = ['newest', 'oldest', 'highest', 'lowest'];
    const currentIndex = orders.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % orders.length;
    setSortOrder(orders[nextIndex]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar opiniões.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RatingSummary reviews={reviews} />

      {token ? (
        !showReviewForm ? (
          <TouchableOpacity style={styles.addReviewButton} onPress={() => setShowReviewForm(true)}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.addReviewButtonText}>Escrever uma opinião</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormTitle}>Sua opinião</Text>
            <View style={styles.ratingSelector}>
              <Text style={styles.ratingSelectorLabel}>Sua nota:</Text>
              <StarRating rating={rating} size={32} onRatingChange={setRating} interactive />
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && 'Muito fraco'}
                {rating === 2 && 'Fraco'}
                {rating === 3 && 'Razoável'}
                {rating === 4 && 'Bom'}
                {rating === 5 && 'Excelente'}
              </Text>
            )}
            <TextInput
              style={styles.reviewInput}
              placeholder="Compartilhe sua experiência com este curso..."
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.reviewFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setComment('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (rating === 0 || submitReviewMutation.isPending) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={rating === 0 || submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
            {submitReviewMutation.isError && (
              <Text style={styles.formErrorText}>Erro ao enviar opinião. Tente novamente.</Text>
            )}
          </View>
        )
      ) : (
        <TouchableOpacity style={styles.loginPromptButton} onPress={() => setLoginSheetVisible(true)}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
          <Text style={styles.loginPromptButtonText}>Faça login para avaliar este curso</Text>
        </TouchableOpacity>
      )}

      <View style={styles.sortContainer}>
        <Text style={styles.reviewsCountText}>{reviews.length} {reviews.length === 1 ? 'Opinião' : 'Opiniões'}</Text>
        {reviews.length > 1 && (
          <TouchableOpacity style={styles.sortButton} onPress={cycleSortOrder}>
            <Ionicons name="swap-vertical" size={16} color={colors.textMuted} />
            <Text style={styles.sortText}>{getSortLabel()}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listContent}>
        {sortedReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sem opiniões ainda</Text>
            <Text style={styles.emptyText}>Seja o primeiro a avaliar este curso!</Text>
          </View>
        ) : (
          sortedReviews.map((review) => <ReviewItem key={review.id} review={review} />)
        )}
      </View>

      <LoginBottomSheet visible={loginSheetVisible} onClose={() => setLoginSheetVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 2,
  },
});

export default Reviews;
