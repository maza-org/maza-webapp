import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AppState, Linking, Platform } from 'react-native';

import api from './api';

const REMINDER_IDS_KEY = 'maza_course_reminder_ids';
const REMINDER_PREFS_KEY = 'maza_notif_prefs';
const PERMISSION_PROMPTED_KEY = 'maza_notification_permission_prompted';
const LAST_RESPONSE_KEY = 'maza_last_notification_response';
const CHANNEL_ID = 'course-reminders';

type CourseReminder = {
  courseId: string;
  title: string;
  progress: number;
};

const REMINDERS = [
  { seconds: 24 * 60 * 60, title: 'Continua de onde paraste' },
  { seconds: 3 * 24 * 60 * 60, title: 'Um pequeno passo hoje' },
  { seconds: 7 * 24 * 60 * 60, title: 'O teu curso está à tua espera' },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function readReminderIds() {
  try {
    const value = JSON.parse(await AsyncStorage.getItem(REMINDER_IDS_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function cancelCourseReminders() {
  if (Platform.OS === 'web') return;
  const ids = await readReminderIds();
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await AsyncStorage.removeItem(REMINDER_IDS_KEY);
}

async function remindersEnabled() {
  try {
    const prefs = JSON.parse(await AsyncStorage.getItem(REMINDER_PREFS_KEY) ?? '{}');
    return prefs.courseReminders !== false;
  } catch {
    return true;
  }
}

async function ensurePermission({ prompt }: { prompt: boolean }) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de cursos',
      description: 'Lembretes para continuar cursos que ainda não terminou.',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      lightColor: '#1CABE2',
    });
  }

  let permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted && permissions.canAskAgain && prompt) {
    permissions = await Notifications.requestPermissionsAsync();
    await AsyncStorage.setItem(PERMISSION_PROMPTED_KEY, 'true');
  }
  return permissions.granted;
}

async function getIncompleteCourse(): Promise<CourseReminder | null> {
  try {
    const response = await api.get('/notifications');
    const item = (response.data ?? []).find((candidate: any) => candidate?.type === 'COURSE_REMINDER');
    if (!item?.params?.courseId) return null;
    const match = String(item.message ?? '').match(/(\d+(?:[.,]\d+)?)%/);
    return {
      courseId: String(item.params.courseId),
      title: String(item.params.title ?? 'o teu curso'),
      progress: match ? Math.round(Number(match[1].replace(',', '.'))) : 0,
    };
  } catch {
    return null;
  }
}

async function scheduleCourseReminders(course: CourseReminder) {
  await cancelCourseReminders();
  if (!(await remindersEnabled()) || !(await ensurePermission({ prompt: false }))) return;

  const ids: string[] = [];
  for (const reminder of REMINDERS) {
    const progressText = course.progress > 0 ? ` Já concluíste ${course.progress}%.` : '';
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: `${course.title} ainda não terminou.${progressText} Retoma a próxima aula.`,
        data: {
          route: 'CourseDetail',
          courseId: course.courseId,
          title: course.title,
          url: `maza://curso/${course.courseId}`,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: reminder.seconds,
        repeats: false,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
    });
    ids.push(id);
  }
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify(ids));
}

async function promptForReminderPermissionOnce() {
  if (!(await remindersEnabled())) return;
  const prompted = await AsyncStorage.getItem(PERMISSION_PROMPTED_KEY);
  if (prompted) return;
  await ensurePermission({ prompt: true });
}

async function openNotificationResponse(response: Notifications.NotificationResponse | null | undefined) {
  if (!response) return;
  const identifier = response.notification.request.identifier;
  if (await AsyncStorage.getItem(LAST_RESPONSE_KEY) === identifier) return;

  const data = response.notification.request.content.data as Record<string, unknown>;
  const url = typeof data?.url === 'string' ? data.url : null;
  if (!url) return;

  await AsyncStorage.setItem(LAST_RESPONSE_KEY, identifier);
  await Linking.openURL(url).catch(() => undefined);
}

export function startCourseReminderLifecycle() {
  if (Platform.OS === 'web') return () => {};

  let active = true;
  let currentCourse: CourseReminder | null = null;

  const refresh = async () => {
    await cancelCourseReminders();
    await promptForReminderPermissionOnce();
    const course = await getIncompleteCourse();
    if (active) currentCourse = course;
  };

  void refresh();
  void Notifications.getLastNotificationResponseAsync().then(openNotificationResponse);
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(openNotificationResponse);
  const appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void refresh();
    } else if (state === 'background' && currentCourse) {
      void scheduleCourseReminders(currentCourse);
    }
  });

  return () => {
    active = false;
    responseSubscription.remove();
    appStateSubscription.remove();
  };
}

export async function updateCourseReminderPreference(enabled: boolean) {
  if (!enabled) {
    await cancelCourseReminders();
    return false;
  }
  return ensurePermission({ prompt: true });
}
