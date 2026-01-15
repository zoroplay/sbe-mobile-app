import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { useLogin } from "@/hooks/useLogin";

interface LoginBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateAccount?: () => void;
  onForgotPassword?: () => void;
}

const LoginBottomSheet: React.FC<LoginBottomSheetProps> = ({
  visible,
  onClose,
  onCreateAccount,
  onForgotPassword,
}) => {
  const { formData, errors, isLoading, handleInputChange, handleLogin } =
    useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign In</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>×</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.prefix}>+234</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={formData.username}
            onChangeText={(text) =>
              handleInputChange({
                target: { name: "username", value: text },
              } as any)
            }
          />
        </View>
        {errors.username ? (
          <Text style={styles.error}>{errors.username}</Text>
        ) : null}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) =>
              handleInputChange({
                target: { name: "password", value: text },
              } as any)
            }
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Text style={{ color: "#aaa", fontSize: 18, marginLeft: 8 }}>
              {showPassword ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.forgot}>Forgot Password ?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCreateAccount}>
            <Text style={styles.create}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  container: {
    backgroundColor: "#181B22",
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  close: { color: "#fff", fontSize: 28, fontWeight: "bold" },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgot: { color: "#fff", fontSize: 15 },
  create: { color: "#E53935", fontSize: 15, fontWeight: "bold" },
});

export default LoginBottomSheet;
