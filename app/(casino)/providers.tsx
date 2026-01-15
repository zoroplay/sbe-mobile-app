import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { useGameProvidersQuery } from "@/store/services/gaming.service";
import { StyleSheet, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import { setTabName } from "@/store/features/slice/app.slice";

export default function LandingPage() {
  const router = useRouter();
  const { is_authenticated } = useAppSelector((state) => state.user);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, isSuccess, isLoading } = useGameProvidersQuery();
  // Convert providers object to array for easier usage
  const providersArray = data?.data ? Object.values(data.data) : [];
  const dispatch = useAppDispatch();
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let loop: any;
    if (isLoading) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isLoading, pulseAnim]);
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Animated.View
              key={idx}
              style={[styles.providerCard, { opacity: pulseAnim }]}
            >
              <View style={styles.loadingIcon} />
              <View style={styles.loadingText} />
            </Animated.View>
          ))
        ) : providersArray.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No providers found.</Text>
          </View>
        ) : (
          providersArray.map((provider, idx) => (
            <TouchableOpacity
              key={provider.id || idx}
              style={styles.providerCard}
              onPress={() => {
                dispatch(setTabName(provider.name));
                router.push(`/(provider)/${provider.id}`);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.providerName}>{provider.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 16,
    backgroundColor: "#000",
  },
  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  providerCard: {
    backgroundColor: "#181818",
    borderWidth: 2,
    borderColor: "#222",
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  providerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 48,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    opacity: 0.7,
  },
  loadingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#222",
    marginRight: 12,
  },
  loadingText: {
    width: 120,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#222",
  },
});
