import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getMediaUrl } from '@/util/util';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
  TextInput,
  Image, // Added Image import
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Forum from '@/components/Forum';
import Reviews from '@/components/Reviews';
import { ForumComment } from '@/types/learning';
import LoginBottomSheet from '@/components/LoginBottomSheet';
import Entypo from '@expo/vector-icons/Entypo';
import { Module, Quiz, UserCourseDetails, UserCourseModule } from '@/types/learning';
import { LevelBadge } from '@/components/LevelBadge';
import { Tab } from '@/components/Tab';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import Shimmer from '@/components/Shimmer';
import CourseModuleCard, { CourseModuleData } from '@/components/CourseModuleCard';
import {
  useCourseDetails,
  useCertificates,
  useAddToFavorites,
  useRemoveFromFavorites,
  useIsFavorite,
  useStartCourse,
  useCourseProgress,
  useUserCourseDetails,
  useAddForumComment,
  useReplyToComment,
} from '@/services/catalog';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthUser } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

// Import the celebration image
const celebrateImage = require('@/assets/images/celebrate.webp');

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'opinions' | 'forum'>('lessons');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { toast, config, showSuccess, showError, showInfo, hideToast } = useToast();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        scrollView: {
          flex: 1,
        },
        header: {
          height: 200,
          backgroundColor: colors.background, // Fallback
        },
        headerOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: 24,
          justifyContent: 'space-between',
        },
        headerActions: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        rightActions: {
          flexDirection: 'row',
          gap: 16,
        },
        iconButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        iconButtonDisabled: {
          opacity: 0.6,
        },
        refreshIndicator: {
          width: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
          padding: 24,
        },
        errorText: {
          color: colors.text,
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 16,
          fontFamily: 'ManropeRegular',
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
          fontFamily: 'ManropeBold',
        },
        courseInfo: {
          padding: 24,
          backgroundColor: colors.background,
        },
        courseTitle: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 16,
          fontFamily: 'ManropeBold',
        },
        instructor: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        },
        instructorName: {
          color: colors.text,
          fontSize: 14,
          fontFamily: 'ManropeRegular',
        },
        categoryTag: {
          color: colors.primary,
          fontSize: 14,
          marginLeft: 8,
          marginRight: 8,
          fontFamily: 'ManropeRegular',
        },
        descriptionContainer: {
          marginBottom: 16,
          borderRadius: 8,
        },
        descriptionText: {
          color: colors.textSecondary,
          fontSize: 14,
          lineHeight: 22,
          fontFamily: 'ManropeRegular',
        },
        viewMoreButton: {
          marginTop: 8,
          alignSelf: 'flex-end',
        },
        viewMoreText: {
          color: colors.primary,
          fontSize: 14,
          fontWeight: '500',
          fontFamily: 'ManropeMedium',
        },
        tabContainer: {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        modulesList: {
          padding: 24,
        },
        moduleItem: {
          padding: 16,
          backgroundColor: colors.cardBackground,
          borderRadius: 15,
          marginBottom: 12,
        },
        moduleContent: {
          gap: 12,
        },
        moduleTopRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        moduleInfo: {
          flex: 1,
          flexDirection: 'row',
          gap: 12,
        },
        moduleNumber: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '500',
          fontFamily: 'ManropeMedium',
        },
        moduleTitle: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '500',
          flex: 1,
          fontFamily: 'ManropeMedium',
        },
        moduleTitleCompleted: {
          color: colors.primary,
        },
        moduleDetails: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        iconContainer: {
          backgroundColor: colors.inputBackground,
          borderRadius: 50,
          padding: 5,
        },
        moduleMetaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
        },
        videoCount: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginStart: 25,
        },
        videoCountText: {
          color: colors.textMuted,
          fontSize: 12,
          fontFamily: 'ManropeRegular',
        },
        quizGradeContainer: {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(34, 197, 94, 0.2)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        quizGradeText: {
          color: '#22C55E',
          fontSize: 12,
          fontWeight: '700',
          fontFamily: 'ManropeBold',
        },
        moduleItemCompleted: {
          borderColor: colors.primary,
          borderWidth: 1,
        },
        footer: {
          padding: 24,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
        inputContainer: {
          backgroundColor: colors.background,
        },
        replyPreview: {
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        },
        replyPreviewHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        },
        replyPreviewLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          flex: 1,
        },
        replyPreviewLabel: {
          color: colors.textMuted,
          fontSize: 12,
          fontFamily: 'ManropeRegular',
        },
        replyPreviewName: {
          color: colors.primary,
          fontWeight: '600',
          fontFamily: 'ManropeBold',
        },
        replyPreviewQuote: {
          flexDirection: 'row',
        },
        replyPreviewLine: {
          width: 3,
          backgroundColor: colors.primary,
          borderRadius: 2,
          marginRight: 10,
        },
        replyPreviewText: {
          color: colors.textMuted,
          fontSize: 13,
          flex: 1,
          fontStyle: 'italic',
          fontFamily: 'ManropeRegular',
        },
        inputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        input: {
          flex: 1,
          backgroundColor: colors.cardBackground,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          color: colors.text,
          maxHeight: 100,
        },
        inputExpanded: {
          height: 250,
          textAlignVertical: 'top',
        },
        sendButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        disabledButton: {
          backgroundColor: colors.border,
          opacity: 0.5,
        },
        startButton: {
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 50,
          alignItems: 'center',
        },
        startButtonDisabled: {
          backgroundColor: colors.primary + '80', // Opacity
        },
        startButtonText: {
          color: '#FFF',
          fontSize: 16,
          fontWeight: '600',
          fontFamily: 'ManropeBold',
        },
        progressContainer: {
          marginBottom: 16,
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          padding: 16,
        },
        progressHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        },
        progressTitle: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
          fontFamily: 'ManropeBold',
        },
        progressSubtitle: {
          color: colors.textMuted,
          fontSize: 12,
          marginTop: 2,
          fontFamily: 'ManropeRegular',
        },
        progressPercentage: {
          color: colors.primary,
          fontSize: 18,
          fontWeight: '700',
          fontFamily: 'ManropeBold',
        },
        progressBarContainer: {
          marginBottom: 8,
        },
        progressBar: {
          height: 6,
          backgroundColor: colors.border,
          borderRadius: 3,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          backgroundColor: colors.primary,
          borderRadius: 3,
        },
        completionCard: {
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        completionContent: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        },
        completionTextContainer: {
          flex: 1,
          paddingRight: 10,
        },
        completionTitle: {
          fontSize: 22,
          fontWeight: 'bold',
          color: colors.primary,
          marginBottom: 4,
          fontFamily: 'ManropeBold',
        },
        completionSubtitle: {
          fontSize: 14,
          color: colors.textSecondary,
          fontFamily: 'ManropeRegular',
        },
        celebrateImage: {
          width: 80,
          height: 80,
        },
        certificateButtonFull: {
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 50,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        },
        certificateButtonText: {
          color: '#FFF',
          fontSize: 16,
          fontWeight: '700',
          fontFamily: 'ManropeBold',
        },
        noModulesContainer: {
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.cardBackground,
          borderRadius: 15,
          marginVertical: 12,
        },
        noModulesText: {
          color: colors.textMuted,
          fontSize: 16,
          textAlign: 'center',
          fontWeight: '500',
          fontFamily: 'ManropeMedium',
        },
        noModulesIcon: {
          marginBottom: 16,
        },
        menuContainer: {
          position: 'absolute',
          right: 0,
          top: 45,
          backgroundColor: colors.cardBackground,
          borderRadius: 8,
          padding: 8,
          width: 200,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 1000,
        },
        menuItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        menuItemText: {
          color: colors.text,
          fontSize: 16,
          marginLeft: 12,
          fontFamily: 'ManropeRegular',
        },
        opinionsContainer: {
          flex: 1,
          minHeight: 400,
        },
        loadingText: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '500',
          marginTop: 16,
          fontFamily: 'ManropeMedium',
        },
        shimmerBox: {
          width: '100%',
          height: '100%',
          backgroundColor: colors.inputBackground,
          borderRadius: 4,
        },
        headerShimmer: {
          height: 200,
          backgroundColor: colors.cardBackground,
        },
        headerShimmerContent: {
          flex: 1,
          padding: 24,
          justifyContent: 'space-between',
        },
        headerActionsShimmer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        rightActionsShimmer: {
          flexDirection: 'row',
          gap: 16,
        },
        courseInfoShimmer: {
          padding: 24,
          backgroundColor: colors.background,
        },
        moduleItemShimmer: {
          padding: 16,
          backgroundColor: colors.cardBackground,
          borderRadius: 15,
          marginBottom: 12,
        },
        iconButtonShimmer: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.inputBackground,
        },
        levelBadgeShimmer: {
          width: 80,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.inputBackground,
        },
        titleShimmer: {
          height: 28,
          marginBottom: 8,
          borderRadius: 4,
        },
        titleShimmerShort: {
          height: 28,
          width: '60%',
          marginBottom: 16,
          borderRadius: 4,
        },
        instructorShimmer: {
          flexDirection: 'row',
          marginBottom: 24,
          gap: 12,
        },
        instructorNameShimmer: {
          height: 20,
          width: 120,
          borderRadius: 4,
        },
        categoryShimmer: {
          height: 20,
          width: 80,
          borderRadius: 4,
        },
        descriptionLineShimmer: {
          height: 16,
          marginBottom: 8,
          borderRadius: 4,
        },
        descriptionLineShimmerShort: {
          height: 16,
          width: '80%',
          marginBottom: 24,
          borderRadius: 4,
        },
        tabContainerShimmer: {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingBottom: 0,
        },
        tabShimmer: {
          width: '33%',
          height: 48,
        },
        modulesListShimmer: {
          padding: 24,
        },
        moduleTopRowShimmer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        moduleInfoShimmer: {
          flex: 1,
          flexDirection: 'row',
          gap: 12,
        },
        moduleNumberShimmer: {
          width: 20,
          height: 20,
          borderRadius: 4,
        },
        moduleTitleShimmer: {
          width: '70%',
          height: 20,
          borderRadius: 4,
        },
        playIconShimmer: {
          width: 24,
          height: 24,
          borderRadius: 12,
        },
        moduleMetaShimmer: {
          paddingLeft: 32,
        },
        videoCountShimmer: {
          width: 60,
          height: 16,
          borderRadius: 4,
        },
        startButtonShimmer: {
          height: 56,
          borderRadius: 50,
        },
        descriptionShimmerContainer: {
          marginBottom: 16,
          gap: 8,
        },
        continueButton: {
          backgroundColor: colors.primary,
        },
        ratingOverview: {
          marginBottom: 24,
        },
        certificateButton: {
          backgroundColor: '#22C55E',
          padding: 16,
          borderRadius: 50,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        },
        certificateButtonIcon: {
          marginRight: 8,
        },
        certificateIcon: {
          marginLeft: 4,
        },
        progressText: {
          color: colors.textMuted,
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'ManropeRegular',
        },
      }),
    [colors]
  );

  const { documentId } = useLocalSearchParams<{ documentId: string }>();

  // Token change detection and query client
  const previousTokenRef = useRef<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState('');
  const [loginSheetVisible, setLoginSheetVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ForumComment | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // React Query hooks
  const { data: user, isLoading: userLoading } = useAuthUser();
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
    refetch: refetchCourse,
  } = useCourseDetails(documentId);
  const {
    data: certificates = [],
    isLoading: certificatesLoading,
    error: certificatesError,
  } = useCertificates(user?.token);
  const { isInProgress, progress, isLoading: progressLoading } = useCourseProgress(documentId, user?.token || '');
  const { isFavorite, isLoading: favoriteLoading } = useIsFavorite(documentId, user?.token || '');
  const {
    data: userCourseDetails,
    isLoading: userCourseDetailsLoading,
    refetch: refetchUserCourseDetails,
  } = useUserCourseDetails(documentId, user?.token || '') as {
    data: UserCourseDetails | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Get modules to display - use userCourseDetails.modules when logged in for progress data
  const getDisplayModules = (): CourseModuleData[] => {
    if (userCourseDetails?.modules) {
      // User is logged in - use userCourseDetails.modules which has progress states
      return userCourseDetails.modules.map((userModule) => ({
        id: userModule.id,
        moduleId: userModule.moduleId,
        title: userModule.title,
        progress: userModule.progress,
        completedContents: userModule.contents.filter((c) => c.state === 'Finished').length,
        totalContents: userModule.contents.length,
        isCompleted: userModule.progress === 100,
        originalModule: userModule,
      }));
    }

    // User not logged in - use courseData.modules
    if (!courseData?.modules) return [];
    return courseData.modules.map((module) => ({
      id: module.id,
      moduleId: module.id,
      title: module.title,
      progress: 0,
      completedContents: 0,
      totalContents: module.contents.length,
      isCompleted: false,
      originalModule: module,
    }));
  };

  // Loading states
  const isLoading = courseLoading || userLoading || (!!user?.token && progressLoading);
  const isRefreshing = courseLoading || certificatesLoading;
  const isUserDataRefreshing =
    userLoading || (!!user?.token && (progressLoading || favoriteLoading || userCourseDetailsLoading));

  // Check for token changes and refresh data
  useEffect(() => {
    const currentToken = user?.token;
    const previousToken = previousTokenRef.current;

    if (currentToken !== previousToken) {
      // Update the ref
      previousTokenRef.current = currentToken;

      // If we now have a token (user logged in), refresh user-dependent data
      if (currentToken && !previousToken) {
        showSuccess('Bem-vindo de volta! Carregando seus dados...');
        // Invalidate and refetch user-dependent queries
        queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
        queryClient.invalidateQueries({ queryKey: ['user-courses'] });
        queryClient.invalidateQueries({ queryKey: ['user-course-details'] });
        queryClient.invalidateQueries({ queryKey: ['certificates'] });
      }
    }
  }, [user?.token, queryClient, showSuccess]);

  // Show success message when user data finishes loading after login
  useEffect(() => {
    if (user?.token && !isUserDataRefreshing && !userLoading) {
      // Check if this is the first time we have user data loaded
      const hasJustLoaded = previousTokenRef.current === user.token && !userLoading;
      if (hasJustLoaded) {
        // Don't show another success message here to avoid spam
      }
    }
  }, [user?.token, isUserDataRefreshing, userLoading]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refetch auth user data to check for token updates
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    }, [queryClient])
  );

  // Mutations
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  const startCourseMutation = useStartCourse();
  const addCommentMutation = useAddForumComment();
  const replyMutation = useReplyToComment();

  // Check if certificate exists for this course and no errors
  const hasCertificate =
    !certificatesError && certificates.length > 0 && certificates.some((cert) => cert.course.documentId === documentId);

  // Unified check for course completion (either 100% progress OR has certificate)
  const isCourseCompleted = userCourseDetails?.progress === 100 || hasCertificate;

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOption = (option: string) => {
    switch (option) {
      case 'certificate':
        // Since we only show this option when certificate exists, we can safely find it
        // If user is at 100% but api hasn't generated certificate yet, this might need a fallback check
        const certificate = certificates.find((cert) => cert.course.documentId === documentId);
        if (certificate) {
          router.push({
            pathname: '/user/certificate',
            params: { certificateId: certificate.documentId },
          });
        } else {
          showInfo('Certificado sendo gerado. Tente novamente em instantes.');
          refetchCourse();
        }
        break;
      case 'report':
        showInfo('Funcionalidade de reportar problema em desenvolvimento');
        // Implement report bug functionality here
        break;
      default:
        break;
    }
    setMenuVisible(false);
  };

  const handleFavorite = async () => {
    if (!user?.token) {
      showError('Para marcar um curso como favorito é necessário que tenha feito o login');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await removeFromFavoritesMutation.mutateAsync({
          courseId: documentId,
          token: user.token,
        });
        showSuccess('Curso removido dos favoritos!');
      } else {
        // Add to favorites
        await addToFavoritesMutation.mutateAsync({
          courseId: documentId,
          token: user.token,
        });
        showSuccess('Curso adicionado aos favoritos!');
      }

      // Force refetch the favorites data to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    } catch (error) {
      console.error('Erro ao gerenciar favoritos:', error);
      showError('Falha ao gerenciar favoritos');
    }
  };

  const handleStartCourse = async () => {
    if (!user?.token) {
      showError('Para iniciar um curso é necessário que tenha feito o login');
      return;
    }

    try {
      await startCourseMutation.mutateAsync({
        courseId: documentId,
        token: user.token,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message;
      if (errorMessage === 'user already concluded that course') {
        showInfo('Este curso já foi concluído!');
      } else {
        showError('Falha ao iniciar o curso');
      }
    }
  };

  // Cross-platform share handler for store/website links
  const handleShare = async () => {
    try {
      const url = Platform.select({
        ios: 'https://apps.apple.com/mz/app/maza/id6748351782',
        android: 'https://play.google.com/store/apps/details?id=org.maza.app',
        default: 'https://mazas.org/',
      });

      if (!url) return;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return;
      }

      // Fallback for web environments if Linking fails
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
        return;
      }

      showError('Não foi possível abrir a página de partilha');
    } catch (err) {
      console.error('Erro ao partilhar:', err);
      showError('Falha ao tentar abrir a partilha');
    }
  };

  // Toggle description expand/collapse
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchCourse();
    if (user?.token) {
      refetchUserCourseDetails();
    }
  };

  const checkAuth = () => {
    if (!user?.token) {
      setLoginSheetVisible(true);
      return false;
    }
    return true;
  };

  const handleAddComment = async () => {
    if (!checkAuth()) return;
    if (!newComment.trim()) return;

    try {
      if (replyingTo) {
        // Handle reply
        await replyMutation.mutateAsync({
          courseId: documentId,
          commentId: replyingTo.uuid,
          comment: newComment,
          token: user?.token || '',
        });
        setReplyingTo(null);
        showSuccess('Resposta enviada com sucesso!');
      } else {
        // Handle new comment
        await addCommentMutation.mutateAsync({
          courseId: documentId,
          comment: newComment,
          token: user?.token || '',
        });
        showSuccess('Comentário adicionado com sucesso!');
        // Scroll to top to show the new comment
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      }
      setNewComment('');
    } catch (err: any) {
      // Error handling based on status
      const status = err?.response?.status;
      if (status === 400) {
        showError(replyingTo ? 'Resposta inválida.' : 'Comentário inválido.');
      } else if (status === 500) {
        showError('Erro no servidor. Tente novamente mais tarde.');
      } else {
        showError(replyingTo ? 'Erro ao enviar resposta.' : 'Erro ao adicionar comentário.');
      }
    }
  };

  const handleReplySelect = (comment: ForumComment) => {
    setReplyingTo(comment);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Shimmer loading component for course detail
  const CourseDetailShimmer = () => (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <ScrollView style={themedStyles.scrollView}>
        {/* Header shimmer */}
        <Shimmer style={themedStyles.headerShimmer}>
          <View style={themedStyles.headerShimmerContent}>
            <View style={themedStyles.headerActionsShimmer}>
              <View style={themedStyles.iconButtonShimmer} />
              <View style={themedStyles.rightActionsShimmer}>
                <View style={themedStyles.iconButtonShimmer} />
                <View style={themedStyles.iconButtonShimmer} />
              </View>
            </View>
            <View style={themedStyles.levelBadgeShimmer} />
          </View>
        </Shimmer>

        {/* Course info shimmer */}
        <View style={themedStyles.courseInfoShimmer}>
          <Shimmer style={themedStyles.titleShimmer}>
            <View style={themedStyles.shimmerBox} />
          </Shimmer>
          <Shimmer style={themedStyles.titleShimmerShort}>
            <View style={themedStyles.shimmerBox} />
          </Shimmer>

          <View style={themedStyles.instructorShimmer}>
            <Shimmer style={themedStyles.instructorNameShimmer}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
            <Shimmer style={themedStyles.categoryShimmer}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
          </View>

          {/* Description shimmer */}
          <View style={themedStyles.descriptionShimmerContainer}>
            <Shimmer style={themedStyles.descriptionLineShimmer}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
            <Shimmer style={themedStyles.descriptionLineShimmer}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
            <Shimmer style={themedStyles.descriptionLineShimmerShort}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
          </View>

          {/* Tabs shimmer */}
          <View style={themedStyles.tabContainerShimmer}>
            <Shimmer style={themedStyles.tabShimmer}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
            <Shimmer style={themedStyles.tabShimmer}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
            <Shimmer style={themedStyles.tabShimmer}>
              <View style={themedStyles.shimmerBox} />
            </Shimmer>
          </View>
        </View>

        {/* Modules list shimmer */}
        <View style={themedStyles.modulesListShimmer}>
          {[1, 2, 3, 4].map((key) => (
            <View key={key} style={themedStyles.moduleItemShimmer}>
              <View style={themedStyles.moduleTopRowShimmer}>
                <View style={themedStyles.moduleInfoShimmer}>
                  <Shimmer style={themedStyles.moduleNumberShimmer}>
                    <View style={themedStyles.shimmerBox} />
                  </Shimmer>
                  <Shimmer style={themedStyles.moduleTitleShimmer}>
                    <View style={themedStyles.shimmerBox} />
                  </Shimmer>
                </View>
                <Shimmer style={themedStyles.playIconShimmer}>
                  <View style={themedStyles.shimmerBox} />
                </Shimmer>
              </View>
              <View style={themedStyles.moduleMetaShimmer}>
                <Shimmer style={themedStyles.videoCountShimmer}>
                  <View style={themedStyles.shimmerBox} />
                </Shimmer>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer shimmer */}
      <View style={themedStyles.footer}>
        <Shimmer style={themedStyles.startButtonShimmer}>
          <View style={themedStyles.shimmerBox} />
        </Shimmer>
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return <CourseDetailShimmer />;
  }

  if (courseError) {
    console.error('Course error:', courseError);
    return (
      <View style={themedStyles.errorContainer}>
        <Text style={themedStyles.errorText}>Erro ao carregar dados do curso</Text>
        <Text style={[themedStyles.errorText, { fontSize: 12, marginTop: 8 }]}>
          {courseError.message || 'Erro desconhecido'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={themedStyles.errorContainer}>
        <Text style={themedStyles.errorText}>Erro ao carregar curso</Text>
      </View>
    );
  }

  // Import the celebration image
  const celebrateImage = require('@/assets/images/celebrate.webp');

  function handlePlayModule(module: CourseModuleData) {
    // Use the original module data for navigation
    // When user is logged in, originalModule is UserCourseModule with content progress states
    router.push({
      pathname: '/room/watch',
      params: {
        module: JSON.stringify(module.originalModule),
        author: courseData?.author,
        title: courseData?.title,
        imageUrl: getMediaUrl(courseData?.cover?.formats?.thumbnail?.url),
        userCourseId: userCourseDetails?.userCourseId,
        moduleId: module.moduleId?.toString(),
      },
    });
  }

  function handleStartQuiz(content: Quiz, isFinalTest = false) {
    const params: {
      content: string;
      isFinalTest?: string | undefined;
      courseId?: string | undefined;
    } = {
      content: JSON.stringify(content),
      isFinalTest: undefined,
    };

    if (isFinalTest) {
      params.isFinalTest = JSON.stringify(true);
      params.courseId = documentId;
    }

    router.push({
      pathname: '/room/quiz',
      params: params,
    });
  }

  // Helper function to convert Portuguese level to English
  const getEnglishLevel = (portugueseLevel: string): 'Basic' | 'Intermediate' | 'Advanced' => {
    switch (portugueseLevel) {
      case 'Básico':
        return 'Basic';
      case 'Intermédio':
      case 'Intermediário':
        return 'Intermediate';
      case 'Avançado':
        return 'Advanced';
      default:
        return 'Intermediate';
    }
  };

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={config.duration}
        position={config.position}
        showIcon={config.showIcon}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <ImageBackground
          source={{ uri: getMediaUrl(courseData?.cover?.formats?.thumbnail?.url) }}
          style={styles.header}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Feather name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.rightActions}>
                {isUserDataRefreshing && (
                  <View style={styles.refreshIndicator}>
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                )}
                <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                  <Feather name="share" size={24} color="#FFF" />
                </TouchableOpacity>
                {user?.token && (
                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      (addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending || favoriteLoading) &&
                        styles.iconButtonDisabled,
                    ]}
                    onPress={handleFavorite}
                    disabled={
                      addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending || favoriteLoading
                    }
                  >
                    {addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending || favoriteLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite ? '#FF4B4B' : '#FFF'}
                      />
                    )}
                  </TouchableOpacity>
                )}
                {hasCertificate && (
                  <View>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                      <Entypo name="dots-three-horizontal" size={24} color="#fff" />
                    </TouchableOpacity>

                    {menuVisible && (
                      <View style={themedStyles.menuContainer}>
                        <TouchableOpacity style={themedStyles.menuItem} onPress={() => handleMenuOption('certificate')}>
                          <Text style={themedStyles.menuItemText}>Certificado</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Level Badge Component */}
            <LevelBadge level={getEnglishLevel(courseData?.level || 'Intermédio')} />
          </View>
        </ImageBackground>

        <View style={themedStyles.courseInfo}>
          <Text style={themedStyles.courseTitle}>{courseData.title}</Text>
          <View style={styles.instructor}>
            <Text style={themedStyles.instructorName}>{courseData.author}</Text>
            <Text style={styles.categoryTag}>• {courseData.subjects[0]?.name || ''}</Text>
            {/*<TouchableOpacity style={styles.pathButton} onPress={handleOnPathPress}>*/}
            {/* <AntDesign name="fork" size={20} color="#fff" />*/}
            {/*</TouchableOpacity>*/}
          </View>

          {/* Course Description Section */}
          {courseData.description && (
            <View style={styles.descriptionContainer}>
              <Text style={themedStyles.descriptionText} numberOfLines={showFullDescription ? undefined : 3}>
                {courseData.description}
              </Text>
              <TouchableOpacity onPress={toggleDescription} style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>{showFullDescription ? 'Ver menos' : 'Ver mais'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={themedStyles.tabContainer}>
            <Tab active={activeTab === 'lessons'} onPress={() => setActiveTab('lessons')}>
              Aulas
            </Tab>
            <Tab active={activeTab === 'opinions'} onPress={() => setActiveTab('opinions')}>
              Opiniões
            </Tab>
            <Tab active={activeTab === 'forum'} onPress={() => setActiveTab('forum')}>
              Fórum
            </Tab>
          </View>
        </View>

        {activeTab === 'lessons' ? (
          <View style={styles.modulesList}>
            {!courseData.modules || courseData.modules.length === 0 ? (
              <View style={themedStyles.noModulesContainer}>
                <Feather name="book-open" size={48} color={colors.textMuted} style={styles.noModulesIcon} />
                <Text style={themedStyles.noModulesText}>Nenhum módulo encontrado para este curso</Text>
              </View>
            ) : (
              <>
                {getDisplayModules().map((module, index) => (
                  <CourseModuleCard
                    key={module.id}
                    module={module}
                    index={index}
                    showProgress={!!userCourseDetails}
                    onPress={handlePlayModule}
                  />
                ))}
                {courseData.final_test && (
                  <TouchableOpacity
                    style={[
                      themedStyles.moduleItem,
                      userCourseDetails?.quiz?.state === 'Passed' && styles.moduleItemCompleted,
                    ]}
                    onPress={() => handleStartQuiz(courseData.final_test, true)}
                  >
                    <View style={styles.moduleContent}>
                      <View style={styles.moduleTopRow}>
                        <View style={styles.moduleInfo}>
                          <Text style={themedStyles.moduleNumber}>Q.</Text>
                          <Text
                            style={[
                              themedStyles.moduleTitle,
                              userCourseDetails?.quiz?.state === 'Passed' && styles.moduleTitleCompleted,
                            ]}
                          >
                            Teste Final
                          </Text>
                        </View>
                        <View style={styles.moduleDetails}>
                          {userCourseDetails?.quiz?.state === 'Passed' ? (
                            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                          ) : (
                            <View style={themedStyles.iconContainer}>
                              <Ionicons name="help-circle" size={20} color={colors.primary} />
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.moduleMetaRow}>
                        <View style={styles.videoCount}>
                          <Feather name="check-circle" size={14} color={colors.textMuted} />
                          <Text style={themedStyles.videoCountText}>
                            {courseData.final_test.questions.length} perguntas
                          </Text>
                        </View>
                        {userCourseDetails?.quiz?.state === 'Passed' && userCourseDetails?.quiz?.grade != null && (
                          <View style={styles.quizGradeContainer}>
                            <Ionicons name="trophy-outline" size={12} color="#22C55E" />
                            <Text style={styles.quizGradeText}>Nota: {userCourseDetails.quiz.grade}%</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ) : activeTab === 'opinions' ? (
          <View style={styles.opinionsContainer}>
            <Reviews courseId={documentId} onReviewSubmitted={() => showSuccess('Opinião enviada com sucesso!')} />
          </View>
        ) : (
          <View style={styles.opinionsContainer}>
            <Forum courseId={documentId} onReplySelect={handleReplySelect} />
          </View>
        )}
      </ScrollView>

      <View style={themedStyles.footer}>
        {activeTab === 'forum' ? (
          <View style={themedStyles.inputContainer}>
            {replyingTo && (
              <View style={themedStyles.replyPreview}>
                <View style={styles.replyPreviewHeader}>
                  <View style={styles.replyPreviewLeft}>
                    <Ionicons name="arrow-undo" size={14} color={colors.primary} />
                    <Text style={themedStyles.replyPreviewLabel}>
                      Respondendo a <Text style={styles.replyPreviewName}>{replyingTo.user.fullname}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity onPress={cancelReply} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.replyPreviewQuote}>
                  <View style={styles.replyPreviewLine} />
                  <Text style={themedStyles.replyPreviewText} numberOfLines={2}>
                    {replyingTo.comment}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={[themedStyles.input, isInputFocused && styles.inputExpanded]}
                placeholder={replyingTo ? 'Escreva sua resposta...' : 'Adicione um comentário...'}
                placeholderTextColor={colors.textMuted}
                value={newComment}
                onChangeText={setNewComment}
                onFocus={() => {
                  checkAuth();
                  setIsInputFocused(true);
                }}
                onBlur={() => setIsInputFocused(false)}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newComment.trim() || addCommentMutation.isPending || replyMutation.isPending) &&
                    themedStyles.disabledButton,
                ]}
                onPress={handleAddComment}
                disabled={!newComment.trim() || addCommentMutation.isPending || replyMutation.isPending}
              >
                {addCommentMutation.isPending || replyMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : isCourseCompleted ? (
          <View style={themedStyles.completionCard}>
            <View style={styles.completionContent}>
              <View style={styles.completionTextContainer}>
                <Text style={styles.completionTitle}>Parabéns!</Text>
                <Text style={themedStyles.completionSubtitle}>Concluiu este curso.</Text>
              </View>
              <Image source={celebrateImage} style={styles.celebrateImage} resizeMode="contain" />
            </View>

            <TouchableOpacity style={styles.certificateButtonFull} onPress={() => router.push('/user/certificates')}>
              <Text style={styles.certificateButtonText}>Visualizar Certificado</Text>
            </TouchableOpacity>
          </View>
        ) : isInProgress || !!userCourseDetails ? (
          <View style={themedStyles.progressContainer}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={themedStyles.progressTitle}>Seu progresso</Text>
                <Text style={themedStyles.progressSubtitle}>Continue de onde parou</Text>
              </View>
              <Text style={styles.progressPercentage}>{Math.round(userCourseDetails?.progress || progress)}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={themedStyles.progressBar}>
                <View style={[styles.progressFill, { width: `${userCourseDetails?.progress || progress}%` }]} />
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, startCourseMutation.isPending && styles.startButtonDisabled]}
            onPress={handleStartCourse}
            disabled={startCourseMutation.isPending}
          >
            {startCourseMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.startButtonText}>Iniciar Curso</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      <LoginBottomSheet visible={loginSheetVisible} onClose={() => setLoginSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
    padding: 24,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'ManropeRegular',
  },
  retryButton: {
    backgroundColor: '#1fa2df',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 200,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 45,
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'ManropeRegular',
  },
  courseInfo: {
    padding: 24,
    backgroundColor: '#121214',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    fontFamily: 'ManropeBold',
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorName: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'ManropeRegular',
  },
  categoryTag: {
    color: '#1fa2df',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
    fontFamily: 'ManropeRegular',
  },
  pathButton: {
    backgroundColor: '#1fa2df',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 6,
  },
  pathButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
  descriptionContainer: {
    marginBottom: 16,
    borderRadius: 8,
  },
  descriptionText: {
    color: '#E1E1E6',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'ManropeRegular',
  },
  viewMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  viewMoreText: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  modulesList: {
    padding: 24,
  },
  moduleItem: {
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 15,
    marginBottom: 12,
  },
  moduleContent: {
    gap: 12,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  moduleNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
  moduleTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    fontFamily: 'ManropeMedium',
  },
  moduleTitleCompleted: {
    color: '#1fa2df',
  },

  moduleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#2a2d3e',
    borderRadius: 50,
    padding: 5,
  },
  videoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginStart: 25,
  },
  videoCountText: {
    color: '#A8A8B3',
    fontSize: 12,
    fontFamily: 'ManropeRegular',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  inputContainer: {
    backgroundColor: '#121214',
  },
  replyPreview: {
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  replyPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  replyPreviewLabel: {
    color: '#A8A8B3',
    fontSize: 12,
    fontFamily: 'ManropeRegular',
  },
  replyPreviewName: {
    color: '#1fa2df',
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  replyPreviewQuote: {
    flexDirection: 'row',
  },
  replyPreviewLine: {
    width: 3,
    backgroundColor: '#1fa2df',
    borderRadius: 2,
    marginRight: 10,
  },
  replyPreviewText: {
    color: '#7C7C8A',
    fontSize: 13,
    flex: 1,
    fontStyle: 'italic',
    fontFamily: 'ManropeRegular',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#202024',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFF',
    maxHeight: 100,
  },
  inputExpanded: {
    height: 250,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1fa2df',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#323238',
    opacity: 0.5,
  },
  startButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#1fa2df80',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  opinionsContainer: {
    flex: 1,
    minHeight: 400,
  },
  ratingOverview: {
    marginBottom: 24,
  },
  noModulesContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202024',
    borderRadius: 15,
    marginVertical: 12,
  },
  noModulesText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'ManropeMedium',
  },
  noModulesIcon: {
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#1fa2df',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    fontFamily: 'ManropeMedium',
  },
  refreshIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  progressPercentage: {
    color: '#1fa2df',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'ManropeBold',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#323238',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1fa2df',
    borderRadius: 3,
  },
  progressText: {
    color: '#A8A8B3',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'ManropeRegular',
  },
  certificateButton: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  certificateButtonIcon: {
    marginRight: 8,
  },
  completionCard: {
    backgroundColor: '#202024',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1fa2df',
  },
  completionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1fa2df',
    marginBottom: 4,
    fontFamily: 'ManropeBold',
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#E1E1E6',
    fontFamily: 'ManropeRegular',
  },
  celebrateImage: {
    width: 80,
    height: 80,
  },
  certificateButtonFull: {
    backgroundColor: '#1fa2df',
    paddingVertical: 14,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  certificateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'ManropeBold',
  },
  certificateIcon: {
    marginLeft: 4,
  },
  // END: Styles for the new Completion Card
  moduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  moduleItemCompleted: {
    borderColor: '#1fa2df',
    borderWidth: 1,
  },
  quizGradeContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)', // Light green bg
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizGradeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'ManropeBold',
  },
  progressSubtitle: {
    color: '#A8A8B3',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'ManropeRegular',
  },
  // Shimmer loading styles
  shimmerBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#29292E',
    borderRadius: 4,
  },
  headerShimmer: {
    height: 200,
    backgroundColor: '#202024',
  },
  headerShimmerContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerActionsShimmer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActionsShimmer: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButtonShimmer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#29292E',
  },
  levelBadgeShimmer: {
    width: 80,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#29292E',
  },
  courseInfoShimmer: {
    padding: 24,
    backgroundColor: '#121214',
  },
  titleShimmer: {
    height: 28,
    marginBottom: 8,
    borderRadius: 4,
  },
  titleShimmerShort: {
    height: 28,
    width: '60%',
    marginBottom: 16,
    borderRadius: 4,
  },
  instructorShimmer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  instructorNameShimmer: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
  categoryShimmer: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  descriptionShimmerContainer: {
    marginBottom: 16,
    gap: 8,
  },
  descriptionLineShimmer: {
    height: 14,
    borderRadius: 4,
  },
  descriptionLineShimmerShort: {
    height: 14,
    width: '70%',
    borderRadius: 4,
  },
  tabContainerShimmer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
    paddingBottom: 12,
    gap: 24,
  },
  tabShimmer: {
    width: 60,
    height: 20,
    borderRadius: 4,
  },
  modulesListShimmer: {
    padding: 24,
  },
  moduleItemShimmer: {
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 15,
    marginBottom: 12,
  },
  moduleTopRowShimmer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleInfoShimmer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  moduleNumberShimmer: {
    width: 24,
    height: 20,
    borderRadius: 4,
  },
  moduleTitleShimmer: {
    flex: 1,
    height: 20,
    borderRadius: 4,
  },
  playIconShimmer: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  moduleMetaShimmer: {
    marginStart: 36,
  },
  videoCountShimmer: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  startButtonShimmer: {
    height: 50,
    borderRadius: 25,
  },
});
