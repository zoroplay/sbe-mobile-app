import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import {
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import AppHeader from "@/components/layouts/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#C72C3B",
        tabBarStyle: { backgroundColor: "#0B1120" },
        header: ({ route }) =>
          route.name === "profile" ? null : (
            <SafeAreaView edges={["top"]}>
              <AppHeader />
            </SafeAreaView>
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          // header
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="dice-five" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="providers"
        options={{
          title: "Providers",
          tabBarIcon: ({ color }) => (
            <Ionicons name="diamond-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="layers-search-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="category" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exit"
        options={{
          title: "Exit Casino",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={22}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            router.push("/(tabs)");

            // // Navigate to casino external URL
            // const url = "https://casino.bet24.com/en/casino";
            // if (typeof window !== "undefined") {
            //   window.open(url, "_blank");
            // }
          },
        }}
      />
    </Tabs>
  );
}
