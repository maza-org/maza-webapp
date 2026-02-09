import { useState, useRef, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { useSelfAssessment, useInitSelfAssessment } from '@/services/self-assessment';
import { useAuthUser } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/self-assessment';
import { setOnboardingComplete } from '@/util/onboarding';
import { useTheme } from '@/contexts/ThemeContext';
import LoadingScreen from '@/app/components/self-assessment/LoadingScreen';
import ResultScreen from '@/app/components/self-assessment/ResultScreen';
import MessageBubble from '@/app/components/self-assessment/MessageBubble';
import TypingIndicator from '@/app/components/self-assessment/TypingIndicator';
import ChatInput from '@/app/components/self-assessment/ChatInput';

export default function SelfAssessmentScreen() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        backButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        headerTitle: {
          flex: 1,
          fontSize: 18,
          fontFamily: 'Manrope-Bold',
          color: colors.text,
          textAlign: 'center',
          marginRight: 44,
        },
        messagesContainer: {
          flex: 1,
          paddingHorizontal: 16,
        },
        messagesContent: {
          paddingVertical: 16,
          gap: 16,
        },
      }),
    [colors, isDark]
  );

  const { fromProfile } = useLocalSearchParams<{ fromProfile?: string }>();
  const isFromProfile = fromProfile === 'true';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [surveyDone, setSurveyDone] = useState(false);
  const [finalRecommendation, setFinalRecommendation] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const { data: authUser } = useAuthUser();

  const { data: initData, isLoading: isInitializing, error: initError } = useInitSelfAssessment(authUser?.token);

  const selfAssessmentMutation = useSelfAssessment();

  useEffect(() => {
    if (initData) {
      setMessages([initData.reply]);
      setSurveyDone(initData.surveyDone);
      if (initData.surveyDone) {
        setFinalRecommendation(initData.reply.content);
      }
    }
  }, [initData]);

  useEffect(() => {
    if (initError) {
      Alert.alert('Erro', 'Não foi possível iniciar o assessment. Por favor, tente novamente.', [
        { text: 'Voltar', onPress: () => router.back() },
      ]);
    }
  }, [initError]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !authUser?.token || selfAssessmentMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput.trim(),
    };

    const optimisticMessages = [...messages, userMessage];
    setMessages(optimisticMessages);
    const previousInput = userInput;
    setUserInput('');

    try {
      const response = await selfAssessmentMutation.mutateAsync({
        token: authUser.token,
        messages: optimisticMessages,
      });

      setMessages((prev) => [...prev, response.reply]);
      setSurveyDone(response.surveyDone);

      if (response.surveyDone) {
        setFinalRecommendation(response.reply.content);
        if (!isFromProfile) {
          await setOnboardingComplete();
        }
      }
    } catch (error: any) {
      setMessages(messages);
      setUserInput(previousInput);
      Alert.alert('Erro', 'Falha ao enviar mensagem. Por favor, tente novamente.');
    }
  };

  const handleComplete = () => {
    if (isFromProfile) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    if (isFromProfile) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (isInitializing) {
    return (
      <LoadingScreen
        isDark={isDark}
        colors={colors}
        backButtonStyles={themedStyles.backButton}
        headerTitleStyles={themedStyles.headerTitle}
        headerStyles={themedStyles.header}
      />
    );
  }

  if (surveyDone && finalRecommendation) {
    return (
      <ResultScreen
        finalRecommendation={finalRecommendation}
        onComplete={handleComplete}
        isFromProfile={isFromProfile}
        colors={colors}
        isDark={isDark}
        headerTitleStyles={themedStyles.headerTitle}
        headerStyles={themedStyles.header}
      />
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={themedStyles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Orientação de Carreira</Text>
        {!isFromProfile && (
          <TouchableOpacity onPress={handleSkip} style={{ width: 44, alignItems: 'center' }}>
            <Text style={{ color: colors.tint, fontFamily: 'Manrope-Medium', fontSize: 14 }}>Pular</Text>
          </TouchableOpacity>
        )}
        {isFromProfile && <View style={{ width: 44 }} />}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={themedStyles.messagesContainer}
          contentContainerStyle={themedStyles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <MessageBubble key={`${message.role}-${index}`} message={message} isDark={isDark} colors={colors} />
          ))}

          {selfAssessmentMutation.isPending && <TypingIndicator isDark={isDark} colors={colors} />}
        </ScrollView>

        <ChatInput
          value={userInput}
          onChangeText={setUserInput}
          onSend={handleSendMessage}
          isLoading={selfAssessmentMutation.isPending}
          isDark={isDark}
          colors={colors}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
