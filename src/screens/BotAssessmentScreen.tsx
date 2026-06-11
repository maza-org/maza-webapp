import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Dimensions, Modal, ScrollView, Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Send, ChevronRight, CheckCircle, List } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { bottomSafeSpace } from '../utils/safeArea';

const { width } = Dimensions.get('window');

type Message = { id: string; role: 'bot' | 'user'; text: string };
type PathwayResult = {
  id: string; name: string; icon: string; color: string; description: string;
  courses: Array<{
    id: string; order: number; courseId: string; prerequisiteCourseId: string | null;
    course: { id: string; title: string; category?: { name: string; icon: string } };
  }>;
};

const PATHWAY_META: Record<string, { icon: string; color: string }> = {
  'Agronegócio': { icon: 'leaf-outline', color: '#22C55E' },
  'Alterações Climáticas e Competências Verdes': { icon: 'earth-outline', color: '#3B82F6' },
  'Competências Digitais': { icon: 'laptop-outline', color: '#8B5CF6' },
  'Competências Fundamentais': { icon: 'library-outline', color: '#F59E0B' },
  'Competências para a Vida': { icon: 'star-outline', color: '#EC4899' },
  'Competências Técnicas Digitais': { icon: 'cog-outline', color: '#6366F1' },
  'Competências Verdes': { icon: 'leaf-outline', color: '#10B981' },
  'Competências Vocacionais': { icon: 'build-outline', color: '#F97316' },
  'Educação Financeira': { icon: 'cash-outline', color: '#EF4444' },
  'Empregabilidade': { icon: 'briefcase-outline', color: '#14B8A6' },
  'Informação sobre Proteção': { icon: 'shield-checkmark-outline', color: '#0EA5E9' },
  'Modelos Inteligência Artificial': { icon: 'hardware-chip-outline', color: '#A855F7' },
};

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getPathwayMeta(pathway: { name: string; icon?: string | null; color?: string | null }) {
  const pathwayName = normalizeName(pathway.name);
  const match = Object.entries(PATHWAY_META).find(([name]) => normalizeName(name) === pathwayName);
  return match?.[1] ?? {
    icon: 'library-outline',
    color: pathway.color ?? colors.primary,
  };
}

function withPathwayMeta<T extends { name: string; icon?: string | null; color?: string | null }>(pathway: T): T & { icon: string; color: string } {
  const meta = getPathwayMeta(pathway);
  return { ...pathway, icon: meta.icon, color: meta.color };
}

export default function BotAssessmentScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [detectedPathway, setDetectedPathway] = useState<PathwayResult | null>(null);
  const [completing, setCompleting] = useState(false);
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [apiPathways, setApiPathways] = useState<any[]>([]);
  const [msgCount, setMsgCount] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const completingRef = useRef(false);

  // Auto-send greeting on mount. The backend sends metadata only on a new session.
  useEffect(() => {
    sendMessage('Olá', true);
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const addMessage = (role: 'bot' | 'user', text: string) => {
    const msg: Message = { id: `${Date.now()}-${Math.random()}`, role, text };
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const showReveal = (pathway: PathwayResult) => {
    setDetectedPathway(pathway);
    setTimeout(() => {
      Animated.spring(revealAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 10 }).start();
    }, 400);
  };

  const sendMessage = async (text: string, isFirst = false) => {
    if (!text.trim()) return;
    if (!isFirst) addMessage('user', text);
    setInput('');
    setLoading(true);
    const newCount = msgCount + 1;
    setMsgCount(newCount);

    try {
      const res = await api.post('/bot/chat', {
        message: text,
        isFirst: isFirst || isFirstMessage,
      }, { timeout: 35000 });
      const { output, pathwayDetected, pathway, sessionId: sid } = res.data;
      if (sid) setSessionId(sid);
      if (isFirstMessage) setIsFirstMessage(false);
      addMessage('bot', output);

      if (pathwayDetected && pathway) {
        showReveal(withPathwayMeta(pathway));
      }
    } catch (err: any) {
      addMessage('bot', 'Estou com dificuldade em contactar o assistente neste momento. Tente enviar a resposta novamente.');
      console.error('[BotChat]', err?.response?.data ?? err.message);
    }
    setLoading(false);
  };

  const handleSend = () => {
    if (loading || !input.trim()) return;
    sendMessage(input.trim());
  };

  // Load pathways from API when user opens manual picker
  const openManualPicker = async () => {
    if (apiPathways.length === 0) {
      try {
        const res = await api.get('/pathways');
        setApiPathways(res.data);
      } catch {}
    }
    setShowManualPicker(true);
  };

  // Manual pathway selection using real API ID
  const handleManualSelect = async (pathway: any) => {
    setShowManualPicker(false);
    setLoading(true);
    try {
      const detail = await api.get(`/pathways/${pathway.id}`);
      showReveal(withPathwayMeta(detail.data));
      addMessage('bot', `Perfeito! A jornada "${pathway.name}" foi selecionada. Toque em "Começar Jornada" para iniciar.`);
    } catch {
      addMessage('bot', 'Não consegui carregar essa jornada agora. Tente novamente.');
    }
    setLoading(false);
  };
  const handleStartPathway = async () => {
    if (!detectedPathway || completingRef.current) return;
    completingRef.current = true;
    setCompleting(true);
    try {
      const firstOpenCourse = detectedPathway.courses?.find((pc) => !pc.prerequisiteCourseId)
        ?? detectedPathway.courses?.[0];
      const res = await api.post('/bot/complete', {
        pathwayId: detectedPathway.id,
        botSessionId: sessionId,
        pathwayData: { pathwayName: detectedPathway.name, sessionId, assignedAt: new Date().toISOString() },
      });
      let updatedUser = res.data.user;
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data) updatedUser = meRes.data;
      } catch {}
      const safeUser = updatedUser ?? user;

      navigation.reset({
        index: firstOpenCourse?.courseId ? 1 : 0,
        routes: [
          { name: 'Main', params: { screen: 'Cursos' } },
          ...(firstOpenCourse?.courseId
            ? [{ name: 'CourseDetail', params: { courseId: firstOpenCourse.courseId, title: firstOpenCourse.course?.title, course: firstOpenCourse.course } }]
            : []),
        ],
      });

      if (safeUser) {
        await updateUser({
          ...safeUser,
          profile: {
            totalPoints: safeUser.profile?.totalPoints ?? 0,
            currentStreak: safeUser.profile?.currentStreak ?? 0,
            rank: safeUser.profile?.rank ?? 'Calouro',
            assessmentDone: true,
            botSessionId: sessionId ?? safeUser.profile?.botSessionId ?? null,
          },
        });
      }
    } catch (err: any) {
      console.error('[BotComplete]', err?.response?.data ?? err.message);
      addMessage('bot', 'Não consegui iniciar a jornada agora. Tente novamente.');
    } finally {
      completingRef.current = false;
      setCompleting(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isBot = item.role === 'bot';
    return (
      <View style={[styles.msgRow, isBot ? styles.msgRowBot : styles.msgRowUser]}>
        {isBot && <View style={styles.botAvatar}><Ionicons name="hardware-chip-outline" size={16} color={colors.primary} /></View>}
        <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
          <Text style={[styles.bubbleText, isBot ? styles.bubbleTextBot : styles.bubbleTextUser]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}><Ionicons name="hardware-chip-outline" size={22} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Assistente MAZA</Text>
          <Text style={styles.headerSub}>Avaliação de percurso de aprendizagem</Text>
        </View>
        {/* Manual select always available */}
        {!detectedPathway && (
          <TouchableOpacity style={styles.manualBtn} onPress={openManualPicker}>
            <List size={14} color={colors.primary} />
            <Text style={styles.manualBtnText}>Escolher</Text>
          </TouchableOpacity>
        )}
        <View style={styles.onlineDot} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.chatContent,
            { paddingBottom: detectedPathway ? 260 : keyboardVisible ? 96 : Math.max(insets.bottom + 96, 120) },
          ]}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={loading ? (
            <View style={styles.typingRow}>
              <View style={styles.botAvatar}><Ionicons name="hardware-chip-outline" size={16} color={colors.primary} /></View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>a pensar...</Text>
              </View>
            </View>
          ) : null}
        />

        {/* Pathway Reveal Card */}
        {detectedPathway && (
          <Animated.View style={[styles.pathwayCard, {
            opacity: revealAnim,
            transform: [{ translateY: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
            marginBottom: keyboardVisible ? 12 : bottomSafeSpace(insets.bottom, 12)
          }]}>
            <View style={[styles.pathwayHeader, { backgroundColor: detectedPathway.color + '18' }]}>
              <Ionicons name={detectedPathway.icon as any ?? 'library-outline'} size={38} color={detectedPathway.color} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.pathwayLabel}><Ionicons name="sparkles-outline" size={11} color={colors.textMuted}/> Jornada Recomendada</Text>
                <Text style={[styles.pathwayName, { color: detectedPathway.color }]}>{detectedPathway.name}</Text>
                {detectedPathway.description ? (
                  <Text style={styles.pathwayDesc}>{detectedPathway.description}</Text>
                ) : null}
              </View>
            </View>

            {detectedPathway.courses?.length > 0 && (
              <View style={styles.courseList}>
                <Text style={styles.courseListTitle}>Cursos nesta jornada</Text>
                {detectedPathway.courses.slice(0, 5).map((pc, i) => (
                  <View key={pc.id} style={styles.courseItem}>
                    <View style={[styles.courseNum, { backgroundColor: pc.prerequisiteCourseId ? '#E2E8F0' : detectedPathway.color }]}>
                      <Text style={[styles.courseNumText, { color: pc.prerequisiteCourseId ? '#94A3B8' : colors.white }]}>{i + 1}</Text>
                    </View>
                    <Text style={styles.courseName} numberOfLines={1}>{pc.course.title}</Text>
                    {pc.prerequisiteCourseId
                      ? <Ionicons name="lock-closed-outline" size={14} color="#94A3B8" />
                      : <CheckCircle size={13} color={detectedPathway.color} />
                    }
                  </View>
                ))}
                {detectedPathway.courses.length > 5 && (
                  <Text style={styles.moreCourses}>+{detectedPathway.courses.length - 5} mais cursos</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: detectedPathway.color }, completing && { opacity: 0.6 }]}
              onPress={handleStartPathway}
              disabled={completing}
            >
              {completing ? <ActivityIndicator color={colors.white} /> : (
                <>
                  <Text style={styles.startBtnText}>Começar Jornada</Text>
                  <ChevronRight size={20} color={colors.white} />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Input bar */}
        {!detectedPathway && (
          <View style={[styles.inputBar, { paddingBottom: keyboardVisible ? 8 : bottomSafeSpace(insets.bottom, 8) }]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder=""
              placeholderTextColor={colors.textMuted}
              multiline={false}
              maxLength={500}
              editable={!loading}
              returnKeyType="send"
              blurOnSubmit={false}
              onFocus={() => setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120)}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Send size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Manual Pathway Picker Modal */}
      <Modal visible={showManualPicker} transparent animationType="slide" onRequestClose={() => setShowManualPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: bottomSafeSpace(insets.bottom, 20) }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Escolher Jornada</Text>
            <Text style={styles.modalSub}>Selecione manualmente a sua jornada de aprendizagem</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(apiPathways.length > 0 ? apiPathways : Object.entries(PATHWAY_META).map(([name, m]) => ({ id: name, name, ...m }))).map((p: any) => {
                const meta = PATHWAY_META[p.name] ?? { icon: p.icon ?? 'library-outline', color: p.color ?? colors.primary };
                return (
                  <TouchableOpacity key={p.id} style={styles.pwOption} onPress={() => handleManualSelect(p)}>
                    <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                    <Text style={styles.pwOptionName}>{p.name}</Text>
                    <ChevronRight size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowManualPicker(false)}>
              <Text style={styles.modalCloseTxt}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  headerAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  headerSub: { fontSize: 11, color: colors.textMuted },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  manualBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: colors.primary + '40',
  },
  manualBtnText: { color: colors.primary, fontSize: 11, fontWeight: '700' },

  chatContent: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  msgRowBot: { justifyContent: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 8, flexShrink: 0,
  },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 18 },
  bubbleBot: { backgroundColor: colors.white, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextBot: { color: colors.text },
  bubbleTextUser: { color: colors.white },
  typingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4,
  },
  typingText: { color: colors.textMuted, fontSize: 13 },

  // Pathway card
  pathwayCard: {
    margin: 12, backgroundColor: colors.white, borderRadius: 20,
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  pathwayHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 },
  pathwayIcon: { fontSize: 38 },
  pathwayLabel: { fontSize: 11, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  pathwayName: { fontSize: 18, fontWeight: 'bold', lineHeight: 24 },
  pathwayDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 17 },
  courseList: { paddingHorizontal: 16, paddingBottom: 4 },
  courseListTitle: { fontSize: 12, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  courseItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: 10,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  courseNum: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  courseNumText: { fontSize: 11, fontWeight: 'bold' },
  courseName: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.text },
  lockIcon: { fontSize: 12 },
  moreCourses: { fontSize: 11, color: colors.textMuted, textAlign: 'center', paddingVertical: 5 },
  startBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    margin: 14, paddingVertical: 14, borderRadius: 30, gap: 8,
  },
  startBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },

  // Input
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10,
    backgroundColor: colors.white, borderTopWidth: 1, borderColor: colors.border,
  },
  input: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 24, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 15, color: colors.text, maxHeight: 100,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnOff: { opacity: 0.35 },

  // Manual picker modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32, maxHeight: '85%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  modalSub: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  pwOption: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 6, backgroundColor: '#F8FAFC', gap: 12,
  },
  pwOptionIcon: { fontSize: 22 },
  pwOptionName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  modalCloseBtn: { marginTop: 8, paddingVertical: 14, borderRadius: 30, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCloseTxt: { color: colors.textMuted, fontWeight: '600', fontSize: 15 },
});
