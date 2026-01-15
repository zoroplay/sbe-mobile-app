import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface LoadingBarProps {
  isLoading: boolean;
  height?: number;
  backgroundColor?: string;
  barColor?: string;
  opacity?: number;
  borderRadius?: number;
}

const LoadingBar: React.FC<LoadingBarProps> = ({
  isLoading,
  height = 4,
  backgroundColor = "#f1f5f9",
  barColor = "#64748b",
  opacity = 0.5,
  borderRadius = 6,
}) => {
  const translateX = useSharedValue(-100);

  useEffect(() => {
    if (isLoading) {
      translateX.value = withRepeat(
        withTiming(100, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      translateX.value = -100;
    }
  }, [isLoading, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${translateX.value}%` }],
    };
  });

  if (!isLoading) return null;

  return (
    <View
      style={[
        styles.container,
        {
          opacity,
          borderRadius,
        },
      ]}
    >
      <View
        style={[
          styles.background,
          {
            height,
            backgroundColor,
            borderRadius,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              height,
              backgroundColor: barColor,
              borderRadius,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  background: {
    width: "100%",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    position: "absolute",
  },
});

export default LoadingBar;
