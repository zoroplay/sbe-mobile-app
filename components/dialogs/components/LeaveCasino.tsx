import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import BottomModal from "../modals/BottomModal";
import GameCard from "@/components/cards/GameCard";
import { useGameProviderListQuery } from "@/store/services/gaming.service";
import { Game } from "@/store/services/types/responses";
import { router } from "expo-router";


const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LeaveCasino = ({ onClose }: { onClose: () => void }) => {
  const { data: game_list_data } = useGameProviderListQuery({
    provider_id: String("11"),
  });
  const game_list: Game[] = Array.isArray(game_list_data?.data)
    ? game_list_data.data
    : [];
      const DEFAULT_HEIGHT =
    SCREEN_HEIGHT * 0.4;

  return (
    <BottomModal
      visible={true}
      onClose={() => {
        onClose();
      }}
            height={DEFAULT_HEIGHT}

      dismissible={true}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>You may also like these games...</Text>
        </View>
        <View style={{  paddingInline: 12 }}>


        <FlatList
          data={game_list}
          horizontal
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => <GameCard game={item} />}
          />
          </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.bookBtn,
              {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRightWidth: 1,
              },
            ]}
            onPress={() => {
              router.push("/(casino)");
              onClose();
            }}
          >
            <Text style={styles.bookBtnText}>Exit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.placeBtn,
              {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderRightColor: "#062663",
                backgroundColor: "#062663",
                borderColor: "#062663",
              },
            ]}
          >
            <Text style={styles.placeBtnText} onPress={onClose}>
              Stay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomModal>
  );
};

export default LeaveCasino;
const styles = StyleSheet.create({
  container: {
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    zIndex: 999999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
    padding: 12,
    paddingBottom: 22,
  },
  title: { color: "#000", fontSize: 24, fontWeight: "bold" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232733",
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  bookBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#2A2D36",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 8,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  placeBtn: {
    flex: 2,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#C72C3B",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 8,
  },
  placeBtnText: {
    color: "#fff",
    fontFamily: "PoppinsSemibold",
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingBottom: 12,
    gap: 8,
  },
});
