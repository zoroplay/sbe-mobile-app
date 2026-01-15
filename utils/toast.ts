import Toast from "react-native-toast-message";

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
  Toast.show({
    type: toastData.type,
    text1: toastData.title,
    text2: toastData.description,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
    props: {
      style: {
        zIndex: 1000000,
      },
    },
  });
};
