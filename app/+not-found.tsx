import { Link, Stack, useLocalSearchParams, usePathname } from "expo-router";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";

export default function NotFoundScreen() {
  const pathname = usePathname();
  console.log("404 - Not Found Screen Rendered", pathname);
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        {pathname && (
          <Text style={{ marginTop: 10, color: "#e74c3c", fontSize: 15 }}>
            URL not found:{" "}
            <Text style={{ fontWeight: "bold" }}>{pathname}</Text>
          </Text>
        )}
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
