import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

interface AuthTitleProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkAction?: () => void;
}

export default function AuthTitle({ title, subtitle, linkText, linkAction }: AuthTitleProps) {
  return (
    <View style={styles.titleSection}>
      <Text style={styles.headerText}>{title}</Text>
      
      {subtitle && linkText && (
        <View style={styles.linkContainer}>
          <Text style={styles.subtitleText}>{subtitle} </Text>
          <TouchableOpacity onPress={linkAction}>
            <Text style={styles.linkText}>{linkText}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 200,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  subtitleText: {
    color: '#999999',
    fontSize: 14,
  },
  linkText: {
    color: '#2196F3',
    fontSize: 14,
  },
});