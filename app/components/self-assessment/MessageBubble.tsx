import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/types/self-assessment';

interface MessageBubbleProps {
  message: ChatMessage;
  isDark: boolean;
  colors: any;
}

export default function MessageBubble({ message, isDark, colors }: MessageBubbleProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        messageBubble: {
          maxWidth: '85%',
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 20,
        },
        assistantBubble: {
          alignSelf: 'flex-start',
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          borderBottomLeftRadius: 6,
        },
        userBubble: {
          alignSelf: 'flex-end',
          backgroundColor: colors.tint,
          borderBottomRightRadius: 6,
        },
        messageText: {
          fontSize: 16,
          lineHeight: 24,
          fontFamily: 'Manrope-Regular',
        },
        assistantText: {
          color: colors.text,
        },
        userText: {
          color: '#FFFFFF',
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={[styles.messageBubble, message.role === 'assistant' ? styles.assistantBubble : styles.userBubble]}>
      <Text
        selectable={true}
        style={[styles.messageText, message.role === 'assistant' ? styles.assistantText : styles.userText]}
      >
        {message?.content || ''}
      </Text>
    </View>
  );
}
