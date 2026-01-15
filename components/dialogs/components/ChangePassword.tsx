import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import BottomModal from "../modals/BottomModal";
import { useLogin } from "@/hooks/useLogin";
import Input from "@/components/inputs/Input";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useChangePasswordMutation } from "@/store/services/auth.service";
import environmentConfig from "@/store/services/configs/environment.config";
import { Text } from "@/components/Themed";
import { showToast, TOAST_TYPE_ENUM } from "@/utils/toast";
interface LoginBottomModalProps {
  // visible: boolean;
  onClose: () => void;
  // onCreateAccount?: () => void;
  // onForgotPassword?: () => void;
}

const ChangePasswordModal = ({ onClose }: LoginBottomModalProps) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { openModal } = useModal();

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const handleInputChange = (e: { name: string; value: string }) => {
    setFormData({ ...formData, [e.name]: e.value });
  };

  const handleUpdate = () => {
    setErrors({});
    const newErrors: { [key: string]: string } = {};
    if (!formData.oldPassword) {
      newErrors.oldPassword = "Old password is required.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    changePassword({
      clientId: environmentConfig.CLIENT_ID!,
      oldPassword: formData.oldPassword,
      password: formData.password,
    })
      .unwrap()
      .then(() => {
        showToast({
          type: TOAST_TYPE_ENUM.SUCCESS,
          title: "Password changed successfully",
          description: "Your password has been updated.",
        });
        onClose();
      })
      .catch((error) => {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Failed to change password",
          description: error.data?.message,
        });
      });
  };
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
          <Text style={styles.title}>Update Password</Text>
        </View>

        <Input
          type="password"
          value={formData.oldPassword}
          placeholder="Old Password"
          onChangeText={(text) =>
            handleInputChange({
              name: "oldPassword",
              value: text,
            })
          }
          error={errors.oldPassword}
        />
        <Input
          type="password"
          value={formData.password}
          placeholder="Password"
          onChangeText={(text) =>
            handleInputChange({
              name: "password",
              value: text,
            })
          }
          error={errors.password}
        />
        <Input
          type="password"
          value={formData.confirmPassword}
          placeholder="Confirm Password"
          onChangeText={(text) =>
            handleInputChange({
              name: "confirmPassword",
              value: text,
            })
          }
          error={errors.confirmPassword}
        />

        <TouchableOpacity
          style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
};

export default ChangePasswordModal;
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
