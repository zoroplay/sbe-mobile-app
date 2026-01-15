import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../Themed";

type Props = {
  onPress: () => void;
  value: string | React.ReactNode;
  height?: number;
  bg_color?: string;
  disabled?: boolean;
  rounded?: Record<string, number>;
};

const Button = ({
  onPress,
  value,
  bg_color = "#fff",
  height = 40,
  disabled,
  rounded = { borderRadius: 8 },
}: Props) => {
  // Button style logic
  const getButtonStyle = () => {
    // if (is_disabled) {
    //   return [
    //     styles.button,
    //     { backgroundColor: "#e5e7eb", borderColor: "#d1d5db" },
    //   ];
    // }
    // if (isSelected) {
    //   return [
    //     styles.button,
    //     { backgroundColor: "#2563eb", borderColor: "#2563eb" },
    //   ];
    // }
    return [
      styles.button,
      { backgroundColor: bg_color, borderColor: "#d1d5db" },
    ];
  };

  return (
    <TouchableOpacity
      // disabled={is_disabled}
      style={[...getButtonStyle(), { height, ...rounded }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.odds}>{value}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // width: "100%",
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  displayName: {
    fontSize: 11,
    color: "#222",
    marginRight: 4,
  },
  odds: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
  },
  lockIconWrap: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowUpWrap: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#10B98120",
    borderRadius: 12,
    padding: 2,
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDownWrap: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF444420",
    borderRadius: 12,
    padding: 2,
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
