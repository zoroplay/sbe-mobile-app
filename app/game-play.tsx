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
import { MODAL_COMPONENTS } from "@/store/features/types/modal.types";
import { useModal } from "@/hooks/useModal";

const GamePlay = () => {
  const { user } = useAppSelector((state) => state.user);
  const { casino } = useAppSelector((state) => state.fixtures);
  const game_id = casino.game_id;
  const game_name = casino.game_name;
  const dispatch = useAppDispatch();
  const { openModal } = useModal();


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
    },
  );

 

  // const handleSelectGame = useCallback((game: any) => {
  //   setShowRecommendedGames(false);

  //   dispatch(
  //     setCasinoGame({
  //       game_name: game.title,
  //       game_id: String(game.id),
  //     }),
  //   );
  //   // Navigate to the game play screen, pass game info (adjust route name and params as needed)
  //   router.push(`/game-play`);
  // }, []);

  const HeaderCasinoPlay = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() =>
          openModal({
            modal_name: MODAL_COMPONENTS.LEAVE_CASINO_MODAL,
          })
        }
      >
        <Text style={styles.backBtn}>{"<"} Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {game_name || "Game"}
      </Text>
      <View style={{ width: 60 }} />
    </View>
  );



  const gameUrl =  data?.url || "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={styles.container}>
        <HeaderCasinoPlay />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e41827" />
            <Text style={{ color: "#fff", marginTop: 16 }}>
              Loading game...
            </Text>
          </View>
        ) : !gameUrl ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Game Unavailable</Text>
            <Text style={styles.errorMessage}>
              Unable to load the game at this time.{"\n"}
              Please try again later.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => router.push("/(casino)")}
            >
              <Text style={styles.retryButtonText}>Back to Casino</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: gameUrl }}
            style={styles.webview}
            startInLoadingState
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e41827" />
                <Text style={{ color: "#fff", marginTop: 16 }}>
                  Loading game...
                </Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("[WEBVIEW ERROR]", nativeEvent);
            }}
            onLoadStart={() => console.log("[WEBVIEW] Load started")}
            onLoadEnd={() => console.log("[WEBVIEW] Load ended")}
          />
        )}
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
    paddingHorizontal: 24,
  },
  webview: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    color: "#bfc9d1",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#e41827",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
