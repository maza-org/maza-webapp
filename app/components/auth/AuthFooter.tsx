import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AuthFooterProps {
  linkText?: string;
  onLinkPress?: () => void;
}

export default function AuthFooter({ linkText, onLinkPress }: AuthFooterProps) {
  if (!linkText || !onLinkPress) return null;

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={onLinkPress}>
        <Text style={styles.footerLinkText}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerLinkText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 8,
  },
});