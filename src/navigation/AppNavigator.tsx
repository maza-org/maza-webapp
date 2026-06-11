import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import BotAssessmentScreen from '../screens/BotAssessmentScreen';
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import LessonViewerScreen from '../screens/LessonViewerScreen';
import ImpactAssessmentScreen from '../screens/ImpactAssessmentScreen';
import JobsScreen from '../screens/JobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import BadgesScreen from '../screens/BadgesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyCertificatesScreen from '../screens/MyCertificatesScreen';
import NotificationsInboxScreen from '../screens/NotificationsInboxScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import CourseForumScreen from '../screens/CourseForumScreen';
import HowItWorksStoryScreen from '../screens/HowItWorksStoryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { colors: themeColors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          
          if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Cursos') iconName = focused ? 'library' : 'library-outline';
          if (route.name === 'Oportunidades') iconName = focused ? 'briefcase' : 'briefcase-outline';
          if (route.name === 'Conquistas') iconName = focused ? 'trophy' : 'trophy-outline';
          if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textMuted,
        tabBarLabelStyle: {
          fontSize: 9.5,
          letterSpacing: -0.3,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: themeColors.card,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Cursos" component={CoursesScreen} />
      <Tab.Screen name="Oportunidades" component={JobsScreen} />
      <Tab.Screen name="Conquistas" component={BadgesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  if (loading) {
    return null;
  }

  const assessmentDone = user?.profile?.assessmentDone ?? false;

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={!user ? 'guest' : 'auth'}
        initialRouteName={!user ? 'Login' : undefined}
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          // ── Not logged in ────────────────────────────────────
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="HowItWorksStory" component={HowItWorksStoryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : !assessmentDone ? (
          // ── Logged in but assessment NOT done ────────────────
          <>
            <Stack.Screen
              name="BotAssessment"
              component={BotAssessmentScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          </>
        ) : (
          // ── Logged in + assessment done ───────────────────────
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="ImpactAssessment" component={ImpactAssessmentScreen} />
            <Stack.Screen name="LessonViewer" component={LessonViewerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="MyCertificates" component={MyCertificatesScreen} />
            <Stack.Screen name="NotificationsInbox" component={NotificationsInboxScreen} />
            <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
            <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="CourseForum" component={CourseForumScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HowItWorksStory" component={HowItWorksStoryScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="BotAssessment" component={BotAssessmentScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
