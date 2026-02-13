import { Alert } from "react-native";

export enum TOAST_TYPE_ENUM {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
}

interface ToastData {
  type?: TOAST_TYPE_ENUM;
  title: string;
  description?: string;
}

export const showToast = (toastData: ToastData) => {
  Alert.alert(
    toastData.title,
    toastData.description || "",
    [
      {
        text: "OK",
        style: "default",
      },
    ],
    { cancelable: true },
  );
};
