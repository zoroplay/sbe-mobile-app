import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Keyboard, Platform, StyleSheet } from "react-native";

interface CustomKeyboardAvoidingViewProps {
  children: React.ReactNode;
  style?: any;
}

const CustomKeyboardAvoidingView: React.FC<CustomKeyboardAvoidingViewProps> = ({
  children,
  style,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const bottomAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardShow =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHide =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(keyboardShow, (e) => {
      const kbHeight = e.endCoordinates?.height || 0;
      setKeyboardHeight(kbHeight);
      Animated.timing(bottomAnim, {
        toValue: kbHeight,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(keyboardHide, () => {
      setKeyboardHeight(0);
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [bottomAnim]);

  return (
    <Animated.View style={[style, { paddingBottom: bottomAnim }]}>
      {children}
    </Animated.View>
  );
};

export default CustomKeyboardAvoidingView;
