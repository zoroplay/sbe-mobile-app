import Constants from "expo-constants";

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
}

export const getEnvironmentVariable = (variable: ENVIRONMENT_VARIABLES) => {
  return Constants?.expoConfig?.extra?.[variable];
};

const getBaseUrl = (): string => {
  // return getEnvironmentVariable(ENVIRONMENT_VARIABLES.API_BASE_URL);
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
  // ACCESS_TOKEN: getEnvironmentVariable(ENVIRONMENT_VARIABLES.ACCESS_TOKEN),
  // REFRESH_TOKEN: getEnvironmentVariable(ENVIRONMENT_VARIABLES.REFRESH_TOKEN),
  // CLIENT_ID: 4,
  CLIENT_ID: 9,
  // CLIENT_ID: getEnvironmentVariable(ENVIRONMENT_VARIABLES.CLIENT_ID),
};

console.log(
  "getEnvironmentVariable: API_BASE_URL",
  environmentConfig.API_BASE_URL
);
console.log(
  "getEnvironmentVariable: CLIENT_ID",
  getEnvironmentVariable(ENVIRONMENT_VARIABLES.CLIENT_ID)
);
console.log("Environment Config:", environmentConfig);

export default environmentConfig;
