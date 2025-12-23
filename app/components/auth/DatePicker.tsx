import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DatePickerState } from '@/app/types/auth';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function DatePicker({ label, value, onChange, error, maximumDate, minimumDate }: DatePickerProps) {
  const [show, setShow] = React.useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.dateButton, error && styles.dateButtonError]} onPress={() => setShow(true)}>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateButton: {
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});
