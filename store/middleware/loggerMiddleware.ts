import { Middleware } from "@reduxjs/toolkit";

const isDev = process.env.NODE_ENV === "development";

export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (!isDev) return next(action);

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
    // ConditionError = RTK Query served from cache (not a real error — skip it)
    const isConditionAbort =
      "error" in action &&
      typeof (action as any).error === "object" &&
      (action as any).error?.name === "ConditionError";

    if (!isConditionAbort) {
      console.log("❌ API Response Error:", {
        type: action.type,
        ...("error" in action ? { error: action.error } : {}),
      });
    }
  }

  return result;
};
