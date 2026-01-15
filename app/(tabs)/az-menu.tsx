import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useQueryFixturesMutation,
  useSportsMenuQuery,
} from "@/store/services/bets.service";
import { categoryIconMap, sportIconMap, SportName } from "@/data/nav/data";
import CountriesList from "@/components/ui/nav-section/CountriesList";
import { setSearchQuery } from "@/store/features/slice/fixtures.slice";
import SingleSearchInput from "@/components/inputs/SingleSearchInput";
import BetslipButton from "@/components/BetslipButton";
import { Text } from "@/components/Themed";

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    az_menu: { sport_id, sport_name },
  } = useAppSelector((state) => state.app);
  const {
    search: { search_query },
  } = useAppSelector((state) => state.fixtures);
  const { data: sportsData, isLoading: sportsLoading } = useSportsMenuQuery({
    period: "all",
    start_date: "",
    end_date: "",
    timeoffset: "0",
  });
  const [queryFixtures, { isSuccess, isLoading }] = useQueryFixturesMutation();
  const [selectedSport, setSelectedSport] = useState<{
    sport_id: string;
    sport_name: string;
  } | null>({ sport_id, sport_name });
  useEffect(() => {
    if (isSuccess) {
      console.log("Fixtures queried successfully");
      router.push(`/search`);
    }
  }, [isSuccess]);
  useEffect(() => {
    dispatch(setSearchQuery(""));
  }, []);

  // Set first sport as selected by default when sportsData is loaded
  useEffect(() => {
    if (!sport_id && sportsData && sportsData.length > 0) {
      setSelectedSport({
        sport_id: sport_id || sportsData[0].sportID,
        sport_name: sport_name || sportsData[0].sportName,
      });
    } else {
      setSelectedSport({
        sport_id: sport_id,
        sport_name: sport_name,
      });
    }
  }, [sportsData, sport_id, sport_name]);
  const sportsNav = (sportsData || []).map((sport) => ({
    sport_id: sport.sportID,
    name: sport.sportName,
    total: sport.total,
  }));
  return (
    <View
      style={{
        display: "flex",
        backgroundColor: "rgb(6,0,25)",
        height: "100%",
        // justifyContent: "flex-start",
        // alignItems: "center",
      }}
    >
      <View style={styles.searchBox}>
        <SingleSearchInput
          // type="phone"
          value={search_query}
          placeholder="Search Team/Players, League, Game ID"
          onSearch={(text) => {
            queryFixtures(text);
            dispatch(setSearchQuery(text));
          }}
          searchState={{
            isValid: false,
            isNotFound: false,
            isLoading: isLoading,
            message: "",
          }}
        />
      </View>

      <View style={styles.top_bar}>
        <FlatList
          data={sportsNav}
          horizontal
          renderItem={({ item }) => {
            const isSelected = selectedSport?.sport_id === item.sport_id;
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedSport({
                    sport_id: item.sport_id,
                    sport_name: item.name,
                  });
                }}
                style={[
                  styles.top_bar_item,
                  isSelected && styles.selected_top_bar_item,
                ]}
                key={item.name}
              >
                {categoryIconMap({
                  name: item.name,
                  color: isSelected ? "#fff" : "#B9B9BA",
                  font_size: 24,
                })}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: isSelected ? "#fff" : "#B9B9BA",
                    fontSize: 12,
                    fontWeight: "600",
                    fontFamily: "PoppinsSemibold",
                  }}
                >
                  {item.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, idz) => String(idz)}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <CountriesList sport_id={Number(selectedSport?.sport_id)} />
      <BetslipButton count={0} onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  top_bar: {
    paddingTop: 1,
    paddingBottom: 5,
    backgroundColor: "rgb(6,0,25)",
    display: "flex",
    flexDirection: "row",
    gap: 2,
  },
  top_bar_item: {
    borderColor: "#2a2a2a",
    borderWidth: 1,
    borderRadius: 4,
    height: 60,
    width: 80,
    marginInline: 2,
    padding: 2,
    paddingBlock: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "rgb(6,0,25)",
    gap: 4,
  },
  selected_top_bar_item: {
    borderColor: "#fff",
    borderWidth: 2,
    backgroundColor: "#1a1333",
  },
  searchBox: {
    // margin: 8,
    padding: 2,
    paddingBlock: 16,
    paddingBottom: 12,
    borderRadius: 6,
  },
});
