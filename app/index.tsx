import { useAppSelector } from "@/hooks/useAppDispatch";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View, Animated, Easing, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OVERVIEW } from "@/data/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import AppImage from "@/components/inputs/AppImage";

export default function LandingPage() {
  const router = useRouter();
  const { is_authenticated } = useAppSelector((state) => state.user);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    try {
      setLoading(true);
      const timer = setTimeout(() => {
        router.replace("/(tabs)");
      }, 1200);
      return () => clearTimeout(timer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }, [is_authenticated, router]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading && (
        <>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <AppImage
              imageKey={"adaptiveIcon"}
              height={132}
              width={180}
              style={{
                height: 160,
                width: 220,
                resizeMode: "contain",
              }}
            />
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
