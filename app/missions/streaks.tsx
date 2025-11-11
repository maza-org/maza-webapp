import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function Streaks() {
  // Dias da semana
  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const completedDays = ['Seg', 'Ter', 'Qua', 'Qui'];
  const currentDay = 'Sex';
  const futureDays = ['Sáb', 'Dom'];

  const renderDayCircle = (day: string) => {
    let circleStyle = styles.dayCircle;
    let content = null;

    if (completedDays.includes(day)) {
      circleStyle = { ...circleStyle, ...styles.completedDay };
      content = <Feather name="check" size={24} color="#FFFFFF" />;
    } else if (day === currentDay) {
      circleStyle = { ...circleStyle, ...styles.currentDay };
    } else {
      circleStyle = { ...circleStyle, ...styles.futureDay };
    }

    return (
      <View key={day} style={styles.dayContainer}>
        <Text style={styles.dayText}>{day}</Text>
        <View style={circleStyle}>{content}</View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.contentContainer}>
        {/* Ícone de fogo */}
        <View style={styles.iconContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746082962/maza/fire_r4iaes.webp' }}
            style={styles.fireIcon}
          />
        </View>

        {/* Mensagem da sequência */}
        <Text style={styles.streakTitle}>Consegue manter sua sequência?</Text>

        {/* Exibição dos dias da semana */}
        <View style={styles.calendarContainer}>{daysOfWeek.map((day) => renderDayCircle(day))}</View>

        {/* Lembrete da sequência */}
        <Text style={styles.reminderText}>Volte amanhã para manter sua sequência</Text>

        {/* Botão */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ir para Desafios</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 80,
    marginTop: 60,
  },
  iconContainer: {
    marginBottom: 40,
  },
  fireIcon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  streakTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedDay: {
    backgroundColor: '#FF8C00',
  },
  currentDay: {
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  futureDay: {
    backgroundColor: '#E5E5E5',
    opacity: 0.3,
  },
  reminderText: {
    color: '#A8A8B3',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
