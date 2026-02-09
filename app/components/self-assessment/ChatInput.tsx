import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isDark: boolean;
  colors: any;
}

export default function ChatInput({ value, onChangeText, onSend, isLoading, isDark, colors }: ChatInputProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
        textInput: {
          flex: 1,
          minHeight: 44,
          maxHeight: 120,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 22,
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          color: colors.text,
          fontSize: 16,
          fontFamily: 'Manrope-Regular',
        },
        sendButton: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.tint,
          justifyContent: 'center',
          alignItems: 'center',
        },
        sendButtonDisabled: {
          opacity: 0.5,
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Digite sua resposta..."
        placeholderTextColor={isDark ? '#888' : '#999'}
        value={value}
        onChangeText={onChangeText}
        multiline
        editable={!isLoading}
        onSubmitEditing={onSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!value.trim() || isLoading) && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!value.trim() || isLoading}
      >
        <Ionicons name="send" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
