import {
  StyleSheet,
  Pressable,
  Animated,
  View as RNView,
  PressableProps,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useState } from "react";

interface WeekDataItem {
  day: string;
  score: number;
  date: string;
}

interface DayBarProps {
  day: string;
  score: number;
  date: string;
  isSelected: boolean;
  onPress: PressableProps["onPress"];
}

const DayBar = ({ day, score, date, isSelected, onPress }: DayBarProps) => {
  const maxHeight = 100; // Maximum height of bars
  const barHeight = (score / 20) * maxHeight; // Assuming max score is 20

  return (
    <Pressable onPress={onPress} style={styles.barContainer}>
      {isSelected && (
        <RNView style={styles.scoreLabelContainer}>
          <View style={styles.scoreLabel}>
            <Text style={styles.scoreDateText}>{date}</Text>
            <Text style={styles.scorePointsText}>{score} pontos</Text>
          </View>
          <RNView style={styles.triangle} />
        </RNView>
      )}
      <View
        style={[
          styles.bar,
          { height: barHeight },
          isSelected && styles.selectedBar,
        ]}
      />
      <Text style={styles.dayLabel}>{day}</Text>
    </Pressable>
  );
};

export default function DailyScoreChart(): JSX.Element {
  const [selectedDay, setSelectedDay] = useState<number>(2); // Default to Wednesday (Qua)

  const weekData: WeekDataItem[] = [
    { day: "Seg", score: 14, date: "19/10" },
    { day: "Ter", score: 16, date: "20/10" },
    { day: "Qua", score: 18, date: "21/10" },
    { day: "Qui", score: 15, date: "22/10" },
    { day: "Sex", score: 12, date: "23/10" },
    { day: "Sab", score: 10, date: "24/10" },
    { day: "Dom", score: 8, date: "25/10" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pontuação diária</Text>
      <View style={styles.chartContainer}>
        {weekData.map((item, index) => (
          <DayBar
            key={item.day}
            day={item.day}
            score={item.score}
            date={item.date}
            isSelected={selectedDay === index}
            onPress={() => setSelectedDay(index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#202024",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFF",
    marginBottom: 24,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    backgroundColor: "#202024",
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  bar: {
    width: 30,
    backgroundColor: "#29292E",
    borderRadius: 10,
  },
  selectedBar: {
    backgroundColor: "#3485FF",
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#7C7C8A",
  },
  scoreLabelContainer: {
    position: "absolute",
    top: -45,
    alignItems: "center",
    zIndex: 1,
    width: 80,
  },
  scoreLabel: {
    backgroundColor: "#29292E",
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#29292E",
  },
  scoreDateText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  scorePointsText: {
    color: "#7C7C8A",
    fontSize: 10,
    textAlign: "center",
  },
});
