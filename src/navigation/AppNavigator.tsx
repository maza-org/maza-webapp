import React, { useEffect, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';
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
          ? { fontSize: 13, letterSpacing: 0, fontWeight: '700' }
          : { fontSize: 9.5, letterSpacing: -0.3 },
        tabBarStyle: {
          width: useSideNav ? 216 : undefined,
          borderTopWidth: useSideNav ? 0 : 1,
          borderRightWidth: useSideNav ? 1 : 0,
          borderTopColor: themeColors.border,
          borderRightColor: themeColors.border,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: themeColors.card,
          paddingTop: useSideNav ? 24 : undefined,
          paddingBottom: useSideNav ? 24 : undefined,
        },
        tabBarItemStyle: useSideNav
          ? { paddingVertical: 11, minHeight: 58, marginHorizontal: 14, marginVertical: 5, borderRadius: 14 }
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
  const isAuthenticated = !!user;
  const assessmentDone = user?.profile?.assessmentDone ?? false;

  const linking = useMemo(() => {
    if (Platform.OS !== 'web') return undefined;

    const prefixes = [globalThis.location?.origin ?? 'https://web.mazas.org'];
    const screens = !isAuthenticated
      ? {
          Login: '',
          Register: 'registar',
          OtpVerification: 'confirmar-sms',
          ForgotPassword: 'recuperar-senha',
          ResetPassword: 'nova-senha',
          CourseDetail: 'curso/:courseId',
        }
      : !assessmentDone
        ? {
            BotAssessment: '',
            Main: 'inicio',
            CourseDetail: 'curso/:courseId',
          }
        : {
            Main: '',
            CourseDetail: 'curso/:courseId',
            ImpactAssessment: 'curso/:courseId/avaliacao',
            LessonViewer: 'curso/:courseId/aula/:lessonId',
            JobDetail: 'oportunidades/:jobId',
            MyCertificates: 'certificados',
            NotificationsInbox: 'notificacoes',
            Notificacoes: 'preferencias/notificacoes',
            Configuracoes: 'definicoes',
            EditProfile: 'perfil/editar',
            ChangePassword: 'perfil/mudar-senha',
            CareerOutcomes: 'resultados-profissionais',
            CourseForum: 'curso/:courseId/comunidade',
            HowItWorksStory: 'como-funciona',
            BotAssessment: 'avaliacao-inicial',
          };

    return { prefixes, config: { screens } } as any;
  }, [assessmentDone, isAuthenticated]);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  if (loading) {
    return <ScreenLoader label="A abrir..." />;
  }

  return (
    <NavigationContainer
      linking={linking}
      documentTitle={Platform.OS === 'web' ? {
        formatter: (options, route) => `Maza | ${options?.title ?? route?.name ?? 'Aprender'}`,
      } : undefined}
    >
      <Stack.Navigator
        key={!user ? 'guest' : 'auth'}
        initialRouteName={!user ? 'Login' : undefined}
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          // ── Not logged in ────────────────────────────────────
          <>
            {Platform.OS !== 'web' && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
            {Platform.OS !== 'web' && <Stack.Screen name="HowItWorksStory" component={HowItWorksStoryScreen} options={{ headerShown: false }} />}
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registar' }} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ title: 'Código SMS' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar senha' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nova senha' }} />
            {Platform.OS === 'web' && (
              <Stack.Screen
                name="CourseDetail"
                component={CourseDetailScreen}
                options={({ route }: any) => ({ title: route.params?.title ?? 'Curso' })}
              />
            )}
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
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={({ route }: any) => ({ title: route.params?.title ?? 'Curso' })}
            />
          </>
        ) : (
          // ── Logged in + assessment done ───────────────────────
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={({ route }: any) => ({ title: route.params?.title ?? 'Curso' })}
            />
            <Stack.Screen name="ImpactAssessment" component={ImpactAssessmentScreen} options={{ title: 'Avaliação do curso' }} />
            <Stack.Screen name="LessonViewer" component={LessonViewerScreen} options={{ headerShown: false, title: 'Aula' }} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Oportunidade' }} />
            <Stack.Screen name="MyCertificates" component={MyCertificatesScreen} options={{ title: 'Certificados' }} />
            <Stack.Screen name="NotificationsInbox" component={NotificationsInboxScreen} options={{ title: 'Notificações' }} />
            <Stack.Screen name="Notificacoes" component={NotificacoesScreen} options={{ title: 'Preferências de notificações' }} />
            <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Definições' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Mudar senha' }} />
            <Stack.Screen name="CareerOutcomes" component={CareerOutcomesScreen} options={{ title: 'Resultados profissionais' }} />
            <Stack.Screen name="CourseForum" component={CourseForumScreen} options={{ headerShown: false, title: 'Comunidade do curso' }} />
            <Stack.Screen name="HowItWorksStory" component={HowItWorksStoryScreen} options={{ presentation: 'fullScreenModal', headerShown: false, title: 'Como funciona' }} />
            <Stack.Screen name="BotAssessment" component={BotAssessmentScreen} options={{ title: 'Avaliação inicial' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
