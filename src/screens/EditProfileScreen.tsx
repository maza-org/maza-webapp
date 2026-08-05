import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Modal, FlatList 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft, Save, User, MapPin, Briefcase, 
  GraduationCap, Mail, Phone, Fingerprint, Calendar, 
  Users, BookOpen, Plus
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import PhoneInput from '../components/PhoneInput';
import DatePicker from '../components/DatePicker';
import { bottomSafeSpace } from '../utils/safeArea';
import { actionShadow } from '../theme/shadows';
import { MOZAMBIQUE_BI_MESSAGE, isValidMozambiqueBI, normalizeMozambiqueBI } from '../utils/mozambiqueBi';
import { MOZAMBIQUE_DISTRICTS_BY_PROVINCE } from '../data/mozambiqueDistricts';

const PROVINCES = ['Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'];
const OCCUPATIONS = [
  'Empregado Doméstico', 'Funcionário Público', 'Contador', 'Engenheiro', 'Advogado',
  'Técnico de Informática', 'Segurança', 'Auxiliar Administrativo', 'Empresário',
  'Artesão', 'Costureira', 'Cabeleireiro', 'Taxista', 'Operador de Máquinas', 'Soldador',
  'Estudante', 'Professor', 'Educador', 'Enfermeiro', 'Técnico de Saúde',
  'Agricultor', 'Pescador', 'Comerciante', 'Vendedor', 'Operador de Caixa',
  'Motorista', 'Mototaxista', 'Pedreiro', 'Carpinteiro', 'Electricista',
  'Canalizador', 'Mecânico', 'Recepcionista', 'Empregado de Mesa', 'Cozinheiro',
  'Mineiro', 'Operador de Produção', 'Assistente Social', 'Designer', 'Outro'
];
const GENDERS = ['Masculino', 'Feminino'];
const EDUCATION_LEVELS = ['Ensino Primário', 'Ensino Secundário', 'Ensino Técnico/Profissional', 'Ensino Superior', 'Nenhum'];

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  // Format initial DOB from ISO to DD/MM/YYYY
  const formatInitialDob = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone?.replace('+258', '') || '',
    idDocument: user?.idDocument || '',
    dob: formatInitialDob(user?.dob),
    gender: ['Masculino', 'Feminino'].includes(user?.gender || '') ? (user?.gender || '') : '',
    province: user?.province === 'Maputo' ? 'Maputo Província' : (user?.province || ''),
    district: user?.district || '',
    occupation: user?.occupation || '',
    school: user?.school || '',
    educationLevel: user?.educationLevel || '',
  });
  type FormKey = keyof typeof form;
  const districtOptions = MOZAMBIQUE_DISTRICTS_BY_PROVINCE[form.province] ?? [];

  const [modal, setModal] = useState<{ 
    visible: boolean; 
    type: 'province' | 'district' | 'occupation' | 'gender' | 'educationLevel'; 
    title: string;
    data: string[] 
  }>({
    visible: false,
    type: 'province',
    title: '',
    data: [],
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [customOccupation, setCustomOccupation] = useState('');

  const goToProfile = () => {
    navigation.navigate('Configuracoes');
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    goToProfile();
  };

  const normalizeLocalPhone = (phone: string) => {
    const digits = phone.replace(/[^0-9]/g, '');
    const localNumber = digits.startsWith('258') ? digits.slice(3) : digits;
    return localNumber.slice(0, 9);
  };

  const isValidMozambicanPhone = (phone: string) => /^(82|83|84|85|86|87)\d{7}$/.test(phone);

  const sanitizeFieldValue = (key: FormKey, value: string) => {
    if (key === 'username') return value.replace(/\s+/g, '').replace(/[^A-Za-z0-9._-]/g, '');
    if (key === 'idDocument') return normalizeMozambiqueBI(value);
    if (key === 'phone') return normalizeLocalPhone(value);
    return value;
  };

  const validateField = (key: FormKey, overrideValue?: string, overrideForm = form) => {
    const nextForm = { ...overrideForm, [key]: overrideValue ?? overrideForm[key] };
    const value = String(nextForm[key] ?? '').trim();
    const options = MOZAMBIQUE_DISTRICTS_BY_PROVINCE[nextForm.province] ?? [];
    let message = '';

    if (key === 'username') {
      if (!value) message = 'Introduza um nome de utilizador.';
      else if (/\s/.test(value)) message = 'O nome de utilizador não pode ter espaços.';
      else if (!/^[A-Za-z0-9._-]{3,30}$/.test(value)) message = 'Use 3 a 30 caracteres: letras, números, ponto, hífen ou underscore.';
    }
    if (key === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = 'Introduza um email válido.';
    }
    if (key === 'phone' && value && !isValidMozambicanPhone(normalizeLocalPhone(value))) {
      message = 'O telemóvel deve ter 9 dígitos e começar por 82, 83, 84, 85, 86 ou 87.';
    }
    if (key === 'name' && !value) message = 'Introduza o nome completo.';
    if (key === 'idDocument' && value && !isValidMozambiqueBI(value)) {
      message = MOZAMBIQUE_BI_MESSAGE;
    }
    if (key === 'dob' && !value) message = 'Selecione a data de nascimento.';
    if (key === 'gender' && !value) message = 'Selecione o género.';
    if (key === 'province' && !value) message = 'Selecione a província.';
    if (key === 'district' && value && !options.includes(value)) {
      message = 'Selecione um distrito válido para a província escolhida.';
    }
    if (key === 'occupation' && !value) message = 'Selecione ou adicione uma ocupação.';

    setFieldErrors((prev) => ({ ...prev, [key]: message }));
    return !message;
  };

  const validateForm = () => {
    const fields: FormKey[] = ['username', 'email', 'phone', 'name', 'idDocument', 'dob', 'gender', 'province', 'district', 'occupation', 'school', 'educationLevel'];
    const contactOk = !!form.email.trim() || !!normalizeLocalPhone(form.phone);
    const results = fields.map((field) => validateField(field));
    if (!contactOk) {
      setErrorMsg('Introduza pelo menos um Email ou Número de Telemóvel.');
      return false;
    }
    return results.every(Boolean);
  };

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  const handleSave = async () => {
    if (!user) {
      setErrorMsg('Sessão expirada. Inicie sessão novamente.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Format DOB for backend: DD/MM/YYYY -> YYYY-MM-DD
      let formattedDob = undefined;
      if (form.dob) {
        const parts = form.dob.split('/');
        if (parts.length === 3) formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const payload = {
        ...form,
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        phone: form.phone ? `+258${normalizeLocalPhone(form.phone)}` : '',
        idDocument: normalizeMozambiqueBI(form.idDocument),
        district: form.district.trim(),
        occupation: form.occupation.trim(),
        dob: formattedDob
      };

      const res = await api.patch(`/users/${user.id}`, payload);
      if (res.data) {
        await updateUser({ ...user, ...res.data, profile: res.data.profile ?? user.profile });
        setSuccessMsg('Perfil atualizado com sucesso!');
        setTimeout(() => {
          goToProfile();
        }, 900);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.response?.data?.error || 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'province' | 'district' | 'occupation' | 'gender' | 'educationLevel', title: string) => {
    let data: string[] = [];
    if (type === 'province') data = PROVINCES;
    else if (type === 'district') data = districtOptions;
    else if (type === 'occupation') data = OCCUPATIONS;
    else if (type === 'gender') data = GENDERS;
    else if (type === 'educationLevel') data = EDUCATION_LEVELS;
    if (type === 'occupation') setCustomOccupation('');

    setModal({
      visible: true,
      type,
      title,
      data,
    });
  };

  const updateForm = (key: FormKey, value: string) => {
    const sanitized = sanitizeFieldValue(key, value);
    const next = {
      ...form,
      [key]: sanitized,
      ...(key === 'province' && form.province !== sanitized ? { district: '' } : {}),
    };
    setForm(next);
    validateField(key, sanitized, next);
    if (key === 'province') {
      setFieldErrors((current) => ({ ...current, district: '' }));
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const addCustomOccupation = () => {
    const value = customOccupation.trim();
    if (!value) return;
    updateForm('occupation', value);
    setCustomOccupation('');
    setModal({ ...modal, visible: false });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ChevronLeft size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading || hasFieldErrors} style={[styles.saveBtn, hasFieldErrors && { opacity: 0.35 }]}>
          {loading ? <ActivityIndicator size="small" color={themeColors.primary} /> : <Save size={22} color={themeColors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: bottomSafeSpace(insets.bottom, 24) }}
      >
        
        {/* Conta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Conta</Text>
          
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Nome de Utilizador</Text>
            <View style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.username ? '#EF4444' : themeColors.border }]}>
              <User size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={form.username}
                onChangeText={(v) => updateForm('username', v)}
                placeholder=""
                placeholderTextColor={themeColors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.username ? <Text style={styles.fieldError}>{fieldErrors.username}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Nome Completo</Text>
            <View style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.name ? '#EF4444' : themeColors.border }]}>
              <User size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={form.name}
                onChangeText={(v) => updateForm('name', v)}
                placeholder=""
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
            {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
          </View>
        </View>

        {/* Contacto */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Contacto</Text>
          
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Email</Text>
            <View style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.email ? '#EF4444' : themeColors.border }]}>
              <Mail size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={form.email}
                onChangeText={(v) => updateForm('email', v)}
                placeholder=""
                placeholderTextColor={themeColors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          </View>

          <View style={styles.field}>
            <PhoneInput 
              label="Número de Telemóvel" 
              value={form.phone} 
              onChangeText={(v) => updateForm('phone', v)} 
              inputStyle={fieldErrors.phone ? { borderColor: '#EF4444' } : undefined}
              dark={isDark}
            />
            {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Informações Pessoais</Text>
          
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Bilhete de Identidade (BI)</Text>
            <View style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.idDocument ? '#EF4444' : themeColors.border }]}>
              <Fingerprint size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={form.idDocument}
                onChangeText={(v) => updateForm('idDocument', v)}
                placeholder=""
                placeholderTextColor={themeColors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={15}
              />
            </View>
            {fieldErrors.idDocument ? <Text style={styles.fieldError}>{fieldErrors.idDocument}</Text> : null}
          </View>

          <View style={styles.field}>
            <DatePicker 
              label="Data de Nascimento" 
              value={form.dob} 
              onChange={(v) => updateForm('dob', v)} 
              dark={isDark}
            />
            {fieldErrors.dob ? <Text style={styles.fieldError}>{fieldErrors.dob}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Género</Text>
            <TouchableOpacity 
              style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.gender ? '#EF4444' : themeColors.border }]} 
              onPress={() => openModal('gender', 'Selecionar Género')}
            >
              <Users size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <Text style={[styles.inputText, { color: themeColors.text }, !form.gender && { color: themeColors.textMuted }]}>
                {form.gender || ''}
              </Text>
            </TouchableOpacity>
            {fieldErrors.gender ? <Text style={styles.fieldError}>{fieldErrors.gender}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Província</Text>
            <TouchableOpacity 
              style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.province ? '#EF4444' : themeColors.border }]} 
              onPress={() => openModal('province', 'Selecionar Província')}
            >
              <MapPin size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <Text style={[styles.inputText, { color: themeColors.text }, !form.province && { color: themeColors.textMuted }]}>
                {form.province || ''}
              </Text>
            </TouchableOpacity>
            {fieldErrors.province ? <Text style={styles.fieldError}>{fieldErrors.province}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Distrito</Text>
            <TouchableOpacity 
              style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.district ? '#EF4444' : themeColors.border }, !form.province && { opacity: 0.55 }]} 
              onPress={() => form.province && openModal('district', 'Selecionar Distrito')}
              disabled={!form.province}
            >
              <MapPin size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <Text style={[styles.inputText, { color: themeColors.text }, !form.district && { color: themeColors.textMuted }]}>
                {form.district || ''}
              </Text>
            </TouchableOpacity>
            {fieldErrors.district ? <Text style={styles.fieldError}>{fieldErrors.district}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Ocupação</Text>
            <TouchableOpacity 
              style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: fieldErrors.occupation ? '#EF4444' : themeColors.border }]} 
              onPress={() => openModal('occupation', 'Selecionar Ocupação')}
            >
              <Briefcase size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <Text style={[styles.inputText, { color: themeColors.text }, !form.occupation && { color: themeColors.textMuted }]}>
                {form.occupation || ''}
              </Text>
            </TouchableOpacity>
            {fieldErrors.occupation ? <Text style={styles.fieldError}>{fieldErrors.occupation}</Text> : null}
          </View>
        </View>

        {/* Formação */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Formação</Text>
          
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Escola / Instituição</Text>
            <View style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <GraduationCap size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={form.school}
                onChangeText={(v) => updateForm('school', v)}
                placeholder=""
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Nível Académico</Text>
            <TouchableOpacity 
              style={[styles.inputWrap, { backgroundColor: themeColors.card, borderColor: themeColors.border }]} 
              onPress={() => openModal('educationLevel', 'Nível Académico')}
            >
              <BookOpen size={18} color={themeColors.textMuted} style={styles.fieldIcon} />
              <Text style={[styles.inputText, { color: themeColors.text }, !form.educationLevel && { color: themeColors.textMuted }]}>
                {form.educationLevel || ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {errorMsg ? (
          <Text style={{ color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>
            {errorMsg}
          </Text>
        ) : null}

        {successMsg ? (
          <Text style={{ color: '#10B981', marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>
            {successMsg}
          </Text>
        ) : null}

        <TouchableOpacity 
          style={[styles.mainSaveBtn, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }, hasFieldErrors && { opacity: 0.55, shadowOpacity: 0, elevation: 0 }]} 
          onPress={handleSave} 
          disabled={loading || !!successMsg || hasFieldErrors}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainSaveBtnText}>Guardar Alterações</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Select Modal */}
      <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ ...modal, visible: false })}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>{modal.title}</Text>
              <TouchableOpacity onPress={() => setModal({ ...modal, visible: false })}>
                <Text style={[styles.closeModal, { color: themeColors.primary }]}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={modal.data}
              keyExtractor={(item) => item}
              ListHeaderComponent={modal.type === 'occupation' ? (
                <View style={[styles.customOptionBox, { borderBottomColor: themeColors.border }]}>
                  <Text style={[styles.customOptionLabel, { color: themeColors.text }]}>Adicionar nova ocupação</Text>
                  <View style={styles.customOptionRow}>
                    <TextInput
                      style={[styles.customOptionInput, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }]}
                      value={customOccupation}
                      onChangeText={setCustomOccupation}
                      placeholder=""
                      placeholderTextColor={themeColors.textMuted}
                    />
                    <TouchableOpacity
                      style={[styles.customOptionButton, { backgroundColor: themeColors.primary }, !customOccupation.trim() && { opacity: 0.45 }]}
                      onPress={addCustomOccupation}
                      disabled={!customOccupation.trim()}
                    >
                      <Plus size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
              contentContainerStyle={{ paddingBottom: bottomSafeSpace(insets.bottom, 24) }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => {
                    updateForm(modal.type, item);
                    setModal({ ...modal, visible: false });
                  }}
                >
                  <Text style={[styles.modalItemText, { color: themeColors.text }, form[modal.type] === item && { color: themeColors.primary, fontWeight: 'bold' }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  saveBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: 'bold' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 52, borderWidth: 1 },
  fieldIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15 },
  inputText: { fontSize: 15 },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 6, fontWeight: '600' },
  mainSaveBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20, ...actionShadow },
  mainSaveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: '50%', maxHeight: '80%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeModal: { fontWeight: 'bold' },
  customOptionBox: { paddingBottom: 18, marginBottom: 2, borderBottomWidth: 1 },
  customOptionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  customOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customOptionInput: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  customOptionButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1 },
  modalItemText: { fontSize: 16 },
});
