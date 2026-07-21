import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuizRenderer from '../components/QuizRenderer';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

type ImpactType = 'BASELINE' | 'ENDLINE';

export default function ImpactAssessmentScreen({ route, navigation }: any) {
  const { courseId, type = 'BASELINE', assessment: initialAssessment } = route.params ?? {};
  const impactType: ImpactType = String(type).toUpperCase() === 'ENDLINE' ? 'ENDLINE' : 'BASELINE';
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [assessment, setAssessment] = useState<any>(initialAssessment ?? null);
  const [loading, setLoading] = useState(!initialAssessment);
  const [completeMessage, setCompleteMessage] = useState<string | null>(null);

  const returnToCourse = () => {
    if (courseId) {
      navigation.replace('CourseDetail', { courseId });
      return;
    }
    if (navigation.canGoBack()) navigation.goBack();
  };

  const loadAssessment = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/impact/courses/${courseId}`);
      setAssessment(impactType === 'ENDLINE' ? res.data.endline : res.data.baseline);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a avaliação.');
    } finally {
      setLoading(false);
    }
  }, [courseId, impactType]);

  useEffect(() => {
    if (!initialAssessment) loadAssessment();
  }, [initialAssessment, loadAssessment]);

  const finish = (result?: any) => {
    const impact = result?.impact;
    const message = impact?.impactPercent !== null && impact?.impactPercent !== undefined
      ? `Melhoria de aprendizagem calculada: ${impact.impactPercent}%`
      : impactType === 'BASELINE'
        ? 'Avaliação inicial guardada. Pode começar o curso.'
        : 'Avaliação final guardada.';
    setCompleteMessage(message);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!assessment?.id || !assessment?.questions?.length) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.empty, { color: colors.text }]}>Avaliação não configurada.</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={returnToCourse}>
          <Text style={styles.backButtonText}>Voltar ao curso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={returnToCourse} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {impactType === 'BASELINE' ? 'Avaliação Inicial' : 'Avaliação Final'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {impactType === 'BASELINE' ? 'Obrigatória antes de começar' : 'Obrigatória para medir a melhoria'}
          </Text>
        </View>
      </View>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          {impactType === 'BASELINE'
            ? 'Esta avaliação não é para passar ou chumbar. Serve para perceber o seu ponto de partida antes de começar a aprender.'
            : 'Esta avaliação mede a sua evolução depois do curso. Não é para castigar; ajuda a medir a melhoria real da aprendizagem.'}
        </Text>
      </View>
      <QuizRenderer
        quiz={{ id: assessment.id, timeLimit: assessment.timeLimit, questions: assessment.questions }}
        submitEndpoint={`/impact/assessments/${assessment.id}/submit`}
        mode="impact"
        onComplete={finish}
      />
      <Modal visible={!!completeMessage} transparent animationType="fade" onRequestClose={returnToCourse}>
        <View style={styles.modalOverlay}>
          <View style={[styles.completeModal, { backgroundColor: colors.card }]}>
            <View style={[styles.completeIcon, { backgroundColor: `${colors.primary}18` }]}>
              <Ionicons name="checkmark-circle-outline" size={34} color={colors.primary} />
            </View>
            <Text style={[styles.completeTitle, { color: colors.text }]}>Concluído</Text>
            <Text style={[styles.completeText, { color: colors.textMuted }]}>{completeMessage}</Text>
            <TouchableOpacity style={[styles.completeButton, { backgroundColor: colors.primary }]} onPress={returnToCourse}>
              <Text style={styles.completeButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  infoCard: { margin: 12, padding: 12, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  empty: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  backButton: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24 },
  backButtonText: { color: '#fff', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  completeModal: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, elevation: 8 },
  completeIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  completeTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  completeText: { fontSize: 16, lineHeight: 23, textAlign: 'center', marginBottom: 22 },
  completeButton: { alignSelf: 'stretch', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  completeButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
