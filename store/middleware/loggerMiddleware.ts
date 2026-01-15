import { Middleware } from "@reduxjs/toolkit";

export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  // Log only API requests
  if (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string" &&
    (action.type.endsWith("/executeQuery") ||
      action.type.endsWith("/executeMutation"))
  ) {
    console.log("API Request:", {
      type: action.type,
      ...("payload" in action ? { payload: action.payload } : {}),
      ...("meta" in action ? { meta: action.meta } : {}),
    });
  }

  const result = next(action);

  // Log API responses
  if (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string" &&
    (action.type.endsWith("/executeQuery/fulfilled") ||
      action.type.endsWith("/executeMutation/fulfilled"))
  ) {
    console.log("✅ API Response Success:", {
      type: action.type,
      ...("payload" in action ? { payload: action.payload } : {}),
    });
  }
  if (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string" &&
    (action.type.endsWith("/executeQuery/rejected") ||
      action.type.endsWith("/executeMutation/rejected"))
  ) {
    console.log("❌ API Response Error:", {
      type: action.type,
      ...("error" in action ? { error: action.error } : {}),
    });
  }

  return result;
};
