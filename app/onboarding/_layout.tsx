import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function OnboardingLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="survey" />
      <Stack.Screen name="self-assessment" />
    </Stack>
  );
}
