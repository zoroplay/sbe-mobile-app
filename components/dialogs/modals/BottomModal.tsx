import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Keyboard,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  height?: number | string;
  // dragAnywhereToClose?: boolean; // legacy, not used
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.5;

const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  dismissible = true,
  children,
  height = DEFAULT_HEIGHT,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const currentY = useRef(SCREEN_HEIGHT);
  const startY = useRef(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const modalHeight = typeof height === "number" ? height : DEFAULT_HEIGHT;
  const initialPosition = SCREEN_HEIGHT - modalHeight;
  const prevModalHeight = useRef(modalHeight);
  const keyboardOffset = useRef(0);

  // Remove PanResponder logic: drag-to-close is replaced by tap-to-close on indicator

  // Keep currentY in sync with translateY
  useEffect(() => {
    const listenerId = translateY.addListener(({ value }) => {
      currentY.current = value;
    });
    return () => translateY.removeListener(listenerId);
  }, [translateY]);

  // Animate modal to a specific Y position
  const animateTo = useCallback(
    (value: number) => {
      isAnimating.current = true;
      Animated.spring(translateY, {
        toValue: value,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
        overshootClamping: true,
      }).start(() => {
        isAnimating.current = false;
      });
    },
    [translateY]
  );

  // Handle closing the modal
  const handleClose = useCallback(() => {
    if (!dismissible || isAnimating.current) return;
    isAnimating.current = true;
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      onClose();
    });
  }, [dismissible, onClose, opacityAnim, translateY]);

  // Handle backdrop click (outside modal content)
  const handleBackdropPress = useCallback(() => {
    if (!dismissible) return;
    handleClose();
  }, [dismissible, handleClose]);

  // Keyboard event listeners to move modal up
  useEffect(() => {
    const keyboardShow =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHide =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(keyboardShow, (e) => {
      const kbHeight = e.endCoordinates?.height || 0;
      keyboardOffset.current = kbHeight;
      animateTo(initialPosition - kbHeight);
    });
    const hideSub = Keyboard.addListener(keyboardHide, () => {
      keyboardOffset.current = 0;
      animateTo(initialPosition);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animateTo, initialPosition]);

  // Animate modal in/out and handle dynamic height
  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      opacityAnim.setValue(0);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: initialPosition - keyboardOffset.current,
          useNativeDriver: true,
          damping: 15,
          stiffness: 100,
          overshootClamping: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    } else if (isMounted) {
      handleClose();
    }
    prevModalHeight.current = modalHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Listen for dynamic height changes and animate modal position
  useEffect(() => {
    if (!isMounted) return;
    if (prevModalHeight.current !== modalHeight) {
      const newPosition = SCREEN_HEIGHT - modalHeight - keyboardOffset.current;
      animateTo(newPosition);
      prevModalHeight.current = modalHeight;
    }
  }, [modalHeight, animateTo, isMounted]);

  if (!isMounted) return null;

  return (
    <Modal
      transparent
      visible={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.absoluteFill, { opacity: opacityAnim }]}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={8}
          tint={isDark ? "dark" : "light"}
          style={styles.absoluteFill}
          pointerEvents="none" // allow touches to pass through
        />
        {/* Overlay for outside click, only intercepts touches outside modal */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdropTouchable} pointerEvents={dismissible ? "auto" : "none"} />
        </TouchableWithoutFeedback>
        {/* Modal content above overlay, does not get intercepted */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              height: modalHeight,
              maxHeight: SCREEN_HEIGHT * 0.9,
              transform: [{ translateY }],
              backgroundColor: isDark ? "#000" : "#fff",
              borderTopColor: isDark ? "#1f2937" : "#e5e7eb",
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Drag indicator - tap to close */}
          {dismissible && (
            <TouchableWithoutFeedback onPress={handleClose}>
              <View
                style={[
                  styles.dragIndicatorContainer,
                  { backgroundColor: isDark ? "#000" : "#fff" },
                ]}
                pointerEvents="auto"
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                accessibilityHint="Tap to close the modal"
                testID="modal-drag-indicator"
                hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
              >
                <View
                  style={[
                    styles.dragIndicator,
                    { backgroundColor: isDark ? "#374151" : "#d1d5db" },
                  ]}
                />
              </View>
            </TouchableWithoutFeedback>
          )}
          {!dismissible && (
            <View
              style={[
                styles.dragIndicatorContainer,
                { backgroundColor: isDark ? "#000" : "#fff" },
              ]}
            >
              <View
                style={[
                  styles.dragIndicator,
                  { backgroundColor: isDark ? "#374151" : "#d1d5db" },
                ]}
              />
            </View>
          )}
          <View style={styles.contentContainer} pointerEvents="box-none">
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default BottomModal;

const styles = StyleSheet.create({
  absoluteFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  modalContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
    zIndex: 2,
  },
  dragIndicatorContainer: {
    width: "100%",
    paddingTop: 6,
    paddingBottom: 4,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  contentContainer: {
    paddingBottom: 20,
    flex: 1,
  },
});
