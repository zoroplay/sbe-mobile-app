import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getEnvironmentVariable,
  ENVIRONMENT_VARIABLES,
} from "../configs/environment.config";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = getEnvironmentVariable(
  ENVIRONMENT_VARIABLES.ACCESS_TOKEN,
);

const isSecureStoreAvailable = async () => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const secureStoreAvailable = await isSecureStoreAvailable();
    if (secureStoreAvailable) {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
};
