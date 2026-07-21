import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, Modal, FlatList,
  StatusBar, Image
} from 'react-native';
import { useEffect } from 'react';
import { colors } from '../theme/colors';
import api from '../services/api';
import PhoneInput from '../components/PhoneInput';
import DatePicker from '../components/DatePicker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { bottomSafeSpace } from '../utils/safeArea';
import { MOZAMBIQUE_BI_MESSAGE, isValidMozambiqueBI, normalizeMozambiqueBI } from '../utils/mozambiqueBi';
import { MOZAMBIQUE_DISTRICTS_BY_PROVINCE } from '../data/mozambiqueDistricts';
import { useIsWideWeb } from '../utils/webViewport';

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
const PROVINCES = ['Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'];
const GENDERS = ['Masculino', 'Feminino'];
const EDUCATION_LEVELS = ['Ensino Primário', 'Ensino Secundário', 'Ensino Técnico/Profissional', 'Ensino Superior', 'Nenhum'];
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;

function sanitizeUsername(value: string) {
  return value.replace(/\s+/g, '').replace(/[^A-Za-z0-9._-]/g, '');
}

function suggestUsernameFromName(name: string) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return sanitizeUsername(`${parts[0]}.${parts[1]}`).slice(0, 30);
  if (parts.length === 1) return sanitizeUsername(parts[0]).slice(0, 30);
  return '';
}

// Sub-components defined outside to prevent keyboard dismiss on re-render.

const SectionTitle = ({ label }: { label: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  keyboardType?: any;
  secure?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  maxLength?: number;
  required?: boolean;
  autoCapitalize?: any;
  error?: string;
};

const Field = ({
  label, value, onChangeText, keyboardType,
  secure, showPassword, onTogglePassword, maxLength, required, autoCapitalize, onBlur, error
}: FieldProps) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}{required && <Text style={styles.required}> *</Text>}</Text>
    <View style={styles.inputWrap}>
      <TextInput
        style={[styles.textInput, secure && { paddingRight: 52 }, error && styles.textInputError]}
        placeholder=""
        placeholderTextColor="#B0B0B0"
        keyboardType={keyboardType}
        secureTextEntry={secure && !showPassword}
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        autoCapitalize={autoCapitalize || 'none'}
      />
      {secure && (
        <TouchableOpacity style={styles.eyeBtn} onPress={onTogglePassword}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#B0B0B0" />
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

type SelectProps = {
  label: string;
  value: string;
  required?: boolean;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
};

const Select = ({ label, value, required, onPress, disabled, error }: SelectProps) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}{required && <Text style={styles.required}> *</Text>}</Text>
    <TouchableOpacity style={[styles.selectWrap, disabled && styles.selectWrapDisabled, error && styles.inputWrapError]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.selectText, !value && styles.placeholder]}>
        {value || ''}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#A0A0B0" />
    </TouchableOpacity>
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

// Main screen

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const isWideWeb = useIsWideWeb(900);
  const [form, setForm] = useState({
    username: '', email: '', phone: '', password: '', name: '',
    idDocument: '', dob: '', gender: '', province: '', district: '',
    occupation: '', school: '', educationLevel: ''
  });
  type FormKey = keyof typeof form;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<FormKey, boolean>>>({});
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameEdited, setUsernameEdited] = useState(false);
  const usernameCheckRef = useRef(0);
  const generatedUsernameRef = useRef('');
  const [customOccupation, setCustomOccupation] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean; title: string; field: string; options: string[];
  }>({ visible: false, title: '', field: '', options: [] });

  const set = (key: FormKey) => (v: string) => {
    const value = key === 'username'
      ? sanitizeUsername(v)
      : key === 'idDocument'
      ? normalizeMozambiqueBI(v)
      : v;
    setForm(f => ({
      ...f,
      [key]: value,
      ...(key === 'province' && f.province !== value ? { district: '' } : {}),
    }));
    if (touchedFields[key]) validateField(key, value);
  };
  const hasFormInput = Object.values(form).some((value) => value.trim().length > 0);
  const districtOptions = MOZAMBIQUE_DISTRICTS_BY_PROVINCE[form.province] ?? [];

  const setUsername = (value: string) => {
    setUsernameEdited(true);
    set('username')(value);
  };

  const checkUsernameNow = (username: string, checkId: number) => {
    api.get(`/auth/username-available?username=${encodeURIComponent(username)}`)
      .then((res) => {
        if (usernameCheckRef.current !== checkId) return;
        setUsernameStatus(res.data?.available ? 'available' : 'taken');
        setUsernameSuggestions(Array.isArray(res.data?.suggestions) ? res.data.suggestions : []);
        setFieldErrors((prev) => ({
          ...prev,
          username: res.data?.available ? '' : 'Este nome de utilizador já está em uso.',
        }));
      })
      .catch(() => {
        if (usernameCheckRef.current !== checkId) return;
        setUsernameStatus('error');
      });
  };

  const applyUsernameSuggestion = (value: string) => {
    const username = sanitizeUsername(value);
    setUsernameEdited(true);
    setForm((current) => ({ ...current, username }));
    setTouchedFields((prev) => ({ ...prev, username: true }));
    setFieldErrors((prev) => ({ ...prev, username: '' }));
    setUsernameSuggestions([]);
    setUsernameStatus('checking');
    const checkId = usernameCheckRef.current + 1;
    usernameCheckRef.current = checkId;
    checkUsernameNow(username, checkId);
  };

  useEffect(() => {
    const suggestion = suggestUsernameFromName(form.name);
    if (!suggestion) {
      if (!usernameEdited || form.username === generatedUsernameRef.current) {
        generatedUsernameRef.current = '';
        setForm((current) => current.username ? { ...current, username: '' } : current);
      }
      return;
    }
    if (usernameEdited && form.username && form.username !== generatedUsernameRef.current) return;
    generatedUsernameRef.current = suggestion;
    setForm((current) => current.username === suggestion ? current : { ...current, username: suggestion });
  }, [form.name, form.username, usernameEdited]);

  useEffect(() => {
    const username = form.username.trim();
    setFieldErrors((prev) => {
      if (!prev.username) return prev;
      let message = '';
      if (!username) message = 'Introduza um nome de utilizador.';
      else if (/\s/.test(username)) message = 'O nome de utilizador não pode ter espaços.';
      else if (!USERNAME_PATTERN.test(username)) message = 'Use 3 a 30 caracteres: letras, números, ponto, hífen ou underscore.';
      return prev.username === message ? prev : { ...prev, username: message };
    });
    setUsernameSuggestions([]);
    if (!username || !USERNAME_PATTERN.test(username)) {
      setUsernameStatus('idle');
      return;
    }

    const checkId = usernameCheckRef.current + 1;
    usernameCheckRef.current = checkId;
    setUsernameStatus('checking');
    const timer = setTimeout(() => {
      checkUsernameNow(username, checkId);
    }, 450);

    return () => clearTimeout(timer);
  }, [form.username]);

  const validateField = (key: FormKey, overrideValue?: string) => {
    const nextForm = { ...form, [key]: overrideValue ?? form[key] };
    let message = '';
    const value = String(nextForm[key] ?? '').trim();
    const emailValue = nextForm.email.trim();
    const phoneValue = normalizeLocalPhone(nextForm.phone);

    if (key === 'username') {
      if (!value) message = 'Introduza um nome de utilizador.';
      else if (/\s/.test(value)) message = 'O nome de utilizador não pode ter espaços.';
      else if (!USERNAME_PATTERN.test(value)) message = 'Use 3 a 30 caracteres: letras, números, ponto, hífen ou underscore.';
    }
    if (key === 'password') {
      if (!value) message = 'Introduza uma palavra-passe.';
      else if (value.length < 6) message = 'A palavra-passe deve ter pelo menos 6 caracteres.';
    }
    if (key === 'email') {
      if (!emailValue && !phoneValue) message = 'Introduza email ou contacto.';
      else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Introduza um email válido.';
    }
    if (key === 'phone') {
      if (!emailValue && !phoneValue) message = 'Introduza email ou contacto.';
      else if (phoneValue && !isValidMozambicanPhone(phoneValue)) message = 'O telemóvel deve ter 9 dígitos e começar por 82, 83, 84, 85, 86 ou 87.';
    }
    if (key === 'name' && !value) message = 'Introduza o nome completo.';
    if (key === 'idDocument') {
      if (value && !isValidMozambiqueBI(value)) message = MOZAMBIQUE_BI_MESSAGE;
    }
    if (key === 'dob' && !value) message = 'Selecione a data de nascimento.';
    if (key === 'gender' && !value) message = 'Selecione o género.';
    if (key === 'province' && !value) message = 'Selecione a província.';
    if (key === 'district') {
      if (!value) message = 'Selecione o distrito.';
      else if (!districtOptions.includes(value)) message = 'Selecione um distrito válido para a província escolhida.';
    }

    setFieldErrors((prev) => ({ ...prev, [key]: message }));
    return !message;
  };

  const touchAndValidate = (key: FormKey) => {
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
    return validateField(key);
  };

  const validateForm = () => {
    const fields: FormKey[] = ['name', 'username', 'password', 'dob', 'gender', 'province', 'district', 'idDocument', 'occupation', 'email', 'phone', 'educationLevel', 'school'];
    const results = fields.map((field) => validateField(field));
    setTouchedFields((prev) => fields.reduce((acc, field) => ({ ...acc, [field]: true }), prev));
    if (usernameStatus === 'taken') {
      setFieldErrors((prev) => ({ ...prev, username: 'Este nome de utilizador já está em uso.' }));
      return false;
    }
    if (usernameStatus === 'checking') {
      setErrorMsg('Aguarde a verificação do nome de utilizador.');
      return false;
    }
    return results.every(Boolean);
  };

  useEffect(() => {
    if (touchedFields.email) validateField('email');
    if (touchedFields.phone) validateField('phone');
  }, [form.email, form.phone]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (!hasFormInput || successVisible) return;

      event.preventDefault();
      Alert.alert(
        'Sair do registo?',
        'Os dados preenchidos serão perdidos.',
        [
          { text: 'Continuar aqui', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => navigation.dispatch(event.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasFormInput, successVisible]);

  const validateBI = isValidMozambiqueBI;
  const normalizeLocalPhone = (phone: string) => {
    const digits = phone.replace(/[^0-9]/g, '');
    const localNumber = digits.startsWith('258') ? digits.slice(3) : digits;
    return localNumber.slice(0, 9);
  };
  const isValidMozambicanPhone = (phone: string) => /^(82|83|84|85|86|87)\d{7}$/.test(phone);
  const getRegisterErrorMessage = (err: any) => {
    const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
    if (apiMessage) return apiMessage;
    if (err?.code === 'ECONNABORTED') return 'O servidor demorou demasiado a responder. Tente novamente.';
    if (err?.request) return 'Não foi possível contactar o servidor. Verifique a sua ligação e tente novamente.';
    return err?.message || 'Erro ao criar conta. Tente novamente.';
  };

  const goToLogin = () => {
    const routeNames = navigation.getState?.()?.routeNames ?? [];
    if (routeNames.includes('Login')) {
      navigation.replace('Login');
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Main');
  };

  const handleRegister = async () => {
    setErrorMsg(null);
    if (!validateForm()) return;
    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();
    const phone = normalizeLocalPhone(form.phone);
    const name = form.name.trim();
    const idDocument = normalizeMozambiqueBI(form.idDocument);
    const occupation = form.occupation.trim();

    if (!validateBI(idDocument)) {
      setErrorMsg(MOZAMBIQUE_BI_MESSAGE);
      return;
    }
    setLoading(true);
    try {
      let formattedDob = undefined;
      if (form.dob) {
        const parts = form.dob.split('/');
        if (parts.length === 3) formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      await api.post('/auth/register', {
        ...form,
        username,
        email,
        phone: phone ? `+258${phone}` : '',
        name,
        idDocument,
        district: form.district.trim(),
        occupation,
        dob: formattedDob
      });
      setSuccessVisible(true);
    } catch (err: any) {
      const msg = getRegisterErrorMessage(err);
      setErrorMsg(msg);
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (title: string, field: string, options: string[]) => {
    if (field === 'occupation') setCustomOccupation('');
    setModalConfig({ visible: true, title, field, options });
  };
  const closeModal = () => setModalConfig(m => ({ ...m, visible: false }));
  const selectModalValue = (item: string) => {
    const key = modalConfig.field as FormKey;
    setForm(f => ({
      ...f,
      [key]: item,
      ...(key === 'province' && f.province !== item ? { district: '' } : {}),
    }));
    setTouchedFields((prev) => ({ ...prev, [key]: true, ...(key === 'province' ? { district: true } : {}) }));
    validateField(key, item);
    if (key === 'province') {
      setFieldErrors((prev) => ({ ...prev, district: '' }));
    }
    closeModal();
  };
  const addCustomOccupation = () => {
    const value = customOccupation.trim();
    if (!value) return;
    selectModalValue(value);
  };

  const usernameHelper = (() => {
    if (!form.username || fieldErrors.username) return null;
    if (usernameStatus === 'checking') return { text: 'A verificar disponibilidade...', color: '#64748B' };
    if (usernameStatus === 'available') return { text: 'Nome de utilizador disponível.', color: '#10B981' };
    if (usernameStatus === 'taken') return { text: 'Este nome de utilizador já está em uso.', color: '#EF4444' };
    if (usernameStatus === 'error') return { text: 'Não foi possível verificar agora. Pode tentar guardar.', color: '#F59E0B' };
    return null;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, isWideWeb && styles.webScroll, { paddingBottom: bottomSafeSpace(insets.bottom, 20) }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >

        <Image
          source={require('../../assets/maza-logo-azul.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.formIntro}>Preenche os campos para criar uma conta</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginHintWrap}>
            <Text style={styles.loginHint}>Já tem conta? <Text style={styles.loginLink}>Iniciar sessão</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Registration fields */}
        <View style={[styles.card, isWideWeb && styles.webCard]}>
          <Field label="Nome Completo" value={form.name} onChangeText={set('name')} onBlur={() => touchAndValidate('name')} error={fieldErrors.name} required />
          <Field label="Nome de utilizador" value={form.username} onChangeText={setUsername} onBlur={() => touchAndValidate('username')} error={fieldErrors.username} required />
          {usernameHelper ? <Text style={[styles.fieldHint, { color: usernameHelper.color }]}>{usernameHelper.text}</Text> : null}
          {usernameSuggestions.length > 0 && (
            <View style={styles.suggestionRow}>
              {usernameSuggestions.map((item) => (
                <TouchableOpacity key={item} style={styles.suggestionChip} onPress={() => applyUsernameSuggestion(item)}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Field label="Palavra-passe" value={form.password} onChangeText={set('password')} onBlur={() => touchAndValidate('password')} error={fieldErrors.password} secure showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)} required />
          <Field label="Email" value={form.email} onChangeText={set('email')} onBlur={() => touchAndValidate('email')} error={fieldErrors.email} keyboardType="email-address" />
          <View style={styles.field}>
            <PhoneInput label="Contacto" value={form.phone} onChangeText={set('phone')} onBlur={() => touchAndValidate('phone')} />
            {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
          </View>
          <View style={styles.field}>
            <DatePicker label="Data de Nascimento" value={form.dob} onChange={(value) => { set('dob')(value); setTouchedFields((prev) => ({ ...prev, dob: true })); validateField('dob', value); }} required />
            {fieldErrors.dob ? <Text style={styles.fieldError}>{fieldErrors.dob}</Text> : null}
          </View>
          <Select label="Género" value={form.gender} required error={fieldErrors.gender} onPress={() => openModal('Género', 'gender', GENDERS)} />
          <Select label="Província" value={form.province} required error={fieldErrors.province} onPress={() => openModal('Província', 'province', PROVINCES)} />
          <Select label="Distrito" value={form.district} required error={fieldErrors.district} disabled={!form.province} onPress={() => openModal('Distrito', 'district', districtOptions)} />
          <Field label="Bilhete de Identidade (BI)" value={form.idDocument} onChangeText={set('idDocument')} onBlur={() => touchAndValidate('idDocument')} error={fieldErrors.idDocument} autoCapitalize="characters" maxLength={15} />
          <Select label="Ocupação" value={form.occupation} error={fieldErrors.occupation} onPress={() => openModal('Ocupação', 'occupation', OCCUPATIONS)} />
          <Select label="Nível Académico" value={form.educationLevel} onPress={() => openModal('Nível Académico', 'educationLevel', EDUCATION_LEVELS)} />
          <Field label="Instituição de ensino" value={form.school} onChangeText={set('school')} />
        </View>

        {errorMsg ? (
          <Text style={{ color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>
            {errorMsg}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.registerBtn, isWideWeb && styles.webRegisterBtn, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Criar Conta</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => setSuccessVisible(false)}>
        <View style={styles.feedbackOverlay}>
          <View style={styles.feedbackCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.feedbackTitle}>Conta criada com sucesso</Text>
            <Text style={styles.feedbackText}>
              O seu registo foi concluído. Inicie sessão para continuar a usar o MAZA.
            </Text>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => {
                setSuccessVisible(false);
                goToLogin();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.feedbackButtonText}>Iniciar sessão</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Selection Modal */}
      <Modal visible={modalConfig.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modal} edges={['top', 'left', 'right']}>
          <View style={styles.modalHandle} />
          <View style={styles.modalTop}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={modalConfig.options}
            keyExtractor={item => item}
            ListHeaderComponent={modalConfig.field === 'occupation' ? (
              <View style={styles.customOptionBox}>
                <Text style={styles.customOptionLabel}>Adicionar nova ocupação</Text>
                <View style={styles.customOptionRow}>
                  <TextInput
                    style={styles.customOptionInput}
                    value={customOccupation}
                    onChangeText={setCustomOccupation}
                    placeholder=""
                    placeholderTextColor="#A0A0B0"
                  />
                  <TouchableOpacity style={styles.customOptionButton} onPress={addCustomOccupation}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            contentContainerStyle={{ paddingBottom: bottomSafeSpace(insets.bottom, 24) }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F5F5F5' }} />}
            renderItem={({ item }) => {
              const selected = form[modalConfig.field as keyof typeof form] === item;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, selected && styles.modalItemSelected]}
                  onPress={() => selectModalValue(item)}
                >
                  <Text style={[styles.modalItemText, selected && styles.modalItemTextSelected]}>{item}</Text>
                  {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { paddingHorizontal: 24, paddingTop: 28 },
  webScroll: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingTop: 40 },
  logo: { width: 160, height: 70, marginBottom: 32, alignSelf: 'flex-start' },

  header: { paddingBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: '#1A1A2E', lineHeight: 34, marginTop: -2 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 8 },
  loginHintWrap: { alignSelf: 'flex-start' },
  loginHint: { fontSize: 14, lineHeight: 20, color: '#8A8A9A', fontWeight: '500' },
  loginLink: { color: colors.primary, fontWeight: '600' },
  formIntro: { marginTop: 4, marginBottom: 2, fontSize: 14, lineHeight: 20, color: '#8A8A9A', fontWeight: '500' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, paddingTop: 16, marginBottom: 14, borderWidth: 1, borderColor: '#F0F1F5' },
  webCard: { borderRadius: 8, padding: 22 },
  cardHint: { fontSize: 12, color: '#A0A0B0', marginBottom: 12, marginTop: -4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#EFEFEF' },
  sectionLabel: { flexShrink: 1, fontSize: 11, fontWeight: '700', color: '#A0A0B0', letterSpacing: 1, textAlign: 'center', textTransform: 'uppercase' },

  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A2E', marginBottom: 8 },
  required: { color: '#EF4444' },
  inputWrap: { position: 'relative' },
  textInput: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A2E', borderWidth: 1, borderColor: '#E6EAF0' },
  textInputError: { borderColor: '#EF4444' },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  fieldError: { color: '#EF4444', fontSize: 12, fontWeight: '600', marginTop: 6 },
  fieldHint: { fontSize: 12, fontWeight: '700', marginTop: -10, marginBottom: 12 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -6, marginBottom: 14 },
  suggestionChip: { borderRadius: 999, backgroundColor: '#EAF6FF', paddingHorizontal: 12, paddingVertical: 7 },
  suggestionText: { color: colors.primary, fontSize: 12, fontWeight: '800' },

  selectWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#E6EAF0' },
  inputWrapError: { borderColor: '#EF4444' },
  selectWrapDisabled: { opacity: 0.55 },
  selectText: { fontSize: 15, color: '#1A1A2E', flex: 1 },
  placeholder: { color: '#B0B0B0' },
  chevron: { fontSize: 24, color: '#A0A0B0', lineHeight: 26, marginTop: -2 },

  registerBtn: {
    backgroundColor: colors.primary, paddingVertical: 17, borderRadius: 16, alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  webRegisterBtn: { borderRadius: 8, paddingVertical: 14, shadowOpacity: 0.18 },
  registerBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  feedbackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  feedbackCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  feedbackTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#667085',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
  },
  feedbackButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  modal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  modalCloseBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  modalCloseIcon: { fontSize: 14, color: '#555' },
  customOptionBox: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  customOptionLabel: { fontSize: 13, fontWeight: '700', color: '#3A3A5C', marginBottom: 10 },
  customOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customOptionInput: { flex: 1, backgroundColor: '#F8F8FC', borderRadius: 12, borderWidth: 1.5, borderColor: '#EEEEEE', paddingHorizontal: 14, paddingVertical: 12, color: '#1A1A2E', fontSize: 15 },
  customOptionButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 24 },
  modalItemSelected: { backgroundColor: '#F0F8FF' },
  modalItemText: { fontSize: 16, color: '#1A1A2E' },
  modalItemTextSelected: { color: colors.primary, fontWeight: '600' },
});

