import { ActivityIndicator, StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { WebView } from "react-native-webview";
import { Text } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

const WebViewScreen = () => {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: title || "Web View",
      headerStyle: { backgroundColor: "#060019" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
    });
  }, [title, navigation]);

  if (!url) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>No URL provided</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C72C3B" />
        </View>
      )}
      {error ? (
        <View style={styles.center}>
          <Text style={{ color: "#fff", marginBottom: 12 }}>
            Failed to load page
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(false);
              setLoading(true);
              webViewRef.current?.reload();
            }}
            style={styles.retryBtn}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 6 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
        />
      )}
    </View>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060019" },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#060019",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#060019",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C72C3B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
