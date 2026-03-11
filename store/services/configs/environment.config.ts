import Constants from "expo-constants";
import { Platform } from "react-native";

export enum ENVIRONMENT_VARIABLES {
  ACCESS_TOKEN = "ACCESS_TOKEN",
  REFRESH_TOKEN = "REFRESH_TOKEN",
  CLIENT_ID = "CLIENT_ID",
  API_BASE_URL = "API_BASE_URL",
  SITE_KEY = "SITE_KEY",
  MQTT_URI = "MQTT_URI",
  MQTT_USERNAME = "MQTT_USERNAME",
  MQTT_PASSWORD = "MQTT_PASSWORD",
  MQTT_CLIENTID = "MQTT_CLIENTID",
  XPRESS_LAUNCH_URL = "XPRESS_LAUNCH_URL",
  XPRESS_PRIVATE_KEY = "XPRESS_PRIVATE_KEY",
}

export const getEnvironmentVariable = (variable: ENVIRONMENT_VARIABLES) => {
  return Constants?.expoConfig?.extra?.[variable];
};

const getBaseUrl = (): string => {
  // return getEnvironmentVariable(ENVIRONMENT_VARIABLES.API_BASE_URL);
  // return "https://api.prod.sportsbookengine.com/api/v2";
  return "https://sports.api.sportsbookengine.com/api/v2";
};

export const environmentConfig = {
  API_BASE_URL: getBaseUrl(),
  // SITE_KEY: "SBE",
  SITE_KEY: "B24",

  // SITE_KEY: getEnvironmentVariable(ENVIRONMENT_VARIABLES.SITE_KEY),
  MQTT_URI: getEnvironmentVariable(ENVIRONMENT_VARIABLES.MQTT_URI),
  MQTT_USERNAME: getEnvironmentVariable(ENVIRONMENT_VARIABLES.MQTT_USERNAME),
  MQTT_PASSWORD: getEnvironmentVariable(ENVIRONMENT_VARIABLES.MQTT_PASSWORD),
  XPRESS_LAUNCH_URL: getEnvironmentVariable(
    ENVIRONMENT_VARIABLES.XPRESS_LAUNCH_URL,
  ),
  XPRESS_PRIVATE_KEY:
    (getEnvironmentVariable(
      ENVIRONMENT_VARIABLES.XPRESS_PRIVATE_KEY,
    ) as string) ?? "",

  XPRESS_BACK_URL:
    Platform.OS === "android" ? "bet24://close" : "bet24://close",
  // ACCESS_TOKEN: getEnvironmentVariable(ENVIRONMENT_VARIABLES.ACCESS_TOKEN),
  // REFRESH_TOKEN: getEnvironmentVariable(ENVIRONMENT_VARIABLES.REFRESH_TOKEN),
  // CLIENT_ID: 4,
  CLIENT_ID: 9,
  // CLIENT_ID: getEnvironmentVariable(ENVIRONMENT_VARIABLES.CLIENT_ID),
};

console.log(
  "getEnvironmentVariable: API_BASE_URL",
  environmentConfig.API_BASE_URL,
);
console.log(
  "getEnvironmentVariable: CLIENT_ID",
  getEnvironmentVariable(ENVIRONMENT_VARIABLES.CLIENT_ID),
);
console.log("Environment Config:", environmentConfig);

export default environmentConfig;
