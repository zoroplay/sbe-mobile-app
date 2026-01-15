import { useBetting } from "@/hooks/useBetting";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
import React, { use, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "./Themed";

const { width } = Dimensions.get("window");
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 48;
const SLIDE_OFFSET = BUTTON_WIDTH - 44; // How much of the button is visible when hidden

export default function BetslipButton({
  onPress,
}: {
  count?: number;
  onPress?: () => void;
}) {
  const { selected_bets } = useBetting();

  const [visible, setVisible] = useState(false);
  const translateX = React.useRef(new Animated.Value(SLIDE_OFFSET)).current;
  const { openModal } = useModal();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: !visible ? SLIDE_OFFSET : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {});
  }, [visible]);

  return (
    <>
      {/* <TouchableWithoutFeedback onPress={handleToggle}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback> */}

      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => {
            if (visible) {
              // handleToggle();
              setVisible(false);
            } else {
              // onPress();
              setVisible(true);
              openModal({
                modal_name: MODAL_COMPONENTS.BETSLIP_MODAL,
              });
              setTimeout(() => setVisible(false), 300);
            }
          }}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selected_bets?.length}</Text>
          </View>
          <Text style={styles.buttonText}>BETSLIP</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  container: {
    position: "absolute",
    right: 0,
    bottom: 80,
    zIndex: 100,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C72C3B",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    height: BUTTON_HEIGHT,
    width: BUTTON_WIDTH,
    paddingLeft: 12,
    paddingRight: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  badgeText: {
    color: "#C72C3B",
    fontFamily: "PoppinsSemibold",
    fontSize: 14,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "PoppinsSemibold",
    fontSize: 14,
  },
});
