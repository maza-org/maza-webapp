import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForumComments } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { ForumComment } from '@/types/learning';
import LoginBottomSheet from './LoginBottomSheet';

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
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

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
    onReply,
}: {
    comment: ForumComment;
    courseId: string;
    token: string;
    onReply: (comment: ForumComment) => void;
}) => {
    const [showReplies, setShowReplies] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const hasReplies = comment.replies && comment.replies.length > 0;
    const isLongComment = comment.comment.length > 200;

    const displayedComment = isExpanded || !isLongComment
        ? comment.comment
        : `${comment.comment.substring(0, 200)}...`;

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
            </View>

            <Text style={styles.commentText}>{displayedComment}</Text>
            {isLongComment && (
                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.viewMoreButton}>
                    <Text style={styles.viewMoreText}>{isExpanded ? 'Ver menos' : 'Ver mais'}</Text>
                </TouchableOpacity>
            )}

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.replyButton} onPress={() => onReply(comment)}>
                    <Ionicons name="chatbubble-outline" size={16} color="#A8A8B3" />
                    <Text style={styles.replyButtonText}>Responder</Text>
                </TouchableOpacity>

                {hasReplies && (
                    <TouchableOpacity style={styles.showRepliesButton} onPress={() => setShowReplies(!showReplies)}>
                        <Text style={styles.showRepliesText}>
                            {showReplies ? 'Ocultar respostas' : `Ver ${comment.replies.length} respostas`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {showReplies && hasReplies && (
                <View style={styles.repliesContainer}>
                    {comment.replies.map((reply) => (
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
                            </View>
                            <Text style={styles.commentText}>{reply.comment}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const Forum = ({ courseId, onReplySelect }: ForumProps) => {
    const { data: user } = useAuthUser();
    const token = user?.token || '';

    const { data: comments, isLoading, error } = useForumComments(courseId, token);

    const [loginSheetVisible, setLoginSheetVisible] = useState(false);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    const checkAuth = () => {
        if (!token) {
            setLoginSheetVisible(true);
            return false;
        }
        return true;
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
                <ActivityIndicator size="large" color="#1fa2df" />
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
        <View style={styles.container}>
            <View style={styles.sortContainer}>
                <Text style={styles.commentsCountText}>
                    {comments?.length || 0} Comentários
                </Text>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
                >
                    <Ionicons name="swap-vertical" size={16} color="#A8A8B3" />
                    <Text style={styles.sortText}>{sortOrder === 'newest' ? 'Mais recentes' : 'Mais antigos'}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={sortedComments}
                nestedScrollEnabled={true}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CommentItem
                        comment={item}
                        courseId={courseId}
                        token={token}
                        onReply={(comment) => {
                            if (checkAuth() && onReplySelect) {
                                onReplySelect(comment);
                            }
                        }}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Seja o primeiro a comentar!</Text>
                        <Text style={styles.emptyText}>Inicie uma discussão sobre este curso.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />

            <LoginBottomSheet visible={loginSheetVisible} onClose={() => setLoginSheetVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#121214',
    },
    loadingContainer: {
        padding: 24,
        alignItems: 'center',
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 100,
    },
    sortContainer: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commentsCountText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: {
        color: '#A8A8B3',
        fontSize: 14,
    },
    commentCard: {
        backgroundColor: '#202024',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#323238',
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
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    commentUserInfo: {
        flex: 1,
    },
    userName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    commentDate: {
        color: '#7C7C8A',
        fontSize: 12,
        marginTop: 2,
    },
    commentText: {
        color: '#E1E1E6',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#323238',
        paddingTop: 12,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    replyButtonText: {
        color: '#A8A8B3',
        fontSize: 14,
    },
    showRepliesButton: {
        padding: 4,
    },
    showRepliesText: {
        color: '#1fa2df',
        fontSize: 14,
    },
    repliesContainer: {
        marginTop: 16,
        paddingLeft: 16,
        borderLeftWidth: 2,
        borderLeftColor: '#323238',
    },
    replyCard: {
        marginTop: 12,
        backgroundColor: '#29292e',
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
    },
    smallUserName: {
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyText: {
        color: '#A8A8B3',
        fontSize: 14,
        textAlign: 'center',
    },
    viewMoreButton: {
        marginBottom: 12,
        alignSelf: 'flex-end',
    },
    viewMoreText: {
        color: '#1fa2df',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default Forum;
