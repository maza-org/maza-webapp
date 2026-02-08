import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { useSelfAssessment } from '@/services/self-assessment';
import { useAuthUser } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/self-assessment';
import { setOnboardingComplete } from '@/util/onboarding';
import { useTheme } from '@/contexts/ThemeContext';

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
          marginRight: 44, // Balance with back button
        },
        messagesContainer: {
          flex: 1,
          paddingHorizontal: 16,
        },
        messagesContent: {
          paddingVertical: 16,
          gap: 16,
        },
        messageBubble: {
          maxWidth: '85%',
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 20,
        },
        assistantBubble: {
          alignSelf: 'flex-start',
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          borderBottomLeftRadius: 6,
        },
        userBubble: {
          alignSelf: 'flex-end',
          backgroundColor: colors.tint,
          borderBottomRightRadius: 6,
        },
        messageText: {
          fontSize: 16,
          lineHeight: 24,
          fontFamily: 'Manrope-Regular',
        },
        assistantText: {
          color: colors.text,
        },
        userText: {
          color: '#FFFFFF',
        },
        typingIndicator: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingVertical: 14,
          paddingHorizontal: 18,
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          gap: 6,
        },
        typingDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.text,
          opacity: 0.4,
        },
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
        textInput: {
          flex: 1,
          minHeight: 44,
          maxHeight: 120,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 22,
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          color: colors.text,
          fontSize: 16,
          fontFamily: 'Manrope-Regular',
        },
        sendButton: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.tint,
          justifyContent: 'center',
          alignItems: 'center',
        },
        sendButtonDisabled: {
          opacity: 0.5,
        },
        // Loading state
        centerContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        },
        loadingText: {
          marginTop: 16,
          fontSize: 16,
          color: colors.text,
          fontFamily: 'Manrope-Regular',
        },
        // Result screen
        resultContainer: {
          flex: 1,
          paddingHorizontal: 24,
        },
        resultContent: {
          paddingVertical: 32,
        },
        resultIconContainer: {
          alignItems: 'center',
          marginBottom: 24,
        },
        resultTitle: {
          fontSize: 24,
          fontFamily: 'Manrope-Bold',
          textAlign: 'center',
          marginBottom: 24,
          color: colors.text,
        },
        resultCard: {
          backgroundColor: isDark ? '#29292E' : '#F0F0F5',
          borderRadius: 20,
          padding: 24,
          marginBottom: 32,
        },
        resultLabel: {
          fontSize: 14,
          fontFamily: 'Manrope-Medium',
          color: colors.tint,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        resultText: {
          fontSize: 16,
          lineHeight: 26,
          fontFamily: 'Manrope-Regular',
          color: colors.text,
        },
        resultFooter: {
          paddingHorizontal: 24,
          paddingVertical: 24,
        },
      }),
    [colors, isDark]
  );

  const { fromProfile } = useLocalSearchParams<{ fromProfile?: string }>();
  const isFromProfile = fromProfile === 'true';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [surveyDone, setSurveyDone] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [finalRecommendation, setFinalRecommendation] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const { data: authUser } = useAuthUser();
  const selfAssessmentMutation = useSelfAssessment();

  // Loading animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  // Start loading animations
  useEffect(() => {
    if (isInitializing) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // Pulse animation for the icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Typing dots animation
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1Anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(dot1Anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot2Anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot3Anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
        ]).start(() => animateDots());
      };
      animateDots();
    }
  }, [isInitializing]);

  // Initialize conversation on mount
  useEffect(() => {
    if (authUser?.token) {
      initializeConversation();
    }
  }, [authUser?.token]);

  const initializeConversation = async () => {
    if (!authUser?.token) return;

    try {
      const response = await selfAssessmentMutation.mutateAsync({
        token: authUser.token,
        messages: [], // Empty array to start
      });

      // Add assistant's first message
      setMessages([response.reply]);
      setSurveyDone(response.surveyDone);

      if (response.surveyDone) {
        setFinalRecommendation(response.reply.content);
      }
    } catch (error: any) {
      console.error('Error initializing self-assessment:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o assessment. Por favor, tente novamente.', [
        { text: 'Voltar', onPress: () => router.back() },
      ]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !authUser?.token || selfAssessmentMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput.trim(),
    };

    // Update local state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await selfAssessmentMutation.mutateAsync({
        token: authUser.token,
        messages: updatedMessages,
      });

      // Add assistant response
      setMessages((prev) => [...prev, response.reply]);
      setSurveyDone(response.surveyDone);

      if (response.surveyDone) {
        setFinalRecommendation(response.reply.content);
        // Mark onboarding as complete if not from profile
        if (!isFromProfile) {
          await setOnboardingComplete();
        }
      }

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Remove the user message if request failed
      setMessages(messages);
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
    // User can skip, but won't mark onboarding as complete
    // They'll be prompted again next time
    if (isFromProfile) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  // World-class loading state
  if (isInitializing) {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={themedStyles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={themedStyles.headerTitle}>Orientação de Carreira</Text>
        </View>
        <Animated.View style={[themedStyles.centerContainer, { opacity: fadeAnim }]}>
          {/* Glowing background ring */}
          <View style={loadingStyles.glowContainer}>
            <Animated.View
              style={[
                loadingStyles.glowRing,
                {
                  backgroundColor: isDark ? 'rgba(34, 172, 227, 0.08)' : 'rgba(34, 172, 227, 0.1)',
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                loadingStyles.glowRingInner,
                {
                  backgroundColor: isDark ? 'rgba(34, 172, 227, 0.15)' : 'rgba(34, 172, 227, 0.18)',
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            {/* Rotating sparkle elements */}
            <Animated.View style={[loadingStyles.sparkleContainer, { transform: [{ rotate: spin }] }]}>
              <View style={[loadingStyles.sparkle, { top: 0, left: '50%', marginLeft: -4 }]}>
                <Ionicons name="sparkles" size={16} color={colors.tint} />
              </View>
              <View style={[loadingStyles.sparkle, { bottom: 0, left: '50%', marginLeft: -4 }]}>
                <Ionicons name="star" size={12} color={colors.tint} />
              </View>
              <View style={[loadingStyles.sparkle, { left: 0, top: '50%', marginTop: -4 }]}>
                <Ionicons name="sparkles" size={14} color={colors.tint} />
              </View>
              <View style={[loadingStyles.sparkle, { right: 0, top: '50%', marginTop: -4 }]}>
                <Ionicons name="star" size={14} color={colors.tint} />
              </View>
            </Animated.View>

            {/* Main icon */}
            <Animated.View style={[loadingStyles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <View style={[loadingStyles.iconBackground, { backgroundColor: colors.tint }]}>
                <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
              </View>
            </Animated.View>
          </View>

          {/* Title and subtitle */}
          <Text style={[loadingStyles.title, { color: colors.text }]}>Preparando sua jornada</Text>
          <Text style={[loadingStyles.subtitle, { color: isDark ? '#888' : '#666' }]}>
            Nosso assistente está se preparando para te conhecer melhor
          </Text>

          {/* Animated typing indicator */}
          <View style={[loadingStyles.typingContainer, { backgroundColor: isDark ? '#29292E' : '#F0F0F5' }]}>
            <Animated.View style={[loadingStyles.typingDot, { opacity: dot1Anim, backgroundColor: colors.tint }]} />
            <Animated.View style={[loadingStyles.typingDot, { opacity: dot2Anim, backgroundColor: colors.tint }]} />
            <Animated.View style={[loadingStyles.typingDot, { opacity: dot3Anim, backgroundColor: colors.tint }]} />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Result screen when survey is done
  if (surveyDone && finalRecommendation) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.header}>
          <View style={{ width: 44 }} />
          <Text style={themedStyles.headerTitle}>Recomendação</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={themedStyles.resultContainer} showsVerticalScrollIndicator={false}>
          <View style={themedStyles.resultContent}>
            <View style={themedStyles.resultIconContainer}>
              <Ionicons name="sparkles" size={64} color={colors.tint} />
            </View>

            <Text style={themedStyles.resultTitle}>Sua Orientação de Carreira</Text>

            <View style={themedStyles.resultCard}>
              <Text style={themedStyles.resultLabel}>Recomendação</Text>
              <Text style={themedStyles.resultText}>{finalRecommendation}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={themedStyles.resultFooter}>
          <Button handle={handleComplete} text={isFromProfile ? 'Voltar ao Perfil' : 'Começar a Explorar'} />
        </View>
      </SafeAreaView>
    );
  }

  // Chat interface
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={themedStyles.messagesContainer}
          contentContainerStyle={themedStyles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                themedStyles.messageBubble,
                message.role === 'assistant' ? themedStyles.assistantBubble : themedStyles.userBubble,
              ]}
            >
              <Text
                style={[
                  themedStyles.messageText,
                  message.role === 'assistant' ? themedStyles.assistantText : themedStyles.userText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}

          {/* Typing indicator when waiting for response */}
          {selfAssessmentMutation.isPending && (
            <View style={themedStyles.typingIndicator}>
              <View style={[themedStyles.typingDot, { opacity: 0.3 }]} />
              <View style={[themedStyles.typingDot, { opacity: 0.5 }]} />
              <View style={[themedStyles.typingDot, { opacity: 0.7 }]} />
            </View>
          )}
        </ScrollView>

        <View style={themedStyles.inputContainer}>
          <TextInput
            style={themedStyles.textInput}
            placeholder="Digite sua resposta..."
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={userInput}
            onChangeText={setUserInput}
            multiline
            editable={!selfAssessmentMutation.isPending}
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              themedStyles.sendButton,
              (!userInput.trim() || selfAssessmentMutation.isPending) && themedStyles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!userInput.trim() || selfAssessmentMutation.isPending}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles for the loading screen
const loadingStyles = StyleSheet.create({
  glowContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  glowRingInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
  },
  sparkle: {
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22ACE3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Manrope-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  typingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
