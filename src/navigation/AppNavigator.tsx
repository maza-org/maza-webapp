import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ScreenLoader from '../components/ScreenLoader';
import { useIsWideWeb } from '../utils/webViewport';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const lazyScreen = <T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>
) => {
  const LazyComponent = React.lazy(loader);

  return function LazyScreen(props: React.ComponentProps<T>) {
    return (
      <React.Suspense fallback={<ScreenLoader label="A carregar..." />}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
};

const OnboardingScreen = lazyScreen(() => import('../screens/OnboardingScreen'));
const RegisterScreen = lazyScreen(() => import('../screens/RegisterScreen'));
const OtpVerificationScreen = lazyScreen(() => import('../screens/OtpVerificationScreen'));
const BotAssessmentScreen = lazyScreen(() => import('../screens/BotAssessmentScreen'));
const HomeScreen = lazyScreen(() => import('../screens/HomeScreen'));
const CoursesScreen = lazyScreen(() => import('../screens/CoursesScreen'));
const CourseDetailScreen = lazyScreen(() => import('../screens/CourseDetailScreen'));
const LessonViewerScreen = lazyScreen(() => import('../screens/LessonViewerScreen'));
const ImpactAssessmentScreen = lazyScreen(() => import('../screens/ImpactAssessmentScreen'));
const JobsScreen = lazyScreen(() => import('../screens/JobsScreen'));
const JobDetailScreen = lazyScreen(() => import('../screens/JobDetailScreen'));
const BadgesScreen = lazyScreen(() => import('../screens/BadgesScreen'));
const ProfileScreen = lazyScreen(() => import('../screens/ProfileScreen'));
const MyCertificatesScreen = lazyScreen(() => import('../screens/MyCertificatesScreen'));
const NotificationsInboxScreen = lazyScreen(() => import('../screens/NotificationsInboxScreen'));
const NotificacoesScreen = lazyScreen(() => import('../screens/NotificacoesScreen'));
const ConfiguracoesScreen = lazyScreen(() => import('../screens/ConfiguracoesScreen'));
const CourseForumScreen = lazyScreen(() => import('../screens/CourseForumScreen'));
const HowItWorksStoryScreen = lazyScreen(() => import('../screens/HowItWorksStoryScreen'));
const EditProfileScreen = lazyScreen(() => import('../screens/EditProfileScreen'));
const ChangePasswordScreen = lazyScreen(() => import('../screens/ChangePasswordScreen'));
const CareerOutcomesScreen = lazyScreen(() => import('../screens/CareerOutcomesScreen'));

const MainTabs = () => {
  const { colors: themeColors } = useTheme();
  const useSideNav = useIsWideWeb(900);
  return (
    <Tab.Navigator
      key={useSideNav ? 'desktop-tabs' : 'mobile-tabs'}
      screenOptions={({ route }) => ({
        tabBarPosition: useSideNav ? 'left' : 'bottom',
        tabBarLabelPosition: useSideNav ? 'beside-icon' : undefined,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          
          if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Cursos') iconName = focused ? 'library' : 'library-outline';
          if (route.name === 'Oportunidades') iconName = focused ? 'briefcase' : 'briefcase-outline';
          if (route.name === 'Conquistas') iconName = focused ? 'trophy' : 'trophy-outline';
          if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: useSideNav ? '#FFFFFF' : themeColors.primary,
        tabBarInactiveTintColor: themeColors.textMuted,
        tabBarActiveBackgroundColor: useSideNav ? themeColors.primary : 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarLabelStyle: useSideNav
          ? { fontSize: 12, letterSpacing: 0, fontWeight: '700' }
          : { fontSize: 9.5, letterSpacing: -0.3 },
        tabBarStyle: {
          width: useSideNav ? 164 : undefined,
          borderTopWidth: useSideNav ? 0 : 1,
          borderRightWidth: useSideNav ? 1 : 0,
          borderTopColor: themeColors.border,
          borderRightColor: themeColors.border,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: themeColors.card,
          paddingTop: useSideNav ? 18 : undefined,
          paddingBottom: useSideNav ? 18 : undefined,
        },
        tabBarItemStyle: useSideNav
          ? { paddingVertical: 10, minHeight: 58, marginHorizontal: 12, marginVertical: 5, borderRadius: 12 }
          : undefined,
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
    return <ScreenLoader label="A abrir..." />;
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
            <Stack.Screen name="CareerOutcomes" component={CareerOutcomesScreen} />
            <Stack.Screen name="CourseForum" component={CourseForumScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HowItWorksStory" component={HowItWorksStoryScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="BotAssessment" component={BotAssessmentScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
