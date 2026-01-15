/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseQueryApi,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import CryptoJS from "crypto-js";
import * as ExpoCrypto from "expo-crypto";
import { logout } from "../../../hooks/useServerLogout";
import { getToken } from "../actions/getAccessToken";
import environmentConfig from "../configs/environment.config";
// import CryptoJS from "react-native-crypto-js";


async function randomIVWordArray(bytes = 16) {
  const randomBytes = await ExpoCrypto.getRandomBytesAsync(bytes);

  // Convert Uint8Array -> CryptoJS WordArray
  const wordArray = CryptoJS.lib.WordArray.create(randomBytes as any);

  return wordArray;
}

const generateApiKey = (): string => {
  const key = CryptoJS.SHA256(`${environmentConfig.CLIENT_ID}:${environmentConfig.SITE_KEY}`).toString(CryptoJS.enc.Hex);
  return key; // 64 hex chars (32 bytes)
};

const aesEncrypt = async (): Promise<string> => {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // 16-byte IV
    const iv = await randomIVWordArray(16);

    // Key (32 bytes) from SHA256 hex
    const hexKey = generateApiKey();
    const key = CryptoJS.enc.Hex.parse(hexKey);

    const encrypted = CryptoJS.AES.encrypt(timestamp, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const ivHex = iv.toString(CryptoJS.enc.Hex);
    const cipherHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

    const signature = ivHex + cipherHex;
    return signature;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
};


const TOKEN_REFRESH_LIMIT = {
  maxAttempts: 3,
  windowMs: 30000,
  minInterval: 5000,
};

class RateLimitedMutex {
  private mutex = new Mutex();
  private lastRefreshAttempt = 0;
  private refreshCount = 0;
  private lastErrorTime = 0;

  async acquire() {
    const now = Date.now();

    if (now - this.lastErrorTime < TOKEN_REFRESH_LIMIT.minInterval) {
      throw new Error("Token refresh in cooldown after recent error");
    }

    if (now - this.lastRefreshAttempt < TOKEN_REFRESH_LIMIT.minInterval) {
      throw new Error("Token refresh too frequent");
    }

    if (
      this.refreshCount >= TOKEN_REFRESH_LIMIT.maxAttempts &&
      now - this.lastRefreshAttempt < TOKEN_REFRESH_LIMIT.windowMs
    ) {
      throw new Error("Maximum token refresh attempts reached");
    }

    return this.mutex.acquire();
  }

  recordSuccess() {
    const now = Date.now();
    this.lastRefreshAttempt = now;
    this.refreshCount++;

    if (now - this.lastRefreshAttempt > TOKEN_REFRESH_LIMIT.windowMs) {
      this.refreshCount = 1;
    }
  }

  recordError() {
    this.lastErrorTime = Date.now();
  }

  isLocked() {
    return this.mutex.isLocked();
  }

  waitForUnlock() {
    return this.mutex.waitForUnlock();
  }
}

const refreshMutex = new RateLimitedMutex();

const baseQuery = fetchBaseQuery({
  baseUrl: environmentConfig.API_BASE_URL,
  prepareHeaders: async (headers, { endpoint }) => {
    try {
      const token = await getToken();

      headers.set("SBE-Client-ID", environmentConfig.CLIENT_ID);

      if (token && !["login", "forgotten"].includes(endpoint || "")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      try {
        const [apiKey, signature] = await Promise.all([
          generateApiKey(),
          aesEncrypt(),
        ]);
        headers.set("SBE-API-KEY", apiKey);
        headers.set("SBE-API-SIGNATURE", signature);
      } catch (encryptError) {
        console.error("Error adding encryption headers:", encryptError);
      }
    } catch (error) {
      console.error("Error preparing headers:", error);
    }
    return headers;
  },
});

const baseQueryWithLogging = async (args: any, api: any, extraOptions: any) => {
  const fullUrl = typeof args === "string" ? args : args.url;

  try {
    const result = await baseQuery(args, api, extraOptions);
    return result;
  } catch (error: any) {
    console.log("❌ API Error:", {
      url: `${fullUrl}`,
      error: error.message,
    });
    throw error;
  }
};

const baseQueryWithReauthAndRateLimiting = async (
  args: any,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const result = await baseQueryWithLogging(args, api, extraOptions);

  if (result.error?.status === 500) {
    console.warn("Server error (500) - backend issue", result.error);
    return result;
  }

  if (
    result.error &&
    (result.error.status === 401 ||
      result.error.status === 502 ||
      result.error.status === 503)
  ) {
    await logout(api.dispatch);
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauthAndRateLimiting,
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (userId) => ({
        url: `/users/${userId}`,
        extraOptions: { skipRefresh: true },
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
        isRefreshRequest: true,
      }),
    }),
  }),
  tagTypes: ["Chats", "Messages", "User", "Notifications"],
  keepUnusedDataFor: 50000,
  refetchOnReconnect: true,
});
