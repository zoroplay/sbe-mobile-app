import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView, StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import FixturesBlock from "@/components/fixtures/FixturesBlock";
import { useFixturesQuery } from "@/store/services/bets.service";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useEffect } from "react";
import { setSportsPageFixtures } from "@/store/features/slice/fixtures.slice";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";

export default function ModalScreen() {
  const {} = useAppSelector((state) => state.fixtures);
  const {
    sports_page: {
      fixtures: fixtures = [],
      markets = [],
      sport_id,
      tournament_id,
    },
  } = useAppSelector((state) => state.fixtures);
  const {
    data: fixtures_data,
    isSuccess: is_success,
    isFetching,
  } = useFixturesQuery({
    tournament_id: String(tournament_id),
    sport_id: String(sport_id),
    period: "all",
    market_id: "1",
    // markets: "",
    specifier: "",
  });
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (is_success) {
      const fixtures = Array.isArray(fixtures_data.fixtures)
        ? fixtures_data.fixtures.map((tem) => ({
            ...tem,
            event_type: "pre",
            status: (tem as any).status ?? 0,
          }))
        : [];
      dispatch(
        setSportsPageFixtures({
          ...fixtures_data,
          markets: fixtures_data?.markets ?? [],
          fixtures: fixtures as unknown as PreMatchFixture[],
        })
      );
    }
  }, [is_success]);

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
