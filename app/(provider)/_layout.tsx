import { useAppSelector } from "@/hooks/useAppDispatch";
import { Stack } from "expo-router";
import { SafeAreaViewBase } from "react-native";

export default function ProviderLayout() {
  const { tab_name } = useAppSelector((state) => state.app);
  return (
    // <SafeAreaViewBase>
    <Stack
      screenOptions={{
        title: tab_name ?? "Provider Details",
      }}
    />
    // {/* </SafeAreaViewBase> */}
  );
}
