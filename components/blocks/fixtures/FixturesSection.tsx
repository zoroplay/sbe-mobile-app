import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import FixtureCard from "./FixtureCard";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useLazyFixturesQuery } from "@/store/services/bets.service";
import { MaterialIcons } from "@expo/vector-icons";
import { Fixture } from "@/data/types/betting.types";
import { Text } from "@/components/Themed";
import { getFirebaseImage, localImages } from "@/assets/images";

const CONCURRENCY_LIMIT = 3;

interface TournamentGamesEntry {
  tournamentID: number;
  fixtures: any[];
  markets: any[];
}

interface FlatFixtureItem {
  fixture: any;
  tournamentID: number;
}

const FixturesSection: React.FC<{ is_loading?: boolean }> = ({
  is_loading,
}) => {
  const { top_bets } = useAppSelector((state) => state.fixtures);
  const [fetchFixtures] = useLazyFixturesQuery();

  const orderedTopBets = useMemo(() => {
    if (!top_bets || top_bets.length === 0) return top_bets ?? [];
    const arr = [...top_bets];
    const soccerIndex = arr.findIndex(
      (s) => s.sportName && s.sportName.toLowerCase() === "soccer",
    );
    if (soccerIndex > 0) {
      const [soccer] = arr.splice(soccerIndex, 1);
      arr.unshift(soccer);
    }
    return arr;
  }, [top_bets]);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [tournamentGames, setTournamentGames] = useState<
    TournamentGamesEntry[]
  >([]);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const fixturesListRef = useRef<FlatList<FlatFixtureItem>>(null);

  // Fetch ALL tournaments upfront in parallel (concurrency-limited),
  // so tab switching only needs to scroll — no re-fetching.
  useEffect(() => {
    if (
      !orderedTopBets?.length ||
      isFetchingRef.current ||
      hasFetchedRef.current
    )
      return;

    isFetchingRef.current = true;
    setIsFetchingAll(true);

    const fetchAll = async () => {
      const results: TournamentGamesEntry[] = [];
      const chunks: (typeof orderedTopBets)[] = [];

      for (let i = 0; i < orderedTopBets.length; i += CONCURRENCY_LIMIT) {
        chunks.push(orderedTopBets.slice(i, i + CONCURRENCY_LIMIT));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (tournament) => {
            try {
              const data = await fetchFixtures({
                tournament_id: String(tournament.tournamentID),
                sport_id: String(tournament.sportID ?? 1),
                period: "all",
                market_id: "1",
                specifier: "",
              }).unwrap();

              if (data?.fixtures?.length && data?.markets?.length) {
                results.push({
                  tournamentID: tournament.tournamentID,
                  fixtures: data.fixtures.slice(0, 5),
                  markets: data.markets,
                });
              }
            } catch {
              // skip failed tournament silently
            }
          }),
        );
      }

      // Preserve orderedTopBets order (soccer first)
      const ordered = orderedTopBets
        .map((t) => results.find((r) => r.tournamentID === t.tournamentID))
        .filter((r): r is TournamentGamesEntry => r !== undefined);

      setTournamentGames(ordered);
      setIsFetchingAll(false);
      isFetchingRef.current = false;
      hasFetchedRef.current = true;
    };

    fetchAll();
  }, [orderedTopBets.length]); // only re-run if the set of tournaments changes

  // Flatten all tournament fixtures into one array and track each
  // tournament's starting index so we can scrollToIndex instantly.
  const { flatData, tournamentStartIndices } = useMemo(() => {
    const flat: FlatFixtureItem[] = [];
    const indices: Record<number, number> = {};
    for (const tg of tournamentGames) {
      indices[tg.tournamentID] = flat.length;
      for (const fixture of tg.fixtures) {
        flat.push({ fixture, tournamentID: tg.tournamentID });
      }
    }
    return { flatData: flat, tournamentStartIndices: indices };
  }, [tournamentGames]);

  const handleTabPress = useCallback(
    (index: number) => {
      setSelectedIdx(index);
      const tournament = orderedTopBets[index];
      if (!tournament) return;
      const startIdx = tournamentStartIndices[tournament.tournamentID];
      if (
        startIdx !== undefined &&
        fixturesListRef.current &&
        flatData.length > 0
      ) {
        fixturesListRef.current.scrollToIndex({
          index: startIdx,
          animated: true,
        });
      }
    },
    [orderedTopBets, tournamentStartIndices, flatData.length],
  );

  const getImageURL = (name: string) => {
    if (name === "Championship") return localImages.efl_championship_logo;
    if (name === "Bundesliga") return localImages.bundesliga_logo;
    return { uri: getFirebaseImage(name).tournament };
  };

  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let loop: any;
    if (isFetchingAll) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isFetchingAll, pulseAnim]);

  return (
    <View
      style={{
        display: "flex",
        gap: 6,
        paddingVertical: 10,
      }}
    >
      {/* Tournament tab selector */}
      <View style={{ display: "flex", flexDirection: "row", width: "100%" }}>
        <FlatList
          data={orderedTopBets}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isSelected = index === selectedIdx;
            return (
              <View style={{ position: "relative", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => handleTabPress(index)}
                  style={{
                    padding: 4,
                    paddingInline: 6,
                    borderWidth: 2,
                    borderColor: isSelected ? "#9c9c9c" : "#6a6a6a",
                    backgroundColor: isSelected ? "#1a2233" : "transparent",
                    borderRadius: 30,
                    marginLeft: 10,
                    alignItems: "center",
                    flexDirection: "row",
                    height: 42,
                  }}
                >
                  <Image
                    source={getImageURL(item.tournamentName)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#ffffff80",
                    }}
                    resizeMode="contain"
                  />
                  {isSelected ? (
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 10,
                        marginInline: 4,
                        fontFamily: "PoppinsSemibold",
                      }}
                    >
                      {item.tournamentName}
                    </Text>
                  ) : null}
                </TouchableOpacity>
                {isSelected ? (
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={28}
                    color="#f3f3f3"
                    style={{
                      position: "absolute",
                      top: 30,
                      left: "50%",
                      marginLeft: -14,
                      zIndex: 2,
                      elevation: 2,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1,
                    }}
                  />
                ) : null}
              </View>
            );
          }}
        />
      </View>

      {/* Fixture cards — single flat list across all tournaments */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
      >
        {isFetchingAll ? (
          <FlatList
            data={[1, 2, 3]}
            horizontal
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={() => (
              <Animated.View
                style={{
                  width: 300,
                  height: 150,
                  backgroundColor: "#1a2233",
                  borderRadius: 12,
                  marginLeft: 10,
                  padding: 12,
                  opacity: pulseAnim,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 12,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                  <View
                    style={{
                      width: 40,
                      height: 12,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: "#2a3444",
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  />
                  <View
                    style={{
                      width: 120,
                      height: 14,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: "#2a3444",
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  />
                  <View
                    style={{
                      width: 120,
                      height: 14,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: "#2a3444",
                      borderRadius: 6,
                    }}
                  />
                  <View
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: "#2a3444",
                      borderRadius: 6,
                    }}
                  />
                  <View
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: "#2a3444",
                      borderRadius: 6,
                    }}
                  />
                </View>
              </Animated.View>
            )}
          />
        ) : flatData.length > 0 ? (
          <FlatList
            ref={fixturesListRef}
            data={flatData}
            horizontal
            keyExtractor={(item, idx) => `${item.tournamentID}-${idx}`}
            showsHorizontalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              // Fallback: scroll as far as possible if index is out of range
              fixturesListRef.current?.scrollToIndex({
                index: Math.min(info.index, flatData.length - 1),
                animated: true,
              });
            }}
            renderItem={({ item }) => (
              <FixtureCard
                outcomes={item.fixture.outcomes}
                fixture={item.fixture as unknown as Fixture}
              />
            )}
          />
        ) : (
          <View
            style={{
              width: "100%",
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="sports-soccer" size={48} color="#6a6a6a" />
            <Text
              style={{
                color: "#9c9c9c",
                fontSize: 16,
                marginTop: 12,
                fontFamily: "PoppinsSemibold",
              }}
            >
              No games available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FixturesSection;
