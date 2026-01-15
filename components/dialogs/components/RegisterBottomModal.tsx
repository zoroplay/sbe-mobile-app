import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import BottomModal from "../modals/BottomModal";
import Input from "@/components/inputs/Input";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useRegister } from "@/hooks/useRegister";

interface RegisterBottomModalProps {
  onClose: () => void;
}
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.6;
const RegisterBottomModal = ({ onClose }: RegisterBottomModalProps) => {
  const { openModal } = useModal();
  const { formData, errors, isLoading, handleInputChange, handleRegister } =
    useRegister();

  return (
    <BottomModal
      height={DEFAULT_HEIGHT}
      visible={true}
      onClose={onClose}
      dismissible={true}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Bet24 with your mobile number</Text>
        </View>
        <Input
          type="phone"
          value={formData.username}
          placeholder="Mobile Number"
          onChangeText={(text) =>
            handleInputChange({
              target: { name: "username", value: text },
            } as any)
          }
          error={errors.username}
        />
        <Input
          type="password"
          value={formData.password}
          placeholder="Password"
          onChangeText={(text) =>
            handleInputChange({
              target: { name: "password", value: text },
            } as any)
          }
          error={errors.password}
        />
        <Input
          value={formData.promoCode}
          placeholder="Promo code (optional)"
          onChangeText={(text) =>
            handleInputChange({
              target: { name: "promoCode", value: text },
            } as any)
          }
          error={errors.promoCode}
        />
        <TouchableOpacity
          disabled={isLoading}
          style={styles.loginBtn}
          onPress={handleRegister}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Continue</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footer}
          onPress={() => {
            openModal({
              modal_name: MODAL_COMPONENTS.LOGIN_MODAL,
            });
          }}
        >
          <Text style={styles.create}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
};

export default RegisterBottomModal;
const styles = StyleSheet.create({
  container: {
    padding: 8,
    // borderTopLeftRadius: 16,
    // borderTopRightRadius: 16,
    display: "flex",
    flexDirection: "column",
    // gap: 16,
    zIndex: 999999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
    padding: 12,
    paddingBottom: 22,
  },
  title: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginBtn: {
    backgroundColor: "#393C44",
    borderRadius: 6,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  loginText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: {
    alignItems: "center",
    marginTop: 8,
    padding: 4,
  },
  create: { color: "#E53935", fontSize: 15, fontWeight: "bold" },
});
