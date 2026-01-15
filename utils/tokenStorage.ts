import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { ENVIRONMENT_VARIABLES } from "@/store/services/configs/environment.config";
import { getEnvironmentVariable } from "@/store/services/configs/environment.config";

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

// Store access token (short-lived, less sensitive)
export const storeAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing access token:", error);
  }
};

// Get access token
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
};

// Store refresh token (long-lived, more sensitive)
export const storeRefreshToken = async (token: string): Promise<void> => {
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

// Get refresh token
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    // Try to use SecureStore first
    const secureStoreAvailable = await isSecureStoreAvailable();

    if (secureStoreAvailable) {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } else {
      // Fall back to AsyncStorage if SecureStore is not available
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

// Clear all tokens (for logout)
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
