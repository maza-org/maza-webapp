import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForumComments, useDeleteForumComment } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { ForumComment } from '@/types/learning';
import LoginBottomSheet from './LoginBottomSheet';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ForumProps {
  courseId: string;
  onReplySelect?: (comment: ForumComment) => void;
}

export type { ForumComment };

const formatForumDate = (dateString: string) => {
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

const CommentItem = ({
  comment,
  courseId,
  token,
  currentUserEmail,
  onReply,
  onDelete,
  deletingCommentId,
}: {
  comment: ForumComment;
  courseId: string;
  token: string;
  currentUserEmail?: string;
  onReply: (comment: ForumComment) => void;
  onDelete: (comment: ForumComment) => void;
  deletingCommentId: string | null;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = useMemo(() => StyleSheet.create({
    commentCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    commentHeader: {
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
      fontFamily: 'ManropeBold',
    },
    commentUserInfo: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'ManropeMedium',
    },
    commentDate: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
      fontFamily: 'ManropeRegular',
    },
    deleteButton: {
      padding: 4,
      marginTop: 2,
    },
    commentText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 12,
      fontFamily: 'ManropeRegular',
    },
    viewMoreButton: {
      marginBottom: 12,
      alignSelf: 'flex-end',
    },
    viewMoreText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'ManropeMedium',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    replyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    replyButtonText: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: 'ManropeRegular',
    },
    showRepliesButton: {
      padding: 4,
    },
    showRepliesText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'ManropeRegular',
    },
    repliesContainer: {
      marginTop: 16,
      paddingLeft: 16,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
    },
    replyCard: {
      marginTop: 12,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
    },
    smallAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    smallAvatarText: {
      fontSize: 14,
      fontFamily: 'ManropeBold',
    },
    smallUserName: {
      fontSize: 14,
      fontFamily: 'ManropeMedium',
    },
  }), [colors]);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const isLongComment = comment.comment.length > 200;
  const isOwner = currentUserEmail && comment.user.email === currentUserEmail;
  const isDeleting = deletingCommentId === comment.uuid;

  const displayedComment = isExpanded || !isLongComment ? comment.comment : `${comment.comment.substring(0, 200)}...`;

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.avatarContainer}>
          {comment.user.profile_image ? (
            <Image source={{ uri: comment.user.profile_image }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Text style={styles.avatarText}>{comment.user.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.commentUserInfo}>
          <Text style={styles.userName}>{comment.user.fullname}</Text>
          <Text style={styles.commentDate}>{formatForumDate(comment.date)}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(comment)} disabled={isDeleting}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.commentText}>{displayedComment}</Text>
      {isLongComment && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>{isExpanded ? 'Ver menos' : 'Ver mais'}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.replyButton} onPress={() => onReply(comment)}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
          <Text style={styles.replyButtonText}>Responder</Text>
        </TouchableOpacity>

        {hasReplies && (
          <TouchableOpacity style={styles.showRepliesButton} onPress={() => setShowReplies(!showReplies)}>
            <Text style={styles.showRepliesText}>
              {showReplies
                ? 'Ocultar respostas'
                : `Ver ${comment.replies.length} ${comment.replies.length === 1 ? 'resposta' : 'respostas'}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showReplies && hasReplies && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => {
            const isReplyOwner = currentUserEmail && reply.user.email === currentUserEmail;
            const isReplyDeleting = deletingCommentId === reply.uuid;
            return (
              <View key={reply.id} style={styles.replyCard}>
                <View style={styles.commentHeader}>
                  <View style={[styles.avatarContainer, styles.smallAvatar]}>
                    {reply.user.profile_image ? (
                      <Image source={{ uri: reply.user.profile_image }} style={styles.avatarImage} resizeMode="cover" />
                    ) : (
                      <Text style={[styles.avatarText, styles.smallAvatarText]}>
                        {reply.user.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.commentUserInfo}>
                    <Text style={[styles.userName, styles.smallUserName]}>{reply.user.fullname}</Text>
                    <Text style={styles.commentDate}>{formatForumDate(reply.date)}</Text>
                  </View>
                  {isReplyOwner && (
                    <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(reply)} disabled={isReplyDeleting}>
                      {isReplyDeleting ? (
                        <ActivityIndicator size="small" color={colors.textMuted} />
                      ) : (
                        <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentText}>{reply.comment}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const Forum = ({ courseId, onReplySelect }: ForumProps) => {
  const { data: user } = useAuthUser();
  const token = user?.token || '';
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { data: comments, isLoading, error } = useForumComments(courseId, token);
  const deleteCommentMutation = useDeleteForumComment();

  const [loginSheetVisible, setLoginSheetVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<ForumComment | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: colors.background,
    },
    loadingContainer: {
      padding: 24,
      alignItems: 'center',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      fontFamily: 'ManropeRegular',
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      fontFamily: 'ManropeBold',
    },
    sortContainer: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    commentsCountText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'ManropeBold',
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sortText: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: 'ManropeRegular',
    },
    listContent: {
      padding: 24,
      paddingTop: 0,
      paddingBottom: 100,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      minHeight: 300,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 75, 75, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      fontFamily: 'ManropeBold',
    },
    modalMessage: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
      fontFamily: 'ManropeRegular',
    },
    modalButtons: {
      flexDirection: 'column',
      gap: 12,
      width: '100%',
    },
    modalDeleteButton: {
      width: '100%',
      backgroundColor: '#FF4B4B',
      paddingVertical: 14,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    modalDeleteText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'ManropeBold',
    },
    modalCancelButton: {
      width: '100%',
      backgroundColor: colors.inputBackground,
      paddingVertical: 14,
      borderRadius: 50,
      alignItems: 'center',
    },
    modalCancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'ManropeMedium',
    },
    modalButtonDisabled: {
      opacity: 0.6,
    },
    commentPreview: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      width: '100%',
    },
    commentPreviewText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontStyle: 'italic',
      lineHeight: 20,
      fontFamily: 'ManropeRegular',
    },
  }), [colors]);

  const checkAuth = () => {
    if (!token) {
      setLoginSheetVisible(true);
      return false;
    }
    return true;
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    setDeleteStatus('loading');
    setDeletingCommentId(commentToDelete.uuid);
    try {
      await deleteCommentMutation.mutateAsync({
        courseId,
        commentUuid: commentToDelete.uuid,
        token,
      });
      // Close immediately on success (like creating comments)
      setDeleteModalVisible(false);
      setCommentToDelete(null);
      setDeleteStatus('idle');
      setDeletingCommentId(null);
    } catch (err) {
      setDeleteStatus('error');
      setDeletingCommentId(null);
    }
  };

  const handleDeleteComment = (comment: ForumComment) => {
    if (!checkAuth()) return;
    setCommentToDelete(comment);
    setDeleteStatus('idle');
    setDeleteModalVisible(true);
  };

  const cancelDelete = () => {
    if (deleteStatus === 'loading') return;
    setDeleteModalVisible(false);
    setCommentToDelete(null);
    setDeleteStatus('idle');
  };

  const sortedComments = useMemo(() => {
    if (!comments) return [];
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [comments, sortOrder]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Erro ao carregar fórum.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.container}>
        <View style={styles.sortContainer}>
          <Text style={styles.commentsCountText}>{comments?.length || 0} Comentários</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          >
            <Ionicons name="swap-vertical" size={16} color={colors.textMuted} />
            <Text style={styles.sortText}>{sortOrder === 'newest' ? 'Mais recentes' : 'Mais antigos'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContent}>
          {sortedComments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Seja o primeiro a comentar!</Text>
              <Text style={styles.emptyText}>Inicie uma discussão sobre este curso.</Text>
            </View>
          ) : (
            sortedComments.map((item) => (
              <CommentItem
                key={item.id.toString()}
                comment={item}
                courseId={courseId}
                token={token}
                currentUserEmail={user?.email}
                onReply={(comment) => {
                  if (checkAuth() && onReplySelect) {
                    onReplySelect(comment);
                  }
                }}
                onDelete={handleDeleteComment}
                deletingCommentId={deletingCommentId}
              />
            ))
          )}
        </View>

        <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={cancelDelete}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {deleteStatus === 'error' ? (
                <>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name="close" size={32} color="#FF4B4B" />
                  </View>
                  <Text style={styles.modalTitle}>Erro ao apagar</Text>
                  <Text style={styles.modalMessage}>Não foi possível apagar o comentário. Tente novamente.</Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.modalDeleteButton} onPress={confirmDelete}>
                      <Text style={styles.modalDeleteText}>Tentar novamente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={cancelDelete}>
                      <Text style={styles.modalCancelText}>Fechar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name="trash-outline" size={32} color="#FF4B4B" />
                  </View>
                  <Text style={styles.modalTitle}>Apagar comentário</Text>
                  {commentToDelete && (
                    <View style={styles.commentPreview}>
                      <Text style={styles.commentPreviewText} numberOfLines={2}>
                        "{commentToDelete.comment.length > 80
                          ? `${commentToDelete.comment.substring(0, 80)}...`
                          : commentToDelete.comment}"
                      </Text>
                    </View>
                  )}
                  <Text style={styles.modalMessage}>
                    Esta ação não pode ser desfeita.
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalDeleteButton, deleteStatus === 'loading' && styles.modalButtonDisabled]}
                      onPress={confirmDelete}
                      disabled={deleteStatus === 'loading'}
                    >
                      {deleteStatus === 'loading' ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.modalDeleteText}>Apagar</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalCancelButton, deleteStatus === 'loading' && styles.modalButtonDisabled]}
                      onPress={cancelDelete}
                      disabled={deleteStatus === 'loading'}
                    >
                      <Text style={styles.modalCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        <LoginBottomSheet visible={loginSheetVisible} onClose={() => setLoginSheetVisible(false)} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Forum;
