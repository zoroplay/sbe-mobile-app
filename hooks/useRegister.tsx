import { OVERVIEW } from "@/data/routes/routes";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/store/services/auth.service";
import environmentConfig, {
  getEnvironmentVariable,
  ENVIRONMENT_VARIABLES,
} from "@/store/services/configs/environment.config";
import { showToast, TOAST_TYPE_ENUM } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";

export const useRegister = () => {
  // Hook implementation goes here
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    promoCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const { closeModal } = useModal();
  const [register, { isLoading, isSuccess, isError, data, error }] =
    useRegisterMutation();

  const handleRegister = async () => {
    try {
      const newErrors: Record<string, string | null> = {};

      if (!formData.username) {
        newErrors.username = "Username is required";
      }

      // Validate password
      // const passwordError = Validators.validatePassword(formData.password);
      // if (passwordError) {
      //   newErrors.password = passwordError;
      // }

      if (!formData.password) {
        newErrors.password = "Password is required";
      }

      setErrors(newErrors);
      if (Object.values(newErrors).some((error) => error)) {
        return;
      }

      await register({
        username: formData.username,
        password: formData.password,
        clientId: environmentConfig.CLIENT_ID,
        promoCode: formData.promoCode,
      }).unwrap();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.error?.message ||
        "Network error. Please check your connection.";
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Login Failed",
        description: errorMessage,
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.success) {
        showToast({
          type: TOAST_TYPE_ENUM.SUCCESS,
          title: "Welcome!",
          description: `Good to see you, ${data?.data?.username}`,
        });
        router.push("/(tabs)");
      } else {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Registration Failed",
          description: data?.error,
        });
      }
    }
    if (isError) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Registration Failed",
        description:
          error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          "Invalid username or password",
      });
    }
  }, [isSuccess, isError, isLoading]);

  return { formData, errors, isLoading, handleInputChange, handleRegister };
};
