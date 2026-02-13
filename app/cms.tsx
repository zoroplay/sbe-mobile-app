import { StyleSheet, ScrollView, ActivityIndicator, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useGetCMSQuery } from "@/store/services/app.service";
import { Text } from "@/components/Themed";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";

const cms = () => {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { width } = useWindowDimensions();
  const { data, isLoading, error } = useGetCMSQuery(
    { page: page || "terms_and_conditions" },
    { skip: !page },
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C72C3B" />
      </View>
    );
  }

  if (error || !data?.data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load content</Text>
      </View>
    );
  }

  // Handle array-like object structure from API
  const cmsContent = (() => {
    const dataObj = data.data;
    // Convert object to array and find mobile target or first item
    const entries = Object.values(dataObj);
    const mobileContent = entries.find((item: any) => item.target === "mobile");
    return mobileContent || entries[0];
  })() as { title: string; content: string } | null;

  if (!cmsContent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No content available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {cmsContent?.title && (
          <Text style={styles.title}>{cmsContent.title}</Text>
        )}
        {cmsContent.content && (
          <RenderHtml
            contentWidth={width}
            source={{ html: cmsContent.content }}
            tagsStyles={{
              body: { color: "#ffffff" },
              p: { color: "#e0e0e0", marginBottom: 10 },
              h1: { color: "#ffffff", fontSize: 24 },
              h2: { color: "#ffffff", fontSize: 20 },
              h3: { color: "#ffffff", fontSize: 18 },
              h4: { color: "#ffffff", fontSize: 16 },
              h5: { color: "#ffffff", fontSize: 14 },
              li: { color: "#e0e0e0" },
              strong: { color: "#ffffff", fontWeight: "bold" },
              b: { color: "#ffffff", fontWeight: "bold" },
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default cms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(6,0,25)",
    padding: 16,
  },
  content: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
});
