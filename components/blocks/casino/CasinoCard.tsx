import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { getFirebaseImage, remoteImages } from "@/assets/images";
import { Game } from "@/store/services/types/responses";
import { router } from "expo-router";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { setCasinoGame } from "@/store/features/slice/fixtures.slice";
import { MODAL_COMPONENTS } from "@/store/features/types/modal.types";
import { useModal } from "@/hooks/useModal";

interface FixtureCardProps {
  game?: Game;
}

const CasinoCard: React.FC<FixtureCardProps> = ({ game }) => {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  const { user } = useAppSelector((state) => state.user);
  const handlePress = () => {
    if (!game || !user || !user.id) {
      openModal({
        modal_name: MODAL_COMPONENTS.LOGIN_MODAL,
      });
      return;
    }

    dispatch(
      setCasinoGame({
        game_name: game.title,
        game_id: String(game.id),
      }),
    );
    // Navigate to the game play screen, pass game info (adjust route name and params as needed)
    router.push(`/game-play`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <Image
        source={{
          uri: game?.title
            ? getFirebaseImage(game?.title!).casino
            : remoteImages.placeholder,
        }}
        style={styles.gameImage}
        resizeMode="cover"
      />
      <Text style={styles.gameTitle} numberOfLines={1}>
        {game?.title || ""}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a2233",
    borderRadius: 6,
    padding: 0,
    marginVertical: 8,
    marginHorizontal: 4,
    display: "flex",
    flexDirection: "column",
    gap: 0,
    elevation: 2,
    overflow: "hidden",
    width: 180,
    height: 144,
    position: "relative",
  },
  gameImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#222",
  },
  gameTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 2,
    backgroundColor: "#232b3bcc",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 8,
    zIndex: 10,
  },
  tournament: {
    color: "#ff4d4f",
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  teamCol: {
    alignItems: "center",
    flex: 1,
  },
  centerCol: {
    alignItems: "center",
    flex: 1.2,
  },
  team: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 4,
    fontSize: 13,
    textAlign: "center",
  },
  logo: {
    width: 45,
    height: 55,
    resizeMode: "contain",
    // backgroundColor: "#ffffffee",
    objectFit: "contain",
  },
  time: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  market: {
    color: "#ff4d4f",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 12,
  },
  oddsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  oddsBtn: {
    backgroundColor: "#2a3350",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 2,
  },
  oddsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CasinoCard;
