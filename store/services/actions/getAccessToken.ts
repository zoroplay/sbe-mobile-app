import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getEnvironmentVariable,
  ENVIRONMENT_VARIABLES,
} from "../configs/environment.config";

const ACCESS_TOKEN_KEY = getEnvironmentVariable(
  ENVIRONMENT_VARIABLES.ACCESS_TOKEN
);

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
};
