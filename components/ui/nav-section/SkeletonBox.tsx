import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const SkeletonBox = ({
  width,
  height,
  style = {},
}: {
  width: number | string;
  height: number;
  style?: any;
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "#2A2A2A",
          borderRadius: 4,
          opacity,
        },
        style,
      ]}
    />
  );
};

export default SkeletonBox;
