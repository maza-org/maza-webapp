import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReviewUser {
  id: number;
  documentId: string;
  fullname: string;
  profile_image: string | null;
}

interface Review {
  id: number;
  documentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
}

interface ReviewsResponse {
  data: Review[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface ReviewsProps {
  courseId: string;
}

const NoReviews = () => (
  <View style={styles.noReviewsContainer}>
    <Text style={styles.noReviewsTitle}>Seja o primeiro a avaliar!</Text>
    <Text style={styles.noReviewsSubtitle}>
      Sua opinião é muito importante para melhorarmos nosso conteúdo.
    </Text>
    <TouchableOpacity style={styles.rateButton}>
      <Text style={styles.rateButtonText}>Avaliar Curso</Text>
    </TouchableOpacity>
  </View>
);

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.starsContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name="star"
        size={20}
        color={star <= rating ? "#FFB800" : "#A8A8B3"}
        style={styles.starIcon}
      />
    ))}
  </View>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {review.user.fullname.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.reviewUserInfo}>
        <Text style={styles.userName}>{review.user.fullname}</Text>
        <StarRating rating={review.rating} />
      </View>
    </View>
    <Text style={styles.reviewComment}>{review.comment}</Text>
    <Text style={styles.reviewDate}>
      {new Date(review.createdAt).toLocaleDateString()}
    </Text>
  </View>
);

export default function Reviews({ courseId }: ReviewsProps) {
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:1337/api/reviews?course=${courseId}`,
      );
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1fa2df" />
      </View>
    );
  }

  if (!reviews?.data || reviews.data.length === 0) {
    return <NoReviews />;
  }

  const averageRating =
    reviews.data.reduce((acc, review) => acc + review.rating, 0) /
    reviews.data.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ratingOverview}>
        <View style={styles.overallRating}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <StarRating rating={Math.round(averageRating)} />
          <Text style={styles.totalReviews}>
            {reviews.meta.pagination.total} avaliações
          </Text>
        </View>
      </View>

      <View style={styles.reviewsList}>
        {reviews.data.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noReviewsContainer: {
    padding: 24,
    alignItems: "center",
  },
  noReviewsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  noReviewsSubtitle: {
    fontSize: 14,
    color: "#A8A8B3",
    textAlign: "center",
    marginBottom: 24,
  },
  rateButton: {
    backgroundColor: "#1fa2df",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  ratingOverview: {
    padding: 24,
    alignItems: "center",
  },
  overallRating: {
    alignItems: "center",
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  totalReviews: {
    fontSize: 14,
    color: "#A8A8B3",
  },
  reviewsList: {
    padding: 24,
  },
  reviewCard: {
    backgroundColor: "#202024",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#323238",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  reviewUserInfo: {
    flex: 1,
  },
  userName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  reviewComment: {
    color: "#A8A8B3",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    color: "#7C7C8A",
    fontSize: 12,
  },
});
