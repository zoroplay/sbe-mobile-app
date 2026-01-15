/**
 * Utility functions for generating route URLs
 */

import { OVERVIEW } from "./routes";

/**
 * Generate a sport-specific route URL
 * @param sportId - The sport ID
 * @returns The sport-specific route URL
 */
export const getSportRoute = (sportId: string): string => {
  return OVERVIEW.SPORTS_BY_ID.replace(":sport_id", `sport_${sportId}`);
};

/**
 * Generate a sport route with fallback to query parameter (for backward compatibility)
 * @param sportId - The sport ID
 * @param useQueryParam - Whether to use query parameter instead of route parameter
 * @returns The sport route URL
 */
export const getSportRouteWithFallback = (
  sportId: string,
  useQueryParam: boolean = false
): string => {
  if (useQueryParam) {
    return `${OVERVIEW.SPORTS}?sport=${sportId}`;
  }
  return getSportRoute(sportId);
};

/**
 * Parse sport ID from current route or search params
 * @param pathname - Current pathname
 * @param searchParams - Current search parameters
 * @returns The sport ID if found
 */
export const parseSportIdFromRoute = (
  pathname: string,
  searchParams: URLSearchParams
): string | null => {
  // Check if it's a sport-specific route: /overview/sports/:sportId
  const sportRouteMatch = pathname.match(/^\/overview\/sports\/(\d+)$/);
  if (sportRouteMatch) {
    return sportRouteMatch[1];
  }

  // Fallback to search params for backward compatibility
  return searchParams.get("sport_");
};
