import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TabProps {
  active: boolean;
  onPress: () => void;
  children: string;
}

export function Tab({ active, onPress, children }: TabProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1fa2df',
  },
  tabText: {
    color: '#A8A8B3',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1fa2df',
  },
});
