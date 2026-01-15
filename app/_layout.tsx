import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { store, persistor } from "@/store/store";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ModalProvider from "@/components/dialogs/ModalProvider";
import SingleSearchInput from "@/components/inputs/SingleSearchInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useQueryFixturesMutation } from "@/store/services/bets.service";
import { setSearchQuery } from "@/store/features/slice/fixtures.slice";
import { useGetGlobalVariablesQuery } from "@/store/services/app.service";
import { Text } from "@/components/Themed";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
let splashPrevented = false;
if (!splashPrevented) {
  SplashScreen.preventAutoHideAsync();
  splashPrevented = true;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Questrial: require("../assets/fonts/Poppins-Regular.ttf"),
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsSemibold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    ...FontAwesome.font,
  });
  const [persistLoaded, setPersistLoaded] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timeout fallback for persistLoaded
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!persistLoaded) {
        console.warn(
          "PersistGate did not finish after 10 seconds. Forcing persistLoaded to true.",
        );
        setPersistLoaded(true);
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [persistLoaded]);

  // Handle font loading errors
  useEffect(() => {
    if (fontError) {
      setError(
        fontError instanceof Error ? fontError.message : String(fontError),
      );
    }
  }, [fontError]);

  // Hide splash screen when both fonts and persist are loaded
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded && persistLoaded && !splashHidden) {
        try {
          await SplashScreen.hideAsync();
          setSplashHidden(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    };
    hideSplash();
  }, [fontsLoaded, persistLoaded, splashHidden]);

  // Always render Provider, but conditionally show loading/error screens
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 18 }}>Initializing...</Text>
          </View>
        }
        persistor={persistor}
        onBeforeLift={() => {
          setPersistLoaded(true);
        }}
      >
        {!fontsLoaded ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 18 }}>Loading fonts...</Text>
          </View>
        ) : error ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              backgroundColor: "#fff",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "red",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Error: {error}
            </Text>
            <Text style={{ fontSize: 16, color: "black", textAlign: "center" }}>
              Please restart the app
            </Text>
          </View>
        ) : (
          <RootLayoutNav />
        )}
      </PersistGate>
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  // Safe selector usage: fallback to empty/defaults if state is not ready
  const fixturesState = useAppSelector((state) => state?.fixtures ?? {});
  const search = fixturesState?.search ?? {};
  const search_query = search?.search_query ?? "";

  const [queryFixtures, { isLoading }] = useQueryFixturesMutation();
  useGetGlobalVariablesQuery();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />

        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ title: "Home", headerShown: false }}
            />
            <Stack.Screen name="(casino)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ title: "Sports" }} />
            <Stack.Screen
              name="profile-details"
              options={{
                title: "Profile",
              }}
            />
            <Stack.Screen
              name="deposit"
              options={{
                title: "Deposit",
              }}
            />
            <Stack.Screen
              name="withdrawal"
              options={{
                title: "Withdrawal",
              }}
            />
            <Stack.Screen
              name="live"
              options={{
                title: "Live",
              }}
            />
            <Stack.Screen
              name="game-play"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ticket-details"
              options={{
                title: "Ticket Details",
                // headerShown: false,
              }}
            />
            <Stack.Screen name="(provider)" options={{ headerShown: false }} />
            <Stack.Screen name="(category)" options={{ headerShown: false }} />
            <Stack.Screen
              name="search"
              options={{
                headerTitle: () => (
                  <SingleSearchInput
                    value={search_query}
                    placeholder="Search Team/Players, League, Game ID"
                    onSearch={(text) => {
                      queryFixtures(text);
                      dispatch(setSearchQuery(text));
                    }}
                    searchState={{
                      isValid: false,
                      isNotFound: false,
                      isLoading: isLoading,
                      message: "",
                    }}
                  />
                ),
              }}
            />
          </Stack>

          <ModalProvider />
        </ThemeProvider>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}
