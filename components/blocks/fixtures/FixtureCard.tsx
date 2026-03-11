import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import OddsButton from "../../buttons/OddsButton";
import { Fixture, Outcome } from "@/data/types/betting.types";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { getFirebaseImage } from "@/assets/images";
import { Text } from "@/components/Themed";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";

interface FixtureCardProps {
  outcomes?: Outcome[];
  fixture?: Fixture;
  isLoading?: boolean;
}

const FixtureCard: React.FC<FixtureCardProps> = ({
  outcomes = [],
  fixture,
  isLoading = false,
}) => {
  // Only show outcomes where marketID is 1 (1X2)
  const oneX2Outcomes = outcomes.filter((o) => o.marketID && o.marketID === 1);

  // If not loading and there are less than 3 1X2 outcomes, do not render anything
  if (!isLoading && oneX2Outcomes.length < 3) {
    return null;
  }
  const { openModal } = useModal();

  if (isLoading) {
    // Skeleton card visually matching the real card
    return (
      <View style={styles.card}>
        <View
          style={{
            width: 120,
            height: 16,
            backgroundColor: "#2A2A2A",
            borderRadius: 4,
            marginBottom: 4,
          }}
        />
        <Pressable style={styles.row}>
          <View style={styles.teamCol}>
            <View
              style={[
                styles.logo,
                { backgroundColor: "#2A2A2A", borderRadius: 6 },
              ]}
            />
            <View
              style={{
                width: 60,
                height: 14,
                backgroundColor: "#2A2A2A",
                borderRadius: 4,
                marginTop: 8,
              }}
            />
          </View>
          <View style={styles.centerCol}>
            <View
              style={{
                width: 80,
                height: 14,
                backgroundColor: "#2A2A2A",
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <View
              style={{
                width: 40,
                height: 14,
                backgroundColor: "#2A2A2A",
                borderRadius: 4,
              }}
            />
          </View>
          <View style={styles.teamCol}>
            <View
              style={[
                styles.logo,
                { backgroundColor: "#2A2A2A", borderRadius: 6 },
              ]}
            />
            <View
              style={{
                width: 60,
                height: 14,
                backgroundColor: "#2A2A2A",
                borderRadius: 4,
                marginTop: 8,
              }}
            />
          </View>
        </Pressable>
        <View style={[styles.oddsRow, { marginTop: 10 }]}>
          {[1, 2, 3].map((_, idx) => (
            <View key={idx} style={{ flex: 1, marginHorizontal: 2 }}>
              <View
                style={{
                  backgroundColor: "#2A2A2A",
                  borderRadius: 6,
                  height: 32,
                  width: "100%",
                }}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.tournament}>
        {fixture ? `${fixture.categoryName} - ${fixture.tournament}` : ""}
      </Text>
      <Pressable
        style={styles.row}
        onPress={() => {
          openModal({
            modal_name: MODAL_COMPONENTS.GAME_OPTIONS_MODAL,
            ref: fixture?.gameID,
          });
        }}
      >
        <View style={styles.teamCol}>
          {fixture && (
            <Image
              source={{
                uri: getFirebaseImage(fixture.homeTeam.toUpperCase()).team,
              }}
              width={50}
              height={60}
              style={[styles.logo]}
            />
          )}
          <Text style={styles.team}>{fixture ? fixture.homeTeam : ""}</Text>
        </View>
        <View style={styles.centerCol}>
          <Text style={styles.time}>
            {fixture
              ? `${fixture.eventTime} | ${formatDate(fixture.date)}`
              : ""}
          </Text>
          <Text style={styles.market}>1X2</Text>
        </View>
        <View style={styles.teamCol}>
          {fixture && (
            <Image
              source={{
                uri: getFirebaseImage(fixture.awayTeam.toUpperCase()).team,
              }}
              style={styles.logo}
            />
          )}
          <Text style={styles.team}>{fixture ? fixture.awayTeam : ""}</Text>
        </View>
      </Pressable>
      <View style={styles.oddsRow}>
        {oneX2Outcomes.map((o, idx) => (
          <OddsButton
            key={o.outcomeID || idx}
            outcome={o}
            game_id={fixture ? (fixture.gameID as unknown as number) : 0}
            fixture_data={fixture as PreMatchFixture}
            rounded={
              idx === 0
                ? {
                    borderTopLeftRadius: 6,
                    borderBottomLeftRadius: 6,
                  }
                : idx === oneX2Outcomes.length - 1
                  ? {
                      borderTopRightRadius: 6,
                      borderBottomRightRadius: 6,
                    }
                  : {}
            }
          />
        ))}
      </View>
    </View>
  );
};

function formatDate(dateStr: string) {
  // Expects 'YYYY-MM-DD HH:mm:ss'
  const d = new Date(dateStr.replace(" ", "T"));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a2233",
    borderRadius: 6,
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 4,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    elevation: 2,
    minWidth: 280,
  },
  tournament: {
    color: "#ff4d4f",
    fontWeight: "bold",
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
    fontSize: 12,
    textAlign: "center",
    maxWidth: 90,
    // minHeight: 34,
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
    fontSize: 14,
  },
  market: {
    color: "#ff4d4f",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
  },
  oddsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
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
    fontSize: 14,
  },
});

export default FixtureCard;
