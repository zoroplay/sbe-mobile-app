import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
import {
  incrementLiveTime,
  selectLiveFixtures,
} from "../store/features/slice/live-games.slice";
import { AppHelper } from "@/utils/helper";

/**
 * Custom hook to handle automatic time increment for live games
 */
export const useLiveTimeIncrement = (intervalMs: number = 1000) => {
  const dispatch = useAppDispatch();
  const liveFixtures = useAppSelector(selectLiveFixtures);
  const intervalRef = useRef<number | null>(null);

  // Check if there are any live games with valid time formats
  const hasLiveGamesWithTime = useCallback(() => {
    return liveFixtures.some((fixture) => {
      if (!fixture.eventTime) return false;

      // Check if it's a live game with valid time format
      return AppHelper.isLiveGameTime(fixture.eventTime);
    });
  }, [liveFixtures]);

  // Start the time increment interval
  const startTimeIncrement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (hasLiveGamesWithTime()) {
        dispatch(incrementLiveTime());
      }
    }, intervalMs);
  }, [dispatch, hasLiveGamesWithTime, intervalMs]);

  // Stop the time increment interval
  const stopTimeIncrement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-start/stop based on live games
  useEffect(() => {
    if (hasLiveGamesWithTime()) {
      startTimeIncrement();
    } else {
      stopTimeIncrement();
    }

    return () => {
      stopTimeIncrement();
    };
  }, [hasLiveGamesWithTime, startTimeIncrement, stopTimeIncrement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeIncrement();
    };
  }, [stopTimeIncrement]);

  return {
    startTimeIncrement,
    stopTimeIncrement,
    hasLiveGamesWithTime: hasLiveGamesWithTime(),
  };
};
