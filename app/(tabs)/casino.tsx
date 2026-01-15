import { useAppSelector } from "@/hooks/useAppDispatch";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function LandingPage() {
  const router = useRouter();
  const { is_authenticated } = useAppSelector((state) => state.user);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "red",
              fontSize: 18,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Error: {error}
          </Text>
          <Button
            title="Retry"
            onPress={() => {
              setError(null);
              setIsReady(false);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              width: 128,
              height: 128,
              borderRadius: 64,
              backgroundColor: "#E0F2FE",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="business-outline" size={64} color="#3B82F6" />
          </View>
          <Text style={{ marginTop: 16, color: "#6B7280", fontSize: 16 }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#023c69" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            color: "red",
            fontSize: 18,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Error:
        </Text>
      </View>
    </SafeAreaView>
  );
}
