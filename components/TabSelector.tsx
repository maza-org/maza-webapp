import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";

// RadioButton Component from the first file
const RadioButton = ({
  label,
  selected,
  onPress,
  animatedBg,
  animatedText,
}) => (
  <Pressable
    style={[styles.radioButton, selected && { backgroundColor: animatedBg }]}
    onPress={onPress}
  >
    <Animated.Text
      style={[
        styles.radioButtonText,
        {
          color: animatedText,
        },
      ]}
    >
      {label}
    </Animated.Text>
  </Pressable>
);

// TabSelector Component
const TabSelector = ({ activeTab, onTabChange }) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  const buttonWidth = 150; // Adjusted for two buttons

  const getAnimatedPosition = () => {
    return activeTab === "lessons" ? 0 : buttonWidth;
  };

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: getAnimatedPosition(),
      useNativeDriver: false,
      friction: 20,
      tension: 150,
    }).start();
  }, [activeTab]);

  const animatedBg = animationValue.interpolate({
    inputRange: [0, buttonWidth],
    outputRange: ["#29292E", "#29292E"],
  });

  const animatedText = (buttonIndex) => {
    return animationValue.interpolate({
      inputRange: [
        buttonWidth * (buttonIndex - 0.5),
        buttonWidth * buttonIndex,
        buttonWidth * (buttonIndex + 0.5),
      ],
      outputRange: ["#666", "#fff", "#666"],
      extrapolate: "clamp",
    });
  };

  return (
    <View style={styles.radioGroup}>
      <Animated.View
        style={[
          styles.animatedSelection,
          {
            transform: [
              {
                translateX: animationValue,
              },
            ],
          },
        ]}
      />
      <RadioButton
        label="Aulas"
        selected={activeTab === "lessons"}
        onPress={() => onTabChange("lessons")}
        animatedText={animatedText(0)}
      />
      <RadioButton
        label="Opiniões"
        selected={activeTab === "opinions"}
        onPress={() => onTabChange("opinions")}
        animatedText={animatedText(1)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  radioGroup: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#202024",
    borderRadius: 999,
    padding: 4,
    position: "relative",
  },
  radioButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    zIndex: 1,
  },
  animatedSelection: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    width: "50%",
    backgroundColor: "#29292E",
    borderRadius: 999,
    zIndex: 0,
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default TabSelector;
