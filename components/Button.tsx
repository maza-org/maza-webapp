import { Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

interface ButtonProps {
  handle: () => void;
  text: string;
}

export default function Button({ handle, text }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.confirmButton} onPress={handle}>
      <Text style={styles.confirmButtonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    backgroundColor: "#22ACE3",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
