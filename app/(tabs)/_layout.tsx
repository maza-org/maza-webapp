import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3485FF",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#202024",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 20,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 10,
        },
        tabBarInactiveTintColor: "#7C7C8A",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Meus Cursos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: "Oportunidades",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
