import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import OddsButton from "../../buttons/OddsButton";
import { Fixture, Outcome } from "@/data/types/betting.types";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { getFirebaseImage } from "@/assets/images";
import { Text } from "@/components/Themed";

interface FixtureCardProps {
  outcomes: Outcome[];
  fixture: Fixture;
}

const FixtureCard: React.FC<FixtureCardProps> = ({
  outcomes = [],
  fixture,
}) => {
  // Only show outcomes where marketName is '1X2' (case-insensitive)
  const oneX2Outcomes = outcomes.filter((o) => o.marketID && o.marketID === 1);

  // console.log("FixtureCard - oneX2Outcomes:", oneX2Outcomes);
  // From those, get only 1X, X, 2

  return (
    <View style={styles.card}>
      <Text style={styles.tournament}>
        {fixture.categoryName} - {fixture.tournament}
      </Text>
      <View style={styles.row}>
        <View style={styles.teamCol}>
          <Image
            source={{
              uri: getFirebaseImage(fixture.homeTeam.toUpperCase()).team,
            }}
            // source={localImages.bundesliga_logo}
            width={50}
            height={60}
            style={[styles.logo]}
          />

          <Text style={styles.team}>{fixture.homeTeam}</Text>
        </View>
        <View style={styles.centerCol}>
          <Text style={styles.time}>
            {fixture.eventTime} | {formatDate(fixture.date)}
          </Text>
          <Text style={styles.market}>1X2</Text>
        </View>
        <View style={styles.teamCol}>
          <Image
            source={{
              uri: getFirebaseImage(fixture.awayTeam.toUpperCase()).team,
            }}
            style={styles.logo}
          />

          <Text style={styles.team}>{fixture?.awayTeam}</Text>
        </View>
      </View>
      <View style={styles.oddsRow}>
        {oneX2Outcomes.map((o, idx) => (
          <OddsButton
            key={o.outcomeID || idx}
            outcome={o}
            game_id={fixture.gameID as unknown as number}
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
    marginVertical: 8,
    marginHorizontal: 4,
    display: "flex",
    flexDirection: "column",
    justifyContent:"space-between",
    alignItems:'flex-start',
    gap: 8,
    elevation: 2,
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

export default FixtureCard;
