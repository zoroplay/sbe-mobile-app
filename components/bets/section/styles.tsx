import { StyleSheet } from "react-native";
export const outcomes_box_styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    padding: 6,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
  },
  title: {
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "PoppinsSemibold",
    color: "#222",
    marginLeft: 6,
  },
});

export const OddsBtnRounded = ({
  index,
  length,
}: {
  index: number;
  length: number;
}) => {
  const isSecond = index === 1;
  const isFirst = index === 0;
  const isLast = index === length - 1;
  const isBeforeLast = index === length - 2;
  const isOddCount = length % 2 !== 0;
  let rounded = {};
  if (isSecond && isLast) {
    rounded = { borderTopRightRadius: 6, borderBottomRightRadius: 6 };
  } else if (isSecond) {
    rounded = { borderTopRightRadius: 6 };
  } else if (isLast && isOddCount) {
    rounded = {
      borderBottomRightRadius: 6,
      borderBottomLeftRadius: 6,
    };
  } else if (isLast) {
    rounded = { borderBottomRightRadius: 6 };
  } else if (isFirst && isBeforeLast) {
    rounded = { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 };
  } else if (isBeforeLast && !isOddCount) {
    rounded = { borderBottomLeftRadius: 6 };
  } else if (index === 0) {
    rounded = { borderTopLeftRadius: 6 };
  }
  return rounded;
};
