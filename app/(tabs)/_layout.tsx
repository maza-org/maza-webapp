import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3485FF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#202024',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingTop: 5,
          height: 70,
          // Remove fixed paddingBottom and use safeAreaInsets instead
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'ManropeRegular',
          marginTop: 6,
        },
        tabBarInactiveTintColor: '#7C7C8A',
        // Add this to handle safe area properly
        tabBarItemStyle: {
          paddingBottom: 5,
        },
        // Enable this to respect safe area insets
        safeAreaInsets: { bottom: Platform.OS === 'ios' ? 10 : 5 },
      }}
    >
      {/* Tab screens remain the same */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Meus Cursos',
          tabBarIcon: ({ color, size }) => <Ionicons name="school" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: 'Oportunidades',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
