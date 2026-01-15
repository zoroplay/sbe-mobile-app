import { StyleSheet, Text, View, Animated, Easing } from "react-native";
import React from "react";

const SkeletonCard = () => {
  const pulseAnim = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const animatedStyle = (extraStyle = {}) => [
    {
      backgroundColor: "#e5e7eb",
      opacity: pulseAnim,
    },
    extraStyle,
  ];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: "#ffffff", borderColor: "#e5e7eb" },
      ]}
    >
      {/* Skeleton Title */}
      <Animated.View
        style={animatedStyle({
          height: 24,
          borderRadius: 4,
          marginBottom: 8,
          width: "60%",
        })}
      />
      {/* Skeleton Grid */}
      <View>
        {[...Array(3)].map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              width: "100%",
            }}
          >
            {/* Specifier skeleton */}
            <Animated.View
              style={animatedStyle({
                // width: 48,
                height: 20,
                borderRadius: 4,
                marginRight: 8,
                width: "30%",
              })}
            />
            {/* Over skeleton */}
            <Animated.View
              style={animatedStyle({
                height: 40,
                borderRadius: 8,
                marginRight: 8,
                width: "30%",
              })}
            />
            {/* Under skeleton */}
            <Animated.View
              style={animatedStyle({
                height: 40,
                borderRadius: 8,
                width: "30%",
              })}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default SkeletonCard;

const styles = StyleSheet.create({
  card: {
    elevation: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    marginBottom: 8,
    width: "100%",
    backgroundColor: "red",
    display: "flex",
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerBtn: {
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    fontSize: 13,
    color: "#222",
    marginLeft: 6,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  axisCell: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  axisLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
  },
  gridCell: {
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  skeleton: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
});
