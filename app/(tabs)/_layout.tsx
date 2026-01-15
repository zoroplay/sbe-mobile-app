import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome5, FontAwesome6, Octicons } from "@expo/vector-icons";
import AppHeader from "@/components/layouts/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { setAzMenu } from "@/store/features/slice/app.slice";
import { useAppDispatch } from "@/hooks/useAppDispatch";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // const router = useR
  const dispatch = useAppDispatch();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#C72C3B",
        tabBarLabelStyle: { fontFamily: "PoppinsSemibold" },
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
            <Octicons name="home-fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="az-menu"
        options={{
          title: "Az Menu",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="bars" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            dispatch(
              setAzMenu({
                sport_id: "",
                sport_name: "",
              })
            );
          },
        }}
      />
      <Tabs.Screen
        name="casino"
        options={{
          title: "Casino",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="dice-five" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            router.push("/(casino)");

            // // Navigate to casino external URL
            // const url = "https://casino.bet24.com/en/casino";
            // if (typeof window !== "undefined") {
            //   window.open(url, "_blank");
            // }
          },
        }}
      />
      <Tabs.Screen
        name="open-bets"
        options={{
          title: "Open Bets",
          tabBarIcon: ({ color }) => (
            <Octicons name="feed-issue-reopen" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-alt" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
