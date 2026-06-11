import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { bottomSafeSpace } from '../utils/safeArea';

const { width } = Dimensions.get('window');

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 10 - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface DatePickerProps {
  value: string; // DD/MM/YYYY
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
  dark?: boolean;
}

export default function DatePicker({ value, onChange, label, required }: DatePickerProps) {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Parse existing value
  const parts = value ? value.split('/') : [];
  const [day, setDay] = useState(parts[0] ? parseInt(parts[0]) : null as null | number);
  const [month, setMonth] = useState(parts[1] ? parseInt(parts[1]) : null as null | number);
  const [year, setYear] = useState(parts[2] ? parseInt(parts[2]) : null as null | number);

  const formatted = day && month && year
    ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
    : '';

  const handleConfirm = () => {
    if (day && month && year) {
      const d = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      onChange(d);
    }
    setVisible(false);
  };

  const maxDay = month && year ? getDaysInMonth(month, year) : 31;
  const safeDay = day && day > maxDay ? maxDay : day;

  return (
    <>
      <View style={styles.container}>
        {label ? (
          <Text style={[styles.label, { color: colors.text }]}>
            {label}{required && <Text style={styles.required}> *</Text>}
          </Text>
        ) : null}
        <TouchableOpacity 
          style={[styles.trigger, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => setVisible(true)} 
          activeOpacity={0.7}
        >
          <Text style={[styles.triggerText, { color: colors.text }, !formatted && { color: colors.textMuted }]}>
            {formatted || ''}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Title bar */}
          <View style={[styles.titleBar, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={[styles.cancel, { color: colors.textMuted }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Data de Nascimento</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={[styles.confirm, { color: colors.primary }]}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: colors.card }]}>
            <Text style={[styles.previewText, { color: colors.text }]}>
              {safeDay && month && year
                ? `${safeDay} de ${MONTHS[(month || 1) - 1]} de ${year}`
                : ''}
            </Text>
          </View>

          {/* 3-column picker */}
          <View style={styles.pickers}>
            {/* Day */}
            <View style={styles.col}>
              <Text style={[styles.colHeader, { color: colors.textMuted }]}>Dia</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.item, safeDay === d && { backgroundColor: colors.primary }]}
                    onPress={() => setDay(d)}
                  >
                    <Text style={[styles.itemText, { color: colors.text }, safeDay === d && { color: '#FFFFFF', fontWeight: 'bold' }]}>
                      {String(d).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month */}
            <View style={[styles.col, styles.colWide]}>
              <Text style={[styles.colHeader, { color: colors.textMuted }]}>Mês</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                {MONTHS.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.item, month === i + 1 && { backgroundColor: colors.primary }]}
                    onPress={() => setMonth(i + 1)}
                  >
                    <Text style={[styles.itemText, { color: colors.text }, month === i + 1 && { color: '#FFFFFF', fontWeight: 'bold' }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year */}
            <View style={styles.col}>
              <Text style={[styles.colHeader, { color: colors.textMuted }]}>Ano</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                {YEARS.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.item, year === y && { backgroundColor: colors.primary }]}
                    onPress={() => setYear(y)}
                  >
                    <Text style={[styles.itemText, { color: colors.text }, year === y && { color: '#FFFFFF', fontWeight: 'bold' }]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Big confirm button */}
          <View style={[styles.bottomBar, { borderTopColor: colors.border, paddingBottom: bottomSafeSpace(insets.bottom, 16) }]}>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>Confirmar Data</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 0 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  required: { color: '#EF4444' },
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, borderWidth: 1,
  },
  triggerText: { fontSize: 15, flex: 1 },

  modal: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  titleBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  cancel: { fontSize: 15 },
  confirm: { fontSize: 15, fontWeight: '700' },

  preview: {
    marginHorizontal: 20, marginTop: 16,
    paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  previewText: { fontSize: 17, fontWeight: '700' },

  pickers: { flex: 1, flexDirection: 'row', paddingHorizontal: 12, paddingTop: 16, gap: 4 },
  col: { flex: 1 },
  colWide: { flex: 1.6 },
  colHeader: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' },
  scroll: { maxHeight: 320 },
  item: {
    paddingVertical: 11, paddingHorizontal: 4, borderRadius: 10,
    alignItems: 'center', marginVertical: 1,
  },
  itemText: { fontSize: 14, textAlign: 'center' },

  bottomBar: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  confirmBtn: {
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
