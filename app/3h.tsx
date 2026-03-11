import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import FixturesBlock from "@/components/fixtures/FixturesBlock";
import { useFixturesHighlightsQuery } from "@/store/services/bets.service";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useMemo } from "react";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";

export default function ModalScreen() {
  const {
    sports_page: { sport_id },
  } = useAppSelector((state) => state.fixtures);

  const { data: fixtures_data, isFetching } = useFixturesHighlightsQuery({
    sport_id: String(sport_id),
    period: "3h",
  });

  const fixtures = useMemo(() => {
    if (!fixtures_data?.fixtures) return [];
    return fixtures_data.fixtures.map((tem) => ({
      ...tem,
      event_type: "pre",
      status: (tem as any).status ?? 0,
    })) as unknown as PreMatchFixture[];
  }, [fixtures_data?.fixtures]);

  const markets = fixtures_data?.markets ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, width: "100%", backgroundColor: "rgb(6,0,25)" }}>
        <FixturesBlock
          markets={markets}
          fixtures={fixtures}
          isLoading={isFetching}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
