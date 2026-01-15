import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "react-native";
import { getFirebaseImage, remoteImages } from "@/assets/images";
import { Game } from "@/store/services/types/responses";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { setCasinoGame } from "@/store/features/slice/fixtures.slice";
import { router } from "expo-router";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";

interface GameCardProps {
  isLoading?: boolean;
  game?: Game;
}

export const EmptyState = ({
  message = "Sorry, there are no games currently available in this category. Please try later.\nThank you",
}) => (
  <View style={styles.emptyStateContainer}>
    <Ionicons
      name="sad-outline"
      size={48}
      color="#aaa"
      style={{ marginBottom: 8 }}
    />

    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const GameCard = ({ isLoading, game }: GameCardProps) => {
  const pulseAnim = useState(() => new Animated.Value(0.6))[0];
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  const { user } = useAppSelector((state) => state.user);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);
  if (isLoading || !game) {
    <Animated.View style={[styles.gameCardLoading, { opacity: pulseAnim }]}>
      <Animated.View
        style={[styles.gameImageLoading, { opacity: pulseAnim }]}
      />
      <View style={styles.gameCardContentLoading}>
        <Animated.View
          style={[styles.gameTitleLoading, { opacity: pulseAnim }]}
        />
        <Animated.View
          style={[styles.gameTypeLoading, { opacity: pulseAnim }]}
        />
      </View>
    </Animated.View>;
  }

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
    router.push(`/game-play`);
  };
  return (
    <TouchableOpacity
      style={styles.gameCard}
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
      <View style={styles.gameCardContent}>
        <Text style={styles.gameTitle}>{game?.title}</Text>
        <Text style={styles.gameType} numberOfLines={1}>
          {game?.type}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default GameCard;

const styles = StyleSheet.create({
  gameCardLoading: {
    minWidth: 200,
    width: "49.5%",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#18181b",
    elevation: 2,
  },
  gameImageLoading: {
    width: "100%",
    height: 90,
    backgroundColor: "#222",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    opacity: 0.5,
  },
  gameCardContentLoading: {
    padding: 8,
    backgroundColor: "#18181b",
  },
  gameTitleLoading: {
    width: "80%",
    height: 18,
    backgroundColor: "#333",
    borderRadius: 4,
    marginBottom: 8,
  },
  gameTypeLoading: {
    width: "60%",
    height: 14,
    backgroundColor: "#333",
    borderRadius: 4,
  },
  gameCard: {
    minWidth: 200,
    width: "49.5%",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#18181b",
    elevation: 2,
  },
  gameImage: {
    width: "100%",
    height: 90,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  gameCardContent: {
    padding: 8,
    backgroundColor: "#18181b",
  },
  gameTitle: {
    color: "#d9251d",
    fontWeight: "bold",
    fontSize: 16,
  },
  gameType: {
    color: "#aaa",
    fontSize: 14,
    textTransform: "uppercase",
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 100,
    backgroundColor: "rgb(6,0,25)",
  },
  emptyStateText: {
    color: "#aaa",
    fontSize: 18,
    textAlign: "center",
    marginTop: 4,
  },
});
