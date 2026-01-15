import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getEnvironmentVariable,
  ENVIRONMENT_VARIABLES,
} from "../configs/environment.config";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = getEnvironmentVariable(
  ENVIRONMENT_VARIABLES.ACCESS_TOKEN
);
const REFRESH_TOKEN_KEY = getEnvironmentVariable(
  ENVIRONMENT_VARIABLES.REFRESH_TOKEN
);

// Check if SecureStore is available (it might not be on all devices)
const isSecureStoreAvailable = async () => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const setAccessToken = async (token: string): Promise<void> => {
  try {
    // Try to use SecureStore first
    const secureStoreAvailable = await isSecureStoreAvailable();

    if (secureStoreAvailable) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } else {
      // Fall back to AsyncStorage if SecureStore is not available
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error("Error storing refresh token:", error);
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);

    const secureStoreAvailable = await isSecureStoreAvailable();
    if (secureStoreAvailable) {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
};
