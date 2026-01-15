import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useGamesCategoriesQuery } from "@/store/services/gaming.service";
import { setTabName } from "@/store/features/slice/app.slice";
import { categoryIconMap } from "@/data/nav/data";

export default function LandingPage() {
  const router = useRouter();
  const { is_authenticated } = useAppSelector((state) => state.user);

  const { data: categories_data, isLoading: categoriesLoading } =
    useGamesCategoriesQuery();
  const categories = Array.isArray(categories_data?.data)
    ? categories_data.data
    : [];
  const dispatch = useAppDispatch();
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    let loop: any;
    if (categoriesLoading) {
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
  }, [categoriesLoading, pulseAnim]);
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {categoriesLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Animated.View
              key={idx}
              style={[styles.providerCard, { opacity: pulseAnim }]}
            >
              <View style={styles.loadingIcon} />
              <View style={styles.loadingText} />
            </Animated.View>
          ))
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Categories found.</Text>
          </View>
        ) : (
          categories.map((category, idx) => (
            <TouchableOpacity
              key={category.id || idx}
              style={styles.providerCard}
              onPress={() => {
                dispatch(setTabName(category.name));
                router.push(`/(category)/${category.id}`);
              }}
              activeOpacity={0.7}
            >
              {categoryIconMap({
                font_size: 24,
                color: "#dddddd",
                name: category.name,
              })}
              <Text style={styles.providerName}>{category.name}</Text>
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
    paddingHorizontal: 16,
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
});
