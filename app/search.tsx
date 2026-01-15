import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import FixturesBlock from "@/components/fixtures/FixturesBlock";
import { useQueryFixturesMutation } from "@/store/services/bets.service";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { setSearchQuery } from "@/store/features/slice/fixtures.slice";
import SingleSearchInput from "@/components/inputs/SingleSearchInput";

export default function ModalScreen() {
  const {
    search: { fixtures: fixtures = [], markets = [], search_query },
  } = useAppSelector((state) => state.fixtures);
  const [queryFixtures, { isLoading }] = useQueryFixturesMutation();

  const dispatch = useAppDispatch();

  return (
    <View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />

      <ScrollView>
        <View
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "rgb(6,0,25)",
            paddingBottom: 24,
            height: "100%",
          }}
        >
          <FixturesBlock
            markets={markets}
            fixtures={fixtures}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </View>
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
  searchBox: {
    // margin: 8,
    padding: 12,
    paddingBlock: 16,
    paddingBottom: 8,
    borderRadius: 6,
  },
});
