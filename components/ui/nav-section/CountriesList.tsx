import { ScrollView, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { useSportsCategoriesQuery } from "@/store/services/bets.service";
import CategoryItem from "./CategoryItem";
import SkeletonBox from "./SkeletonBox";
import { Text } from "@/components/Themed";
type CountriesListProps = {
  sport_id: number;
};
const CategorySkeleton = () => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 4,
        paddingBlock: 10,
        paddingRight: 12,
        borderBottomWidth: 0.6,
        borderTopWidth: 0.6,
        borderColor: "#333",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <SkeletonBox width={120} height={16} />
        <SkeletonBox width={40} height={14} style={{ borderRadius: 8 }} />
      </View>
      <SkeletonBox width={20} height={20} style={{ borderRadius: 4 }} />
    </View>
  );
};

const CountriesList = ({ sport_id }: CountriesListProps) => {
  const { data: cats, isFetching: isLoading } = useSportsCategoriesQuery({
    sport_id: String(sport_id),
    period: "all",
  });

  const categories = Array.isArray(cats?.sports) ? cats.sports : [];

  if (isLoading) {
    return (
      <View style={{ backgroundColor: "#060019" }}>
        {/* Header Skeleton */}
        <View
          style={{
            paddingInline: 12,
            paddingBlock: 12,
            borderBottomWidth: 1,
            borderColor: "#333",
          }}
        >
          <SkeletonBox width={60} height={18} />
        </View>

        {/* Category Skeletons */}
        {[...Array(12)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#060019" }}>
      {/* Header */}
      <View
        style={{
          paddingInline: 12,
          paddingBlock: 6,
          borderBottomWidth: 1,
          borderColor: "#333",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold" }}>
          A-Z
        </Text>
      </View>

      {/* Categories */}
      <ScrollView>
        {categories.map((cat, idx) => {
          return (
            <CategoryItem key={idx} category={cat} sportId={String(sport_id)} />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CountriesList;

const styles = StyleSheet.create({});
