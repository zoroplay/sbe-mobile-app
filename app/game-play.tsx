import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  useGameProviderListQuery,
  useGameStartQuery,
} from "@/store/services/gaming.service";
import environmentConfig from "@/store/services/configs/environment.config";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { getFirebaseImage } from "@/assets/images";
import { Game } from "@/store/services/types/responses";
import { SafeAreaView } from "react-native-safe-area-context";
import { setCasinoGame } from "@/store/features/slice/fixtures.slice";
import GameCard from "@/components/cards/GameCard";

const GamePlay = () => {
  const { user } = useAppSelector((state) => state.user);
  const { casino } = useAppSelector((state) => state.fixtures);
  const game_id = casino.game_id;
  const game_name = casino.game_name;
  const dispatch = useAppDispatch();
  const [showRecommendedGames, setShowRecommendedGames] = useState(false);
  const {
    data: game_list_data,
    isFetching: gameListLoading,
    refetch: refetchGameList,
  } = useGameProviderListQuery({ provider_id: String("11") });
  const game_list: Game[] = Array.isArray(game_list_data?.data)
    ? game_list_data.data
    : [];
  const { data, isLoading } = useGameStartQuery(
    {
      gameId: Number(game_id),
      clientId: environmentConfig.CLIENT_ID!,
      username: user?.username || "",
      userId: Number(user?.id || ""),
      demo: false,
      isMobile: true,
      authCode: user?.authCode || "",
      homeUrl: Platform.OS === "web" ? window.location.origin : "myapp://home",
      balanceType: "real",
    },
    {
      skip: !game_id || !user,
    }
  );

  const handleExit = useCallback(() => {
    router.push("/(casino)");
  }, []);

  const handleStay = useCallback(() => {
    setShowRecommendedGames(false);
  }, []);

  const handleSelectGame = useCallback((game: any) => {
    setShowRecommendedGames(false);

    dispatch(
      setCasinoGame({
        game_name: game.title,
        game_id: String(game.id),
      })
    );
    // Navigate to the game play screen, pass game info (adjust route name and params as needed)
    router.push(`/game-play`);
  }, []);

  // Header
  const HeaderCasinoPlay = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => setShowRecommendedGames(true)}>
        <Text style={styles.backBtn}>{"<"} Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {game_name || "Game"}
      </Text>
      <View style={{ width: 60 }} />
    </View>
  );

  // Recommended Games Modal
  const RecommendedGamesModal = () => (
    <Modal
      visible={showRecommendedGames}
      transparent
      animationType="slide"
      onRequestClose={handleStay}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            You may also like these games...
          </Text>
          <FlatList
            data={game_list}
            horizontal
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => <GameCard game={item} />}
          />
          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Exit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stayBtn} onPress={handleStay}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Stay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <HeaderCasinoPlay />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e41827" />
          </View>
        ) : (
          <WebView
            source={{ uri: data?.data?.url || "" }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e41827" />
              </View>
            )}
          />
        )}
        <RecommendedGamesModal />
      </View>
    </SafeAreaView>
  );
};

export default GamePlay;

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e41827",
    height: 56,
    paddingHorizontal: 16,
    paddingTop: 0,
    zIndex: 10,
  },
  backBtn: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#232733",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    width: "100%",
    minHeight: 260,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  recommendCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#181a20",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 8,
  },
  recommendImage: {
    width: 150,
    height: 130,
    backgroundColor: "#222",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  recommendTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 4,
    maxWidth: 140,
  },
  recommendType: {
    color: "#bfc9e0",
    fontSize: 13,
    marginTop: 2,
  },
  modalBtnRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 16,
    justifyContent: "space-between",
  },
  exitBtn: {
    backgroundColor: "#6b7280",
    flex: 1,
    marginRight: 8,
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 12,
  },
  stayBtn: {
    backgroundColor: "#e41827",
    flex: 2,
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 12,
  },
});
