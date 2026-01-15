import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Tournament } from "@/data/types/betting.types";
import { router } from "expo-router";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setSportsPageQuery } from "@/store/features/slice/fixtures.slice";
import { Text } from "@/components/Themed";

type Props = {
  tournament: Tournament;
  categoryId: string;
  sportId: string;
};
const TournamentItem = ({ tournament, categoryId, sportId }: Props) => {
  const dispatch = useAppDispatch();
  return (
    <TouchableOpacity
      onPress={() => {
        // Handle tournament item press
        // router.push(`/sports/${sportId}/category/${categoryId}/tournament/${tournament.tournamentID}`);
        dispatch(
          setSportsPageQuery({
            sport_id: Number(sportId),
            tournament_id: Number(tournament.tournamentID),
          })
        );
        router.push(`/modal`);
      }}
      style={{
        borderBottomWidth: 0.6,
        paddingInline: 16,
        borderColor: "#333",
        padding: 8,
      }}
    >
      <Text style={{ fontSize: 14, color: "#999" }}>
        {tournament.tournamentName}
      </Text>
    </TouchableOpacity>
  );
};

export default TournamentItem;

const styles = StyleSheet.create({});
