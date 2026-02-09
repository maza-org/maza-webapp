import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

interface TypingIndicatorProps {
  isDark: boolean;
  colors: any;
}

export default function TypingIndicator({ isDark, colors }: TypingIndicatorProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        typingIndicator: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingVertical: 14,
          paddingHorizontal: 18,
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          gap: 6,
        },
        typingDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.text,
          opacity: 0.4,
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={styles.typingIndicator}>
      <View style={[styles.typingDot, { opacity: 0.3 }]} />
      <View style={[styles.typingDot, { opacity: 0.5 }]} />
      <View style={[styles.typingDot, { opacity: 0.7 }]} />
    </View>
  );
}
