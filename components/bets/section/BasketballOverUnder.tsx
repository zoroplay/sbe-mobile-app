import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OddsButton from "@/components/buttons/OddsButton";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { Outcome } from "@/data/types/betting.types";
import SkeletonCard from "./skeletons/SkeletonCard";

type Props = {
  fixture_data: PreMatchFixture;
  disabled?: boolean;
  is_loading?: boolean;
  market_id: number;
};

const BasketballOverUnder = ({
  fixture_data,
  disabled,
  is_loading,
  market_id,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID || outcome.marketId) === market_id
    ) || [];
  const title =
    outcomes.find((item) => !!item.marketName)?.marketName ||
    "Basketball Over/Under";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;

  // Group outcomes by specifier (total value)
  const pairsBySpecifier: Record<string, { over?: Outcome; under?: Outcome }> =
    {};
  outcomes.forEach((outcome) => {
    const spec = outcome.specifier;
    const outcomeName = (
      outcome.outcomeName ||
      outcome.displayName ||
      ""
    ).toLowerCase();
    if (!spec || !spec.match(/total=(\d+(?:\.\d+)?)/)) return;
    if (!pairsBySpecifier[spec]) {
      pairsBySpecifier[spec] = {};
    }
    if (outcomeName.includes("over")) {
      pairsBySpecifier[spec].over = outcome;
    } else if (outcomeName.includes("under")) {
      pairsBySpecifier[spec].under = outcome;
    }
  });
  const specifiers = Object.keys(pairsBySpecifier).sort((a, b) => {
    const getVal = (spec: string) => {
      const m = spec.match(/total=(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : 0;
    };
    return getVal(a) - getVal(b);
  });
  if (specifiers.length === 0) return null;

  return (
    <View style={[styles.card]}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={() => setIsCollapsed((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.headerRow}>
          <Ionicons
            name="basketball-outline"
            size={20}
            style={{ marginRight: 4 }}
          />
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
        <ScrollView style={{ marginTop: 8, maxHeight: 400 }}>
          <View>
            {/* Table headers */}
            <View style={styles.headerGridRow}>
              <Text style={[styles.axisLabel, { minWidth: 48 }]}>Total</Text>
              <Text
                style={[styles.axisLabel, { flex: 1, textAlign: "center" }]}
              >
                Over
              </Text>
              <Text
                style={[styles.axisLabel, { flex: 1, textAlign: "center" }]}
              >
                Under
              </Text>
            </View>
            {/* Outcome rows */}
            {specifiers.map((spec, index) => {
              const group = pairsBySpecifier[spec] || {};
              const value = spec.match(/total=(\d+(?:\.\d+)?)/)?.[1] || spec;
              return (
                <View key={spec} style={styles.gridRow}>
                  <View style={styles.axisCell}>
                    <Text style={styles.axisLabel}>{value}</Text>
                  </View>
                  <View
                    style={[styles.gridCell, { flexDirection: "row", flex: 1 }]}
                  >
                    <View style={{ flex: 1, marginRight: 2 }}>
                      <OddsButton
                        outcome={group?.over!}
                        game_id={fixture_data?.gameID as number}
                        fixture_data={fixture_data}
                        show_display_name={true}
                        height={44}
                        disabled={!group?.over || disabled}
                        rounded={8}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 2 }}>
                      <OddsButton
                        outcome={group?.under!}
                        game_id={fixture_data?.gameID as number}
                        fixture_data={fixture_data}
                        show_display_name={true}
                        height={44}
                        disabled={!group?.under || disabled}
                        rounded={8}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
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
    fontSize: 13,
    color: "#222",
    marginLeft: 6,
  },
  skeleton: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
  headerGridRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  axisCell: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  axisLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
  },
  gridCell: {
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
});
export default BasketballOverUnder;
