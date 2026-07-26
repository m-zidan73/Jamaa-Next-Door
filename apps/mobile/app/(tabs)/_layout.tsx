import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../src/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceDark,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="jamaahs"
        options={{
          title: "Jama'ah",
          tabBarIcon: ({ color, size }) => <Feather color={color} name="home" size={size} />,
        }}
      />
      <Tabs.Screen
        name="prayer-times"
        options={{
          title: "Prayer",
          tabBarIcon: ({ color, size }) => <Feather color={color} name="clock" size={size} />,
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: "Qibla",
          tabBarIcon: ({ color, size }) => <Feather color={color} name="compass" size={size} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: "Quran",
          tabBarIcon: ({ color, size }) => <Feather color={color} name="book-open" size={size} />,
        }}
      />
      <Tabs.Screen
        name="azkar"
        options={{
          title: "Azkar",
          tabBarIcon: ({ color, size }) => <Feather color={color} name="message-circle" size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Feather color={color} name="settings" size={size} />,
        }}
      />
    </Tabs>
  );
}
