import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export interface CustomDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export default function CustomDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  visible,
  onClose,
  title = 'Data de Nascimento',
}: CustomDatePickerProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const currentDate = value || maxDate;
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const dayScrollRef = useRef<FlatList>(null);
  const monthScrollRef = useRef<FlatList>(null);
  const yearScrollRef = useRef<FlatList>(null);

  // Generate arrays for days, months, years
  const years = useMemo(() => {
    const result = [];
    for (let y = maxDate.getFullYear(); y >= minDate.getFullYear(); y--) {
      result.push(y);
    }
    return result;
  }, [minDate, maxDate]);

  const months = useMemo(() => {
    return MONTHS.map((name, index) => ({ name, index }));
  }, []);

  const days = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(d);
    }
    return result;
  }, [selectedYear, selectedMonth]);

  // Reset day if it exceeds days in selected month
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Scroll to initial position when picker opens
  useEffect(() => {
    if (visible) {
      const date = value || maxDate;
      setSelectedDay(date.getDate());
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());

      setTimeout(() => {
        const dayIndex = date.getDate() - 1;
        const monthIndex = date.getMonth();
        const yearIndex = years.findIndex((y) => y === date.getFullYear());

        dayScrollRef.current?.scrollToIndex({ index: dayIndex, animated: false });
        monthScrollRef.current?.scrollToIndex({ index: monthIndex, animated: false });
        if (yearIndex >= 0) {
          yearScrollRef.current?.scrollToIndex({ index: yearIndex, animated: false });
        }
      }, 100);
    }
  }, [visible, value, maxDate, years]);

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
    onClose();
  };

  const handleScrollEnd = (
    event: any,
    items: any[],
    setter: (value: any) => void,
    getValue: (item: any) => any
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    setter(getValue(items[clampedIndex]));
  };

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'flex-end',
        },
        modalContent: {
          backgroundColor: colors.cardBackground,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: Math.max(insets.bottom, 20),
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        cancelText: {
          fontSize: 16,
          color: colors.textMuted,
        },
        confirmText: {
          fontSize: 16,
          color: colors.primary,
          fontWeight: '600',
        },
        pickerContainer: {
          flexDirection: 'row',
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          paddingHorizontal: 16,
        },
        column: {
          flex: 1,
          position: 'relative',
        },
        columnWide: {
          flex: 1.5,
        },
        columnList: {
          paddingVertical: ITEM_HEIGHT * 2,
        },
        itemContainer: {
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
        },
        itemText: {
          fontSize: 18,
          color: colors.textMuted,
        },
        itemTextSelected: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
        },
        selectionIndicator: {
          position: 'absolute',
          top: ITEM_HEIGHT * 2,
          left: 8,
          right: 8,
          height: ITEM_HEIGHT,
          backgroundColor: colors.inputBackground,
          borderRadius: 10,
          zIndex: -1,
        },
        columnLabel: {
          textAlign: 'center',
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 8,
          fontWeight: '500',
        },
      }),
    [colors, insets.bottom]
  );

  const renderItem = (item: any, selectedValue: any, displayValue: string) => {
    const isSelected = item === selectedValue;
    return (
      <View style={themedStyles.itemContainer}>
        <Text style={isSelected ? themedStyles.itemTextSelected : themedStyles.itemText}>{displayValue}</Text>
      </View>
    );
  };

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={themedStyles.modalOverlay}>
        <View style={themedStyles.modalContent}>
          <View style={themedStyles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={themedStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={themedStyles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={themedStyles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          <View style={themedStyles.pickerContainer}>
            {/* Day Column */}
            <View style={themedStyles.column}>
              <View style={themedStyles.selectionIndicator} />
              <FlatList
                ref={dayScrollRef}
                data={days}
                keyExtractor={(item) => `day-${item}`}
                renderItem={({ item }) => renderItem(item, selectedDay, item.toString().padStart(2, '0'))}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={themedStyles.columnList}
                getItemLayout={getItemLayout}
                onMomentumScrollEnd={(e) => handleScrollEnd(e, days, setSelectedDay, (d) => d)}
                initialScrollIndex={Math.max(0, selectedDay - 1)}
              />
              <Text style={themedStyles.columnLabel}>Dia</Text>
            </View>

            {/* Month Column */}
            <View style={[themedStyles.column, themedStyles.columnWide]}>
              <View style={themedStyles.selectionIndicator} />
              <FlatList
                ref={monthScrollRef}
                data={months}
                keyExtractor={(item) => `month-${item.index}`}
                renderItem={({ item }) => renderItem(item.index, selectedMonth, item.name)}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={themedStyles.columnList}
                getItemLayout={getItemLayout}
                onMomentumScrollEnd={(e) => handleScrollEnd(e, months, setSelectedMonth, (m) => m.index)}
                initialScrollIndex={selectedMonth}
              />
              <Text style={themedStyles.columnLabel}>Mês</Text>
            </View>

            {/* Year Column */}
            <View style={themedStyles.column}>
              <View style={themedStyles.selectionIndicator} />
              <FlatList
                ref={yearScrollRef}
                data={years}
                keyExtractor={(item) => `year-${item}`}
                renderItem={({ item }) => renderItem(item, selectedYear, item.toString())}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={themedStyles.columnList}
                getItemLayout={getItemLayout}
                onMomentumScrollEnd={(e) => handleScrollEnd(e, years, setSelectedYear, (y) => y)}
                initialScrollIndex={Math.max(0, years.findIndex((y) => y === selectedYear))}
              />
              <Text style={themedStyles.columnLabel}>Ano</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Export month names for use in parent components
export { MONTHS };
