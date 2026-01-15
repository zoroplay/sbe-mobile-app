import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import OddsButton from "@/components/buttons/OddsButton";
import { Ionicons } from "@expo/vector-icons";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import SkeletonCard from "./skeletons/SkeletonCard";
import { Text } from "@/components/Themed";

type Props = {
  fixture_data: PreMatchFixture;
  disabled?: boolean;
  is_loading?: boolean;
  market_id: number;
};

const MainCard = ({ fixture_data, disabled, is_loading, market_id }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Replace with your theme logic
  const marketCardBg = "#fff";
  const marketCardBorder = "#e5e7eb";

  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID || outcome.marketId) === market_id
    ) || [];
  let title = outcomes.find((item) => !!item.marketName)?.marketName || "";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;
  if (!title) return null;

  // Dynamic grid columns
  const getGridCols = (len: number) => {
    if (len <= 1) return { flexDirection: "row" };
    if (len <= 2)
      return { flexDirection: "row", justifyContent: "space-between" };
    if (len <= 3)
      return { flexDirection: "row", justifyContent: "space-between" };
    if (len <= 4) return { flexDirection: "row", flexWrap: "wrap" };
    return { flexDirection: "row", flexWrap: "wrap" };
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: marketCardBg, borderColor: marketCardBorder },
      ]}
    >
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={() => setIsCollapsed((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.headerRow}>
          <Ionicons
            name={
              isCollapsed ? "chevron-forward-outline" : "chevron-down-outline"
            }
            size={18}
            color="#222"
          />
          <Text style={styles.title}>{title}</Text>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#888"
            style={{ marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>
      {!isCollapsed && (
        <View style={[styles.grid, getGridCols(outcomes.length)]}>
          {outcomes.map((outcome, index) => (
            <View
              style={{ flex: 1, minWidth: 60 }}
              key={outcome?.outcomeID || index}
            >
              <OddsButton
                outcome={outcome}
                game_id={fixture_data?.gameID as unknown as number}
                fixture_data={fixture_data}
                show_display_name={true}
                height={48}
                disabled={disabled}
                rounded={
                  index === 0
                    ? {
                        borderTopLeftRadius: 6,
                        borderBottomLeftRadius: 6,
                      }
                    : outcomes.length - 1 === index
                      ? {
                          borderTopRightRadius: 6,
                          borderBottomRightRadius: 6,
                        }
                      : {}
                }
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default MainCard;

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    padding: 6,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    elevation: 3,
  },
  headerBtn: {
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    fontFamily: "PoppinsSemibold",
    fontSize: 12,
    color: "#222",
    marginLeft: 6,
  },
  grid: {
    width: "100%",
    paddingHorizontal: 8,
    // paddingTop: ,
    flexWrap: "wrap",
    // gap: 2,
  },
  skeleton: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
});
