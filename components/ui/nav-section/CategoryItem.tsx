import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useTournamentsQuery } from "@/store/services/bets.service";
import { SportCategory } from "@/data/types/betting.types";
import TournamentItem from "./TournamentItem";
import { FontAwesome } from "@expo/vector-icons";
import SkeletonBox from "./SkeletonBox";
import { Text } from "@/components/Themed";

type CategoryItemProps = {
  category: SportCategory;
  sportId: string;
};

const TournamentSkeleton = () => {
  return (
    <View
      style={{
        borderBottomWidth: 0.6,
        paddingInline: 16,
        borderColor: "#333",
        padding: 8,
      }}
    >
      <SkeletonBox width="80%" height={14} />
    </View>
  );
};

const CategoryItem = ({ category, sportId }: CategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: tournamentsData, isLoading: tournamentsLoading } =
    useTournamentsQuery(
      {
        category_id: category?.categoryID || "",
        period: "all",
        timeoffset: "0",
        total: category?.total.toString() || "0",
      },
      { skip: !category?.categoryID || !isExpanded }
    );

  const tournaments = Array.isArray(tournamentsData?.sports)
    ? tournamentsData.sports
    : [];

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 4,
          paddingBottom: 8,
          paddingBlock: 10,
          paddingRight: 12,
          borderBottomWidth: 0.6,
          borderTopWidth: 0.6,
          borderColor: "#333",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "500" }}>
            {category.categoryName}
          </Text>
          {category.total > 0 && (
            <Text style={{ color: "#888", fontSize: 13 }}>
              ({category.total})
            </Text>
          )}
        </View>
        <FontAwesome
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#888"
        />
      </TouchableOpacity>

      {/* Tournaments */}
      {isExpanded && tournamentsLoading ? (
        // Show tournament skeletons
        <>
          {[...Array(3)].map((_, i) => (
            <TournamentSkeleton key={i} />
          ))}
        </>
      ) : isExpanded && tournaments.length > 0 ? (
        tournaments.map((t, idx) => (
          <TournamentItem
            key={idx}
            tournament={t}
            categoryId={category.categoryID}
            sportId={sportId}
          />
        ))
      ) : isExpanded ? (
        <View
          style={{
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#666", fontSize: 14 }}>
            No tournaments available.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default CategoryItem;

const styles = StyleSheet.create({});
