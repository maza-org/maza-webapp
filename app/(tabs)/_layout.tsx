import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabStyles, tabColors } from '@/app/types/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { Image } from 'react-native';
import WebNavBar from '@/components/WebNavBar';
import useIsDesktopWeb from '@/hooks/useIsDesktopWeb';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const isDesktop = useIsDesktopWeb();
  const baseTabContentHeight = 65;

  const colors = isDark ? tabColors.dark : tabColors.light;
  const baseScreenOptions = tabStyles.screenOptions(insets, baseTabContentHeight, colors);

  const screenOptions = {
    ...baseScreenOptions,
    headerShown: !isDesktop,
    headerTitle: () => (
      <Image 
        source={require('@/assets/images/maza-logo.png')} 
        style={{ width: 80, height: 32 }} 
        resizeMode="contain" 
      />
    ),
    headerTitleAlign: 'center' as const,
    headerStyle: {
      backgroundColor: colors.background,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sceneStyle: {
      paddingTop: isDesktop ? 70 : 0,
    },
  };

  return (
    <Tabs 
      screenOptions={screenOptions}
      tabBar={isDesktop ? (props) => <WebNavBar {...props} /> : undefined}
    >
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
          title: 'Minha Jornada',
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
