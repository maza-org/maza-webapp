import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BriefcaseBusiness, ChevronLeft, Edit3, Plus, Sprout } from 'lucide-react-native';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { bottomSafeSpace } from '../utils/safeArea';

const TYPES = [
  { value: 'INTERNSHIP', label: 'Estágio' },
  { value: 'EMPLOYMENT', label: 'Emprego' },
  { value: 'SELF_EMPLOYMENT', label: 'Trabalho por conta própria' },
];
const CONTRIBUTIONS = [
  { value: 'HIGH', label: 'Contribuiu muito' },
  { value: 'PARTIAL', label: 'Contribuiu em parte' },
  { value: 'LOW', label: 'Contribuiu pouco' },
  { value: 'NONE', label: 'Não contribuiu' },
];

export default function CareerOutcomesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState('EMPLOYMENT');
  const [contribution, setContribution] = useState('PARTIAL');
  const [roleTitle, setRoleTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [businessForm, setBusinessForm] = useState('INFORMAL');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setSummary((await api.get('/career-outcomes/me')).data); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openForm = (outcome?: any) => {
    setEditing(outcome ?? null);
    setType(outcome?.type ?? 'EMPLOYMENT');
    setContribution(outcome?.contribution ?? 'PARTIAL');
    setRoleTitle(outcome?.roleTitle ?? '');
    setOrganization(outcome?.organization ?? outcome?.businessName ?? '');
    setBusinessForm(outcome?.businessForm ?? 'INFORMAL');
    setFormOpen(true);
  };

  const saveOutcome = async () => {
    setSaving(true);
    try {
      const payload = {
        type, contribution, roleTitle: roleTitle.trim() || null,
        organization: type === 'SELF_EMPLOYMENT' ? null : organization.trim() || null,
        businessName: type === 'SELF_EMPLOYMENT' ? organization.trim() || null : null,
        businessForm: type === 'SELF_EMPLOYMENT' ? businessForm : null,
      };
      if (editing) await api.patch(`/career-outcomes/${editing.id}`, payload);
      else if (summary?.dueMilestone) await api.post('/career-outcomes/follow-ups', {
        milestoneDays: summary.dueMilestone, status: 'OUTCOME_REPORTED', outcome: payload,
      });
      else await api.post('/career-outcomes', payload);
      setFormOpen(false);
      await load();
    } catch (error: any) {
      Alert.alert('Não foi possível guardar', error?.response?.data?.error ?? 'Tente novamente.');
    } finally { setSaving(false); }
  };

  const answerWithoutOutcome = async (status: string) => {
    if (!summary?.dueMilestone) return;
    await api.post('/career-outcomes/follow-ups', { milestoneDays: summary.dueMilestone, status });
    await load();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <View style={{ flex: 1 }}><Text style={[styles.title, { color: colors.text }]}>Resultados profissionais</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>A sua evolução depois dos cursos MAZA</Text></View>
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomSafeSpace(insets.bottom, 32) }}>
          {summary?.dueMilestone && !formOpen ? (
            <View style={[styles.prompt, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={[styles.promptEyebrow, { color: colors.primary }]}>ACOMPANHAMENTO DE {summary.dueMilestone} DIAS</Text>
              <Text style={[styles.promptTitle, { color: colors.text }]}>Desde a sua certificação, conseguiu uma nova oportunidade profissional?</Text>
              <Text style={[styles.promptText, { color: colors.textMuted }]}>Pode indicar um estágio, emprego ou trabalho por conta própria.</Text>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => openForm()}><Text style={styles.primaryButtonText}>Sim, registar resultado</Text></TouchableOpacity>
              <View style={styles.secondaryChoices}>
                <TouchableOpacity onPress={() => answerWithoutOutcome('NONE')}><Text style={[styles.link, { color: colors.textMuted }]}>Ainda não</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => answerWithoutOutcome('PRE_EXISTING')}><Text style={[styles.link, { color: colors.textMuted }]}>Já tinha antes</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => answerWithoutOutcome('PREFER_NOT')}><Text style={[styles.link, { color: colors.textMuted }]}>Prefiro não responder</Text></TouchableOpacity>
              </View>
            </View>
          ) : null}

          {formOpen ? (
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{editing ? 'Editar resultado' : 'Novo resultado profissional'}</Text>
              <Text style={[styles.label, { color: colors.textMuted }]}>Tipo de resultado</Text>
              <View style={styles.chips}>{TYPES.map((item) => <TouchableOpacity key={item.value} style={[styles.chip, { borderColor: type === item.value ? colors.primary : colors.border, backgroundColor: type === item.value ? colors.primary + '15' : colors.background }]} onPress={() => setType(item.value)}><Text style={{ color: type === item.value ? colors.primary : colors.text }}>{item.label}</Text></TouchableOpacity>)}</View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{type === 'SELF_EMPLOYMENT' ? 'Atividade ou negócio' : 'Cargo ou função'}</Text>
              <TextInput value={roleTitle} onChangeText={setRoleTitle} placeholder={type === 'SELF_EMPLOYMENT' ? 'Ex.: Produção agrícola' : 'Ex.: Assistente administrativo'} placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
              <Text style={[styles.label, { color: colors.textMuted }]}>{type === 'SELF_EMPLOYMENT' ? 'Nome do negócio (opcional)' : 'Organização (opcional)'}</Text>
              <TextInput value={organization} onChangeText={setOrganization} placeholder="Nome" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
              {type === 'SELF_EMPLOYMENT' ? <View style={[styles.chips, styles.businessFormChips]}>{['FORMAL', 'INFORMAL'].map((value) => <TouchableOpacity key={value} style={[styles.chip, { borderColor: businessForm === value ? colors.primary : colors.border, backgroundColor: businessForm === value ? colors.primary + '15' : colors.background }]} onPress={() => setBusinessForm(value)}><Text style={{ color: businessForm === value ? colors.primary : colors.text }}>{value === 'FORMAL' ? 'Registado' : 'Não registado'}</Text></TouchableOpacity>)}</View> : null}
              <Text style={[styles.label, { color: colors.textMuted }]}>Quanto o MAZA contribuiu?</Text>
              <View style={styles.chips}>{CONTRIBUTIONS.map((item) => <TouchableOpacity key={item.value} style={[styles.chip, { borderColor: contribution === item.value ? colors.primary : colors.border }]} onPress={() => setContribution(item.value)}><Text style={{ color: contribution === item.value ? colors.primary : colors.text }}>{item.label}</Text></TouchableOpacity>)}</View>
              <View style={styles.formActions}><TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => setFormOpen(false)}><Text style={{ color: colors.text }}>Cancelar</Text></TouchableOpacity><TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={saveOutcome} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Guardar</Text>}</TouchableOpacity></View>
            </View>
          ) : null}

          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>O seu histórico</Text><TouchableOpacity style={styles.addButton} onPress={() => openForm()}><Plus size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '700' }}>Adicionar</Text></TouchableOpacity></View>
          {(summary?.outcomes ?? []).length === 0 ? <View style={[styles.empty, { backgroundColor: colors.card }]}><Sprout size={28} color={colors.textMuted} /><Text style={[styles.emptyTitle, { color: colors.text }]}>Ainda sem resultados registados</Text><Text style={[styles.emptyText, { color: colors.textMuted }]}>Quando surgir uma oportunidade, poderá registá-la aqui.</Text></View> : (summary.outcomes.map((item: any) => {
            const typeLabel = TYPES.find((option) => option.value === item.type)?.label ?? item.type;
            const contributionLabel = CONTRIBUTIONS.find((option) => option.value === item.contribution)?.label ?? item.contribution;
            return <View key={item.id} style={[styles.outcomeCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.outcomeIcon, { backgroundColor: colors.primary + '15' }]}><BriefcaseBusiness size={20} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.outcomeTitle, { color: colors.text }]}>{item.roleTitle || typeLabel}</Text><Text style={[styles.outcomeMeta, { color: colors.textMuted }]}>{typeLabel}{item.organization || item.businessName ? ` · ${item.organization || item.businessName}` : ''}</Text><Text style={[styles.contribution, { color: colors.primary }]}>{contributionLabel}</Text></View><TouchableOpacity style={styles.iconButton} onPress={() => openForm(item)}><Edit3 size={18} color={colors.textMuted} /></TouchableOpacity></View>;
          }))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 }, iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 20, fontWeight: '700' }, subtitle: { fontSize: 12, marginTop: 2 },
  prompt: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 22 }, promptEyebrow: { fontSize: 11, fontWeight: '800', marginBottom: 8 }, promptTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' }, promptText: { fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 16 }, primaryButton: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' }, primaryButtonText: { color: '#fff', fontWeight: '700' }, secondaryChoices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: 14 }, link: { fontSize: 12, textDecorationLine: 'underline' },
  formCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 22 }, sectionTitle: { fontSize: 17, fontWeight: '700' }, label: { fontSize: 12, fontWeight: '600', marginTop: 16, marginBottom: 7 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, businessFormChips: { marginTop: 12 }, chip: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 }, input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 }, formActions: { flexDirection: 'row', gap: 10, marginTop: 20 }, cancelButton: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 13 }, saveButton: { flex: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 }, empty: { borderRadius: 16, alignItems: 'center', padding: 26 }, emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 10 }, emptyText: { fontSize: 13, textAlign: 'center', marginTop: 5 }, outcomeCard: { flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }, outcomeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, outcomeTitle: { fontSize: 15, fontWeight: '700' }, outcomeMeta: { fontSize: 12, marginTop: 3 }, contribution: { fontSize: 11, fontWeight: '700', marginTop: 5 },
});
