import { useAppSelector } from "@/hooks/useAppDispatch";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OVERVIEW } from "@/data/routes/routes";
import { Ionicons } from "@expo/vector-icons";

export default function LandingPage() {
  const router = useRouter();
  const { is_authenticated } = useAppSelector((state) => state.user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Wait for the next tick to ensure the layout is mounted
      const timer = setTimeout(() => {

    
          router.replace("/(tabs)");
        
      }, 100);

      return () => clearTimeout(timer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [is_authenticated, router]);

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#023c69" }}>
      
    </SafeAreaView>
  );
}
