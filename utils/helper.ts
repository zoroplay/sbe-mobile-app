/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { localImages } from "@/assets/images";

import environmentConfig, {
  ENVIRONMENT_VARIABLES,
  getEnvironmentVariable,
} from "../store/services/configs/environment.config";
import { Outcome } from "@/data/types/betting.types";

export interface TimeComponents {
  minutes: number;
  seconds: number;
  totalSeconds: number;
}
export type LocalImageKey = keyof typeof localImages;
export type ImageKey = LocalImageKey;

type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? ExtractParamName<Param> | ExtractRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}&${infer Rest}`
      ? ExtractParamName<Param> | ExtractRouteParams<`&${Rest}`>
      : T extends `${string}:${infer Param}?${infer Rest}`
        ? ExtractParamName<Param> | ExtractRouteParams<`?${Rest}`>
      : T extends `${string}:${infer Param}`
        ? ExtractParamName<Param>
        : never;

// Helper type to extract just the parameter name, stopping at special chars
type ExtractParamName<T extends string> = 
  T extends `${infer Name}?${string}` 
    ? Name
    : T extends `${infer Name}&${string}`
      ? Name
      : T extends `${infer Name}/${string}`
        ? Name
        : T;

type RouteParams<T extends string> = {
  [K in ExtractRouteParams<T>]: string | number | (string | number)[];
};
export class AppHelper {
  // Global timeoffset value that can be set once and used throughout the app
  private static _globalTimeOffset: string = "+1";
  static isDarkColor = (color: string | undefined) => {
    if (!color) return false;

    // If color is a gradient (contains from-, via-, or to-), extract all stops
    if (/from-|via-|to-/.test(color)) {
      // Extract all color stops
      const stops = [];
      const fromMatch = color.match(/from-([a-zA-Z0-9-]+)/);
      const viaMatch = color.match(/via-([a-zA-Z0-9-]+)/);
      const toMatch = color.match(/to-([a-zA-Z0-9-]+)/);
      if (fromMatch) stops.push(fromMatch[1]);
      if (viaMatch) stops.push(viaMatch[1]);
      if (toMatch) stops.push(toMatch[1]);
      // If no stops found, fallback to original logic
      if (stops.length === 0) return false;
      // Compute brightness for each stop
      let darkCount = 0;
      let total = 0;
      for (const stop of stops) {
        if (AppHelper.isDarkColor(stop)) darkCount++;
        total++;
      }
      // If majority of stops are dark, treat as dark
      return darkCount / total >= 0.5;
    }

    // Tailwind color mapping to hex values
    const tailwindColors: { [key: string]: string } = {
      // Slate
      "slate-50": "#f8fafc",
      "slate-100": "#f1f5f9",
      "slate-200": "#e2e8f0",
      "slate-300": "#cbd5e1",
      "slate-400": "#94a3b8",
      "slate-500": "#64748b",
      "slate-600": "#475569",
      "slate-700": "#334155",
      "slate-800": "#1e293b",
      "slate-900": "#0f172a",
      "slate-950": "#020617",
      // Gray
      "gray-50": "#f9fafb",
      "gray-100": "#f3f4f6",
      "gray-200": "#e5e7eb",
      "gray-300": "#d1d5db",
      "gray-400": "#9ca3af",
      "gray-500": "#6b7280",
      "gray-600": "#4b5563",
      "gray-700": "#374151",
      "gray-800": "#1f2937",
      "gray-900": "#111827",
      "gray-950": "#030712",
      // Red
      "red-50": "#fef2f2",
      "red-100": "#fee2e2",
      "red-200": "#fecaca",
      "red-300": "#fca5a5",
      "red-400": "#f87171",
      "red-500": "#ef4444",
      "red-600": "#dc2626",
      "red-700": "#b91c1c",
      "red-800": "#991b1b",
      "red-900": "#7f1d1d",
      "red-950": "#450a0a",
      // Blue
      "blue-50": "#eff6ff",
      "blue-100": "#dbeafe",
      "blue-200": "#bfdbfe",
      "blue-300": "#93c5fd",
      "blue-400": "#60a5fa",
      "blue-500": "#3b82f6",
      "blue-600": "#2563eb",
      "blue-700": "#1d4ed8",
      "blue-800": "#1e40af",
      "blue-900": "#1e3a8a",
      "blue-950": "#172554",
      // Green
      "green-50": "#f0fdf4",
      "green-100": "#dcfce7",
      "green-200": "#bbf7d0",
      "green-300": "#86efac",
      "green-400": "#4ade80",
      "green-500": "#22c55e",
      "green-600": "#16a34a",
      "green-700": "#15803d",
      "green-800": "#166534",
      "green-900": "#14532d",
      "green-950": "#052e16",
      // Yellow
      "yellow-50": "#fefce8",
      "yellow-100": "#fef3c7",
      "yellow-200": "#fed7aa",
      "yellow-300": "#fcd34d",
      "yellow-400": "#fbbf24",
      "yellow-500": "#f59e0b",
      "yellow-600": "#d97706",
      "yellow-700": "#b45309",
      "yellow-800": "#92400e",
      "yellow-900": "#78350f",
      "yellow-950": "#451a03",
      // Purple
      "purple-50": "#faf5ff",
      "purple-100": "#f3e8ff",
      "purple-200": "#e9d5ff",
      "purple-300": "#d8b4fe",
      "purple-400": "#c084fc",
      "purple-500": "#a855f7",
      "purple-600": "#9333ea",
      "purple-700": "#7c3aed",
      "purple-800": "#6b21a8",
      "purple-900": "#581c87",
      "purple-950": "#3b0764",
      // Pink
      "pink-50": "#fdf2f8",
      "pink-100": "#fce7f3",
      "pink-200": "#fbcfe8",
      "pink-300": "#f9a8d4",
      "pink-400": "#f472b6",
      "pink-500": "#ec4899",
      "pink-600": "#db2777",
      "pink-700": "#be185d",
      "pink-800": "#9d174d",
      "pink-900": "#831843",
      "pink-950": "#500724",
      // Indigo
      "indigo-50": "#eef2ff",
      "indigo-100": "#e0e7ff",
      "indigo-200": "#c7d2fe",
      "indigo-300": "#a5b4fc",
      "indigo-400": "#818cf8",
      "indigo-500": "#6366f1",
      "indigo-600": "#4f46e5",
      "indigo-700": "#4338ca",
      "indigo-800": "#3730a3",
      "indigo-900": "#312e81",
      "indigo-950": "#1e1b4b",
      // Cyan
      "cyan-50": "#ecfeff",
      "cyan-100": "#cffafe",
      "cyan-200": "#a5f3fc",
      "cyan-300": "#67e8f9",
      "cyan-400": "#22d3ee",
      "cyan-500": "#06b6d4",
      "cyan-600": "#0891b2",
      "cyan-700": "#0e7490",
      "cyan-800": "#155e75",
      "cyan-900": "#164e63",
      "cyan-950": "#083344",
      // Teal
      "teal-50": "#f0fdfa",
      "teal-100": "#ccfbf1",
      "teal-200": "#99f6e4",
      "teal-300": "#5eead4",
      "teal-400": "#2dd4bf",
      "teal-500": "#14b8a6",
      "teal-600": "#0d9488",
      "teal-700": "#0f766e",
      "teal-800": "#115e59",
      "teal-900": "#134e4a",
      "teal-950": "#042f2e",
      // Emerald
      "emerald-50": "#ecfdf5",
      "emerald-100": "#d1fae5",
      "emerald-200": "#a7f3d0",
      "emerald-300": "#6ee7b7",
      "emerald-400": "#34d399",
      "emerald-500": "#10b981",
      "emerald-600": "#059669",
      "emerald-700": "#047857",
      "emerald-800": "#065f46",
      "emerald-900": "#064e3b",
      "emerald-950": "#022c22",
      // Orange
      "orange-50": "#fff7ed",
      "orange-100": "#ffedd5",
      "orange-200": "#fed7aa",
      "orange-300": "#fdba74",
      "orange-400": "#fb923c",
      "orange-500": "#f97316",
      "orange-600": "#ea580c",
      "orange-700": "#c2410c",
      "orange-800": "#9a3412",
      "orange-900": "#7c2d12",
      "orange-950": "#431407",
      // Black and White
      black: "#000000",
      white: "#ffffff",
    };

    let hexColor: string;

    // Check if it's a Tailwind color class
    if (color.includes("-")) {
      // Extract color from Tailwind class (e.g., "bg-blue-500" -> "blue-500")
      const colorMatch = color.match(
        /(?:bg-|text-|border-)?([a-z]+-?\d+|black|white)/
      );
      if (colorMatch) {
        const tailwindColor = colorMatch[1];
        hexColor = tailwindColors[tailwindColor];
        if (!hexColor) return false; // Unknown Tailwind color
      } else {
        return false;
      }
    } else if (color.startsWith("#")) {
      // It's already a hex color
      hexColor = color;
    } else if (tailwindColors[color]) {
      // It's a direct Tailwind color name
      hexColor = tailwindColors[color];
    } else {
      return false; // Unknown color format
    }

    // Convert hex to RGB
    const hex = hexColor.replace("#", "");
    if (hex.length !== 6) return false;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return true if the color is dark (brightness < 0.5)
    return brightness < 0.5;
  };
  // Setter for global timeoffset
  static setGlobalTimeOffset(timeOffset: string): void {
    AppHelper._globalTimeOffset = timeOffset;
  }

  static formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }

      // Format as: Sep 19, 2025 11:23 AM
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return dateString; // Return original if error
    }
  };

  /**
   * Check if a given date/time is within the specified number of minutes from now
   * @param dateString - ISO date string or any valid date string
   * @param minutes - Number of minutes to check (default: 5)
   * @returns true if the date is within the specified minutes, false otherwise
   */
  static isWithinMinutes = (
    dateString: string,
    minutes: number = 5
  ): boolean => {
    try {
      const now = new Date();
      const created = new Date(dateString);

      // Check if date is valid
      if (isNaN(created.getTime())) {
        return false;
      }

      // Calculate difference in milliseconds
      const diffInMs = now.getTime() - created.getTime();

      // Convert to minutes
      const diffInMinutes = diffInMs / (1000 * 60);

      // Return true if within specified minutes
      return diffInMinutes >= 0 && diffInMinutes < minutes;
    } catch (error) {
      return false;
    }
  };

  // Getter for global timeoffset
  static getGlobalTimeOffset(): string {
    return AppHelper._globalTimeOffset;
  }

  static getImageSource = (key: ImageKey) => {
    if (key in localImages) {
      return localImages[key as keyof typeof localImages];
    }
    // if (key in remoteImages) {
    //   return { uri: remoteImages[key as keyof typeof remoteImages] };
    // }
    throw new Error(`Image key "${key as any}" not found`);
  };

  static safeNumber(value: any, defaultValue: number = 0): number {
    const num = Number(value);
    return !isNaN(num) && isFinite(num) ? num : defaultValue;
  }

  /**
   * Helper function to build query URLs by replacing placeholders with actual values
   * @param template - URL template with placeholders (e.g., "path/:id?param=:value")
   * @param params - Object containing parameter values to substitute
   * @returns Formatted URL with placeholders replaced
   */

  static buildQueryUrl<T extends string>(
    template: T,
    params: Omit<RouteParams<T>, "timeoffset" | "client_id" | "clientId">
  ): string {
    let result: string = template;

    // First, replace any :timeoffset placeholder with the global timeoffset
    result = result.replace(
      new RegExp(":timeoffset", "g"),
      AppHelper._globalTimeOffset
    );

    // Replace :client_id with environment variable
    result = result.replace(
      new RegExp(":client_id", "g"),
      String(environmentConfig.CLIENT_ID ?? "")
    );
    result = result.replace(
      new RegExp(":clientId", "g"),
      String(environmentConfig.CLIENT_ID ?? "")
    );

    // Then replace all other parameters
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `:${key}`;
      let stringValue: string;

      if (Array.isArray(value)) {
        stringValue = value.map(String).join(",");
      } else {
        stringValue = String(value);
      }

      result = result.replace(new RegExp(placeholder, "g"), stringValue);
    }

    // Clean up any remaining placeholders (like :param) that weren't replaced
    // This handles cases where parameters are missing or empty
    result = result.replace(/:[^\/&\?]+/g, "");

    return result;
  }
  static convertToTimeString(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // ==================== TIME UTILITY FUNCTIONS ====================

  /**
   * Parse time string in format "MM:SS" or "M:SS" to components
   */
  static parseTimeString = (timeStr: string): TimeComponents | null => {
    if (!timeStr || typeof timeStr !== "string") return null;

    // Handle different time formats
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) return null;

    const minutes = parseInt(timeMatch[1], 10);
    const seconds = parseInt(timeMatch[2], 10);

    if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return null;

    return {
      minutes,
      seconds,
      totalSeconds: minutes * 60 + seconds,
    };
  };

  /**
   * Format time components back to "MM:SS" string
   */
  static formatTimeString = (components: TimeComponents): string => {
    const minutes = Math.floor(components.totalSeconds / 60);
    const seconds = components.totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  /**
   * Increment time by specified seconds
   */
  static incrementTime = (
    timeStr: string,
    incrementSeconds: number = 1
  ): string => {
    const components = AppHelper.parseTimeString(timeStr);
    if (!components) return timeStr;

    const newTotalSeconds = components.totalSeconds + incrementSeconds;
    const newComponents: TimeComponents = {
      minutes: Math.floor(newTotalSeconds / 60),
      seconds: newTotalSeconds % 60,
      totalSeconds: newTotalSeconds,
    };

    return AppHelper.formatTimeString(newComponents);
  };

  /**
   * Check if time string is in valid format for live games
   */
  static isValidLiveTime = (timeStr: string): boolean => {
    return AppHelper.parseTimeString(timeStr) !== null;
  };

  /**
   * Get the next time increment for live games
   * Handles different sports and their time formats
   */
  static getNextLiveTime = (
    currentTime: string,
    sportType?: string
  ): string => {
    // For most sports, increment by 1 second
    // For some sports like basketball, might increment by different amounts
    const increment = AppHelper.getTimeIncrement(sportType);
    return AppHelper.incrementTime(currentTime, increment);
  };

  /**
   * Get time increment based on sport type
   */
  private static getTimeIncrement = (sportType?: string): number => {
    switch (sportType?.toLowerCase()) {
      case "basketball":
        // Basketball might have different time increments
        return 1;
      case "tennis":
        // Tennis time might be different
        return 1;
      case "football":
      case "soccer":
      default:
        return 1; // 1 second increment for most sports
    }
  };

  /**
   * Check if a time string represents a live game
   */
  static isLiveGameTime = (timeStr: string): boolean => {
    if (!timeStr) return false;

    // Check if it contains live indicators
    if (timeStr.includes("⚡") || timeStr.toLowerCase().includes("live")) {
      return true;
    }

    // Check if it's a valid time format (not "--:--" or similar)
    if (timeStr === "--:--" || timeStr === "TBD" || timeStr === "Live") {
      return false;
    }

    // Check if it's a valid time format
    return AppHelper.isValidLiveTime(timeStr);
  };

  /**
   * Extract clean time string from eventTime (remove live indicators)
   */
  static extractCleanTime = (eventTime: string): string => {
    if (!eventTime) return "";

    // Remove live indicators and extra spaces
    return eventTime.replace(/⚡/g, "").replace(/\s+/g, "").trim();
  };

  /**
   * Create a live time string with proper formatting
   */
  static createLiveTimeString = (
    timeStr: string,
    isLive: boolean = true
  ): string => {
    const cleanTime = AppHelper.extractCleanTime(timeStr);

    if (!isLive || !AppHelper.isValidLiveTime(cleanTime)) {
      return timeStr;
    }

    return `${cleanTime} ⚡`;
  };

  // ==================== SUSPENSION UTILITY FUNCTIONS ====================

  /**
   * Check if a match status indicates suspension
   * Based on Unified Feed: 0=Active, 1=Suspended, 2=Deactivated, 3=Settled, 4=Cancelled
   */
  static isMatchSuspended = (matchStatus: string | number): boolean => {
    if (matchStatus === undefined || matchStatus === null) return false;

    // Handle both string and number status
    if (typeof matchStatus === "string") {
      // Only parse if it's a pure number string, not text like "2nd set"
      const parsed = parseInt(matchStatus);
      // If parsing failed or the original string wasn't just a number, treat as text (not suspended)
      if (isNaN(parsed) || parsed.toString() !== matchStatus) {
        return false;
      }
      return parsed >= 1 && parsed <= 4;
    }

    // For numbers, check if it's 1-4
    return matchStatus >= 1 && matchStatus <= 4;
  };

  /**
   * Check if an outcome is suspended based on its status
   * Based on Unified Feed: 0=Active, 1=Suspended, 2=Deactivated, 3=Settled, 4=Cancelled
   */
  static isOutcomeSuspended = (outcome: any): boolean => {
    if (!outcome) return false;

    // Only status 0 (Active) is not suspended
    return outcome.status !== 0;
  };

  /**
   * Check if a market is suspended
   * Based on Unified Feed: 0=Active, 1=Suspended, 2=Deactivated, 3=Settled, 4=Cancelled
   */
  static isMarketSuspended = (marketStatus: number): boolean => {
    // Only status 0 (Active) is not suspended
    return marketStatus !== 0;
  };

  /**
   * Check if a fixture has any suspended outcomes
   */
  static hasSuspendedOutcomes = (fixture: any): boolean => {
    if (!fixture?.outcomes) return false;

    return fixture.outcomes.some((outcome: any) =>
      AppHelper.isOutcomeSuspended(outcome)
    );
  };

  /**
   * Get suspension reason from match status
   * Based on Unified Feed status codes
   */
  static getSuspensionReason = (matchStatus: string | number): string => {
    if (!AppHelper.isMatchSuspended(matchStatus)) return "";

    const status =
      typeof matchStatus === "string" ? parseInt(matchStatus) : matchStatus;

    switch (status) {
      case 1:
        return "Suspended";
      case 2:
        return "Deactivated";
      case 3:
        return "Settled";
      case 4:
        return "Cancelled";
      case 5:
        return "Handed Over";
      default:
        return "Suspended";
    }
  };

  /**
   * Get market status name from status code
   */
  static getMarketStatusName = (status: number): string => {
    switch (status) {
      case 0:
        return "Active";
      case 1:
        return "Suspended";
      case 2:
        return "Deactivated";
      case 3:
        return "Settled";
      case 4:
        return "Cancelled";
      case 5:
        return "Handed Over";
      default:
        return "Unknown";
    }
  };

  /**
   * Get match status description from status ID
   * Based on Unified Feed match_status_descriptions
   */
  static getMatchStatusDescription = (statusId: number): string => {
    switch (statusId) {
      case 0:
        return "Not started";
      case 1:
        return "1st period";
      case 2:
        return "2nd period";
      case 3:
        return "3rd period";
      case 4:
        return "4th period";
      case 5:
        return "5th period";
      case 6:
        return "6th period";
      case 7:
        return "7th period";
      case 8:
        return "8th period";
      case 9:
        return "9th period";
      case 10:
        return "10th period";
      case 11:
        return "11th period";
      case 12:
        return "12th period";
      case 13:
        return "13th period";
      case 14:
        return "14th period";
      case 15:
        return "15th period";
      case 16:
        return "16th period";
      case 17:
        return "17th period";
      case 18:
        return "18th period";
      case 19:
        return "19th period";
      case 20:
        return "20th period";
      case 21:
        return "21st period";
      case 22:
        return "22nd period";
      case 23:
        return "23rd period";
      case 24:
        return "24th period";
      case 25:
        return "25th period";
      case 26:
        return "26th period";
      case 27:
        return "27th period";
      case 28:
        return "28th period";
      case 29:
        return "29th period";
      case 30:
        return "30th period";
      case 31:
        return "31st period";
      case 32:
        return "32nd period";
      case 33:
        return "33rd period";
      case 34:
        return "34th period";
      case 35:
        return "35th period";
      case 36:
        return "36th period";
      case 37:
        return "37th period";
      case 38:
        return "38th period";
      case 39:
        return "39th period";
      case 40:
        return "40th period";
      case 41:
        return "41st period";
      case 42:
        return "42nd period";
      case 43:
        return "43rd period";
      case 44:
        return "44th period";
      case 45:
        return "45th period";
      case 46:
        return "46th period";
      case 47:
        return "47th period";
      case 48:
        return "48th period";
      case 49:
        return "49th period";
      case 50:
        return "50th period";
      case 51:
        return "51st period";
      case 52:
        return "52nd period";
      case 53:
        return "53rd period";
      case 54:
        return "54th period";
      case 55:
        return "55th period";
      case 56:
        return "56th period";
      case 57:
        return "57th period";
      case 58:
        return "58th period";
      case 59:
        return "59th period";
      case 60:
        return "60th period";
      case 61:
        return "61st period";
      case 62:
        return "62nd period";
      case 63:
        return "63rd period";
      case 64:
        return "64th period";
      case 65:
        return "65th period";
      case 66:
        return "66th period";
      case 67:
        return "67th period";
      case 68:
        return "68th period";
      case 69:
        return "69th period";
      case 70:
        return "70th period";
      case 71:
        return "71st period";
      case 72:
        return "72nd period";
      case 73:
        return "73rd period";
      case 74:
        return "74th period";
      case 75:
        return "75th period";
      case 76:
        return "76th period";
      case 77:
        return "77th period";
      case 78:
        return "78th period";
      case 79:
        return "79th period";
      case 80:
        return "Interrupted";
      case 81:
        return "Suspended";
      case 90:
        return "Abandoned";
      case 100:
        return "Finished";
      case 110:
        return "Postponed";
      case 120:
        return "Cancelled";
      case 130:
        return "Delayed";
      case 140:
        return "Unknown";
      case 150:
        return "Extra time";
      case 160:
        return "Penalties";
      case 170:
        return "Awarded";
      case 180:
        return "Walkover";
      case 190:
        return "Retired";
      case 200:
        return "Disqualified";
      case 210:
        return "Forfeit";
      case 220:
        return "No contest";
      case 230:
        return "Void";
      case 240:
        return "Draw";
      case 250:
        return "Half time";
      case 260:
        return "Full time";
      case 270:
        return "Overtime";
      case 280:
        return "Shootout";
      case 290:
        return "Golden goal";
      case 300:
        return "Silver goal";
      case 301:
        return "First break";
      case 302:
        return "Second break";
      case 303:
        return "Third break";
      case 304:
        return "Fourth break";
      case 305:
        return "Fifth break";
      case 306:
        return "Sixth break";
      case 307:
        return "Seventh break";
      case 308:
        return "Eighth break";
      case 309:
        return "Ninth break";
      case 310:
        return "Tenth break";
      case 311:
        return "Eleventh break";
      case 312:
        return "Twelfth break";
      case 313:
        return "Thirteenth break";
      case 314:
        return "Fourteenth break";
      case 315:
        return "Fifteenth break";
      case 316:
        return "Sixteenth break";
      case 317:
        return "Seventeenth break";
      case 318:
        return "Eighteenth break";
      case 319:
        return "Nineteenth break";
      case 320:
        return "Twentieth break";
      case 321:
        return "Twenty-first break";
      case 322:
        return "Twenty-second break";
      case 323:
        return "Twenty-third break";
      case 324:
        return "Twenty-fourth break";
      case 325:
        return "Twenty-fifth break";
      case 326:
        return "Twenty-sixth break";
      case 327:
        return "Twenty-seventh break";
      case 328:
        return "Twenty-eighth break";
      case 329:
        return "Twenty-ninth break";
      case 330:
        return "Thirtieth break";
      case 331:
        return "Thirty-first break";
      case 332:
        return "Thirty-second break";
      case 333:
        return "Thirty-third break";
      case 334:
        return "Thirty-fourth break";
      case 335:
        return "Thirty-fifth break";
      case 336:
        return "Thirty-sixth break";
      case 337:
        return "Thirty-seventh break";
      case 338:
        return "Thirty-eighth break";
      case 339:
        return "Thirty-ninth break";
      case 340:
        return "Fortieth break";
      case 341:
        return "Forty-first break";
      case 342:
        return "Forty-second break";
      case 343:
        return "Forty-third break";
      case 344:
        return "Forty-fourth break";
      case 345:
        return "Forty-fifth break";
      case 346:
        return "Forty-sixth break";
      case 347:
        return "Forty-seventh break";
      case 348:
        return "Forty-eighth break";
      case 349:
        return "Forty-ninth break";
      case 350:
        return "Fiftieth break";
      case 351:
        return "Fifty-first break";
      case 352:
        return "Fifty-second break";
      case 353:
        return "Fifty-third break";
      case 354:
        return "Fifty-fourth break";
      case 355:
        return "Fifty-fifth break";
      case 356:
        return "Fifty-sixth break";
      case 357:
        return "Fifty-seventh break";
      case 358:
        return "Fifty-eighth break";
      case 359:
        return "Fifty-ninth break";
      case 360:
        return "Sixtieth break";
      case 361:
        return "Sixty-first break";
      case 362:
        return "Sixty-second break";
      case 363:
        return "Sixty-third break";
      case 364:
        return "Sixty-fourth break";
      case 365:
        return "Sixty-fifth break";
      case 366:
        return "Sixty-sixth break";
      case 367:
        return "Sixty-seventh break";
      case 368:
        return "Sixty-eighth break";
      case 369:
        return "Sixty-ninth break";
      case 370:
        return "Seventieth break";
      case 371:
        return "Seventy-first break";
      case 372:
        return "Seventy-second break";
      case 373:
        return "Seventy-third break";
      case 374:
        return "Seventy-fourth break";
      case 375:
        return "Seventy-fifth break";
      case 376:
        return "Seventy-sixth break";
      case 377:
        return "Seventy-seventh break";
      case 378:
        return "Seventy-eighth break";
      case 379:
        return "Seventy-ninth break";
      case 380:
        return "Eightieth break";
      case 381:
        return "Eighty-first break";
      case 382:
        return "Eighty-second break";
      case 383:
        return "Eighty-third break";
      case 384:
        return "Eighty-fourth break";
      case 385:
        return "Eighty-fifth break";
      case 386:
        return "Eighty-sixth break";
      case 387:
        return "Eighty-seventh break";
      case 388:
        return "Eighty-eighth break";
      case 389:
        return "Eighty-ninth break";
      case 390:
        return "Ninetieth break";
      case 391:
        return "Ninety-first break";
      case 392:
        return "Ninety-second break";
      case 393:
        return "Ninety-third break";
      case 394:
        return "Ninety-fourth break";
      case 395:
        return "Ninety-fifth break";
      case 396:
        return "Ninety-sixth break";
      case 397:
        return "Ninety-seventh break";
      case 398:
        return "Ninety-eighth break";
      case 399:
        return "Ninety-ninth break";
      case 400:
        return "Hundredth break";
      default:
        return `Status ${statusId}`;
    }
  };

  /**
   * Check if match status indicates the match is live/active
   */
  static isMatchLive = (statusId: number): boolean => {
    // Status IDs 1-399 are typically live periods/breaks
    // Status 0 = Not started, 80+ = Interrupted/Suspended/Finished/etc
    return statusId >= 1 && statusId < 80;
  };

  /**
   * Check if match status indicates the match is finished
   */
  static isMatchFinished = (statusId: number): boolean => {
    const finishedStatuses = [
      90, 100, 120, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250,
      260, 270, 280, 290, 300,
    ];
    return finishedStatuses.includes(statusId);
  };

  /**
   * Check if match status indicates the match is suspended/interrupted
   */
  static isMatchSuspendedByStatus = (statusId: number): boolean => {
    const suspendedStatuses = [80, 81, 110, 130];
    return suspendedStatuses.includes(statusId);
  };

  /**
   * Parse clock element and extract time information
   */
  static parseClockElement = (
    clock: any
  ): {
    matchTime: string;
    stoppageTime?: number;
    stoppageTimeAnnounced?: number;
    remainingTime?: string;
    remainingTimeInPeriod?: string;
    stopped: boolean;
  } => {
    return {
      matchTime: clock?.match_time || "0",
      stoppageTime: clock?.stoppage_time,
      stoppageTimeAnnounced: clock?.stoppage_time_announced,
      remainingTime: clock?.remaining_time,
      remainingTimeInPeriod: clock?.remaining_time_in_period,
      stopped: clock?.stopped || false,
    };
  };

  /**
   * Format match time with stoppage time if available
   */
  static formatMatchTime = (clock: any): string => {
    const parsed = AppHelper.parseClockElement(clock);
    let timeString = parsed.matchTime;

    // Add stoppage time for soccer
    if (parsed.stoppageTime && parsed.stoppageTime > 0) {
      timeString += `+${parsed.stoppageTime}`;
    }

    return timeString;
  };

  // Example usage:
  // const url = buildQueryUrl(BETTING_ACTIONS.GET_BETTING_DATA, {
  //   tournament_id: "17",
  //   sport_id: "1",
  //   period: "today",
  //   markets: "1,10,18",
  //   specifier: "total=2.5"
  // });

  static formatReceiptTimestamp = (): string => {
    return new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  private static getReceiptStyles = (): string => {
    return `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        line-height: 1.4;
        padding: 10px;
        width: 80mm;
        background: white;
      }
      .header {
        text-align: center;
        margin-bottom: 10px;
        font-weight: bold;
        font-size: 14px;
      }
      .title {
        text-align: center;
        margin-bottom: 15px;
        font-size: 12px;
        text-transform: uppercase;
      }
      .divider {
        border-bottom: 1px dashed #000;
        margin: 10px 0;
      }
      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .label {
        font-weight: normal;
      }
      .value {
        text-align: right;
        font-weight: bold;
      }
      .amount {
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        margin: 15px 0;
      }
      .betslip-id {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin: 12px 0;
        letter-spacing: 2px;
      }
      .selection {
        margin-bottom: 10px;
        padding: 5px 0;
        border-bottom: 1px solid #ddd;
      }
      .selection:last-child {
        border-bottom: none;
      }
      .event-name {
        font-weight: bold;
        margin-bottom: 3px;
        font-size: 10px;
      }
      .market-outcome {
        margin-bottom: 2px;
        font-size: 9px;
      }
      .odds {
        text-align: right;
        font-weight: bold;
      }
      .summary {
        margin-top: 10px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 11px;
      }
      .summary-row.total {
        font-weight: bold;
        font-size: 12px;
        margin-top: 5px;
        padding-top: 5px;
        border-top: 2px solid #000;
      }
      .footer {
        text-align: center;
        margin-top: 15px;
        font-size: 10px;
      }
      @media print {
        body {
          background: white;
        }
      }
    `;
  };

  private static getReceiptHeader = (): string => {
    return `
      <div class="header">
        <img src="${localImages.logo}" alt="BWinners.ng" style="max-width: 60mm; height: auto; margin: 0 auto; display: block; filter: grayscale(100%);" />
      </div>
    `;
  };

  private static getReceiptFooter = (): string => {
    return `
      <div class="footer">
        For betting with your own<br/>
        device, Sign in
      </div>
    `;
  };

  private static generateReceiptHTML = (config: {
    title: string;
    details: Array<{ label: string; value: string }>;
    mainContent?: string;
    amount?: { value: string; currency: string };
  }): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${config.title}</title>
          <style>${AppHelper.getReceiptStyles()}</style>
        </head>
        <body>
          ${AppHelper.getReceiptHeader()}
          <div class="title">${config.title}</div>
          <div class="divider"></div>
          
          ${config.details
            .map(
              (row) => `
            <div class="row">
              <span class="label">${row.label}</span>
              <span class="value">${row.value}</span>
            </div>
          `
            )
            .join("")}
          
          ${config.mainContent || ""}
          
          ${
            config.amount
              ? `
            <div class="divider"></div>
            <div class="amount">${config.amount.currency} ${config.amount.value}</div>
            <div class="divider"></div>
          `
              : ""
          }
          
          ${AppHelper.getReceiptFooter()}
        </body>
      </html>
    `;
  };

  private static generateDepositReceipt = (data: {
    terminal: string;
    cashier: string;
    time: string;
    customerId: string;
    code: string;
    amount: string;
    currency: string;
  }): string => {
    return AppHelper.generateReceiptHTML({
      title: "Deposit Receipt",
      details: [
        { label: "Terminal", value: data.terminal },
        { label: "Cashier:", value: data.cashier },
        { label: "Time:", value: data.time },
        { label: "Customer ID:", value: data.customerId },
        { label: "Code:", value: data.code },
      ],
      amount: { value: data.amount, currency: data.currency },
    });
  };

  private static generateBettingSlipReceipt = (data: {
    betslipId: string;
    terminal: string;
    cashier: string;
    time: string;
    stake: string;
    totalOdds: string;
    possibleWin: string;
    currency: string;
    selections: Array<{
      eventName: string;
      marketName: string;
      outcomeName: string;
      odds: string;
    }>;
  }): string => {
    const selectionsHTML = `
      <div class="divider"></div>
      <div class="betslip-id">${data.betslipId}</div>
      <div class="divider"></div>
      
      <div class="selections">
        ${data.selections
          .map(
            (sel, idx) => `
          <div class="selection">
            <div class="event-name">${idx + 1}. ${sel.eventName}</div>
            <div class="market-outcome">${sel.marketName}: ${
              sel.outcomeName
            }</div>
            <div class="odds">Odds: ${sel.odds}</div>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div class="divider"></div>
      
      <div class="summary">
        <div class="summary-row">
          <span>Stake:</span>
          <span>${data.currency} ${data.stake}</span>
        </div>
        <div class="summary-row">
          <span>Total Odds:</span>
          <span>${data.totalOdds}</span>
        </div>
        <div class="summary-row total">
          <span>Potential Winnings</span>
          <span>${data.currency} ${data.possibleWin}</span>
        </div>
      </div>
      
      <div class="divider"></div>
    `;

    return AppHelper.generateReceiptHTML({
      title: "Betting Slip",
      details: [
        { label: "BET SLIP ID", value: `cashier-${data.terminal}` },
        { label: "USER:", value: data.cashier },
        { label: "DATE", value: data.time },
      ],
      mainContent: selectionsHTML,
    });
  };

  private static generateWithdrawalReceipt = (data: {
    terminal: string;
    cashier: string;
    time: string;
    customerId: string;
    amount: string;
    currency: string;
  }): string => {
    return AppHelper.generateReceiptHTML({
      title: "Withdraw Receipt",
      details: [
        { label: "Terminal", value: data.terminal },
        { label: "Cashier:", value: data.cashier },
        { label: "Time:", value: data.time },
        { label: "Customer ID:", value: data.customerId },
        { label: "Online account will be charged:", value: "" },
      ],
      amount: { value: data.amount, currency: data.currency },
    });
  };

  static printTicket = ({
    ticket_data,
    type = "deposit",
  }: {
    ticket_data:
      | string
      | number
      | {
          betslipId?: string;
          stake?: string | number;
          totalOdds?: string | number;
          possibleWin?: string | number;
          selections?: Array<{
            eventName: string;
            marketName: string;
            outcomeName: string;
            odds: string;
          }>;
          terminal?: string;
          cashier?: string;
          time?: string;
          customerId?: string;
          code?: string;
          amount?: string | number;
          currency?: string;
        };
    type: "deposit" | "withdrawal" | "bet";
  }): void => {
    try {
      let html: string;

      const currentTime = AppHelper.formatReceiptTimestamp();

      if (typeof ticket_data === "object") {
        // Validate required fields
        if (!ticket_data.terminal) {
          throw new Error("Terminal ID is required for printing");
        }
        if (!ticket_data.cashier) {
          throw new Error("Cashier ID is required for printing");
        }
        if (!ticket_data.currency) {
          throw new Error("Currency is required for printing");
        }

        if (type === "bet" && ticket_data.betslipId && ticket_data.selections) {
          if (!ticket_data.stake) {
            throw new Error("Stake is required for bet receipt");
          }
          if (!ticket_data.totalOdds) {
            throw new Error("Total odds is required for bet receipt");
          }
          if (!ticket_data.possibleWin) {
            throw new Error("Possible win is required for bet receipt");
          }

          const betData = {
            betslipId: ticket_data.betslipId,
            terminal: ticket_data.terminal,
            cashier: ticket_data.cashier,
            time: ticket_data.time || currentTime,
            stake: String(ticket_data.stake),
            totalOdds: String(ticket_data.totalOdds),
            possibleWin: String(ticket_data.possibleWin),
            currency: ticket_data.currency,
            selections: ticket_data.selections,
          };
          html = AppHelper.generateBettingSlipReceipt(betData);
        } else {
          if (!ticket_data.amount) {
            throw new Error("Amount is required for receipt");
          }
          if (!ticket_data.customerId) {
            throw new Error("Customer ID is required for receipt");
          }

          const data = {
            terminal: ticket_data.terminal,
            cashier: ticket_data.cashier,
            time: ticket_data.time || currentTime,
            customerId: ticket_data.customerId,
            code: ticket_data.code || "",
            amount: String(ticket_data.amount),
            currency: ticket_data.currency,
          };

          html =
            type === "deposit"
              ? AppHelper.generateDepositReceipt(data)
              : AppHelper.generateWithdrawalReceipt(data);
        }
        const printWindow = window.open(
          "",
          "PrintTicket",
          "width=300,height=500"
        );

        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();

          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          };
        } else {
          console.error(
            "Failed to open print window. Please check browser popup settings."
          );
        }
      }
    } catch (error) {
      console.error("Failed to print ticket:", error);
      throw error; // Re-throw so caller can handle it properly
    }
  };

  fetchWrapper = {
    post: async (url: string, payload: any) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    get: async (url: string) => {
      const res = await fetch(url);
      return res.json();
    },
  };

  static getOutcomeTrend(oldOdds: number, newOdds: number): Outcome["trend"] {
    if (newOdds > oldOdds) return "increase";
    if (newOdds < oldOdds) return "decrease";
    return "stable";
  }
}
