import { OVERVIEW } from "@/data/routes/routes";
import { useLoginMutation } from "@/store/services/auth.service";
import environmentConfig, {
  getEnvironmentVariable,
  ENVIRONMENT_VARIABLES,
} from "@/store/services/configs/environment.config";
import { showToast, TOAST_TYPE_ENUM } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";

export const useLogin = () => {
  // Hook implementation goes here
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const { closeModal } = useModal();
  const [login, { isLoading, isSuccess, isError, data, error }] =
    useLoginMutation();

  const handleLogin = async () => {
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

      await login({
        username: formData.username,
        password: formData.password,
        clientId: environmentConfig.CLIENT_ID,
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
          title: "Welcome back!",
          description: `Good to see you, ${data?.data?.username}`,
        });
        router.push("/(tabs)");
        closeModal();
      } else {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Login Failed",
          description: data?.error,
        });
      }
    }
    if (isError) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Login Failed",
        description:
          error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "Invalid username or password",
      });
    }
  }, [isSuccess, isError, isLoading]);

  return { formData, errors, isLoading, handleInputChange, handleLogin };
};
