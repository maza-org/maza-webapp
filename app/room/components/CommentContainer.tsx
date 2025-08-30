import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CommentContainerProps {
  comment: string | undefined;
  isCorrect: boolean;
}

export const CommentContainer: React.FC<CommentContainerProps> = ({ comment, isCorrect }) => {
  return (
    <View
      style={[styles.commentContainer, isCorrect ? styles.correctCommentContainer : styles.incorrectCommentContainer]}
    >
      <View style={styles.commentHeader}>
        <Feather name={isCorrect ? 'check-circle' : 'info'} size={16} color="#A8A8B3" />
        <Text style={styles.commentLabel}>{isCorrect ? 'Explicação' : 'Por que não é correto'}</Text>
      </View>
      <Text style={[styles.commentText, isCorrect ? styles.correctCommentText : styles.incorrectCommentText]}>
        {comment}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(168, 168, 179, 0.08)',
    borderRadius: 8,
    borderLeftColor: '#6B7280',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentLabel: {
    color: '#A8A8B3',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commentText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  correctCommentContainer: {
    backgroundColor: 'rgba(168, 168, 179, 0.08)',
    borderLeftColor: '#6B7280',
  },
  incorrectCommentContainer: {
    backgroundColor: 'rgba(168, 168, 179, 0.08)',
    borderLeftColor: '#6B7280',
  },
  correctCommentLabel: {
    color: '#A8A8B3',
  },
  incorrectCommentLabel: {
    color: '#A8A8B3',
  },
  correctCommentText: {
    color: '#D1D5DB',
    fontWeight: '500',
  },
  incorrectCommentText: {
    color: '#D1D5DB',
    fontWeight: '500',
  },
});
