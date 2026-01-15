import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import BottomModal from "../modals/BottomModal";
import { useLogin } from "@/hooks/useLogin";
import Input from "@/components/inputs/Input";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
interface LoginBottomModalProps {
  // visible: boolean;
  onClose: () => void;
  // onCreateAccount?: () => void;
  // onForgotPassword?: () => void;
}

const LoginBottomModal = ({ onClose }: LoginBottomModalProps) => {
  const { formData, errors, isLoading, handleInputChange, handleLogin } =
    useLogin();
  const { openModal } = useModal();
  return (
    <BottomModal
      visible={true}
      onClose={() => {
        onClose();
        // Alert.alert("Modal closed");
      }}
      dismissible={true}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign In</Text>
          {/* <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>×</Text>
          </TouchableOpacity> */}
        </View>

        {errors.username ? (
          <Text style={styles.error}>{errors.username}</Text>
        ) : null}

        <Input
          type="phone"
          value={formData.username}
          placeholder="Mobile Number"
          onChangeText={(text) =>
            handleInputChange({
              target: { name: "username", value: text },
            } as any)
          }
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
        />
        {errors.password ? (
          <Text style={styles.error}>{errors.password}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>
        <View style={styles.footer}>
          {/* <TouchableOpacity onPress={onForgotPassword}> */}
          {/* <Text style={styles.forgot}>Forgot Password ?</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => {
              openModal({
                modal_name: MODAL_COMPONENTS.REGISTER_MODAL,
              });
            }}
          >
            <Text style={styles.create}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomModal>
  );
};

export default LoginBottomModal;
const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#181B22",
    padding: 8,
    // borderTopLeftRadius: 16,
    // borderTopRightRadius: 16,
    display: "flex",
    flexDirection: "column",

    gap: 4,
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
  title: { color: "#000", fontSize: 24, fontWeight: "bold" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232733",
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  prefix: { color: "#fff", fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  error: { color: "#ff6b6b", marginBottom: 8, marginLeft: 4, fontSize: 13 },
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
  forgot: { color: "#fff", fontSize: 15 },
  create: { color: "#E53935", fontSize: 15, fontWeight: "bold" },
});
