import { useEffect, useRef, useCallback } from "react";
import { useMqttService } from "../store/services/mqtt-feeds.service";

/**
 * React hook for MQTT subscriptions with automatic cleanup
 * Similar to Vue composable pattern
 */
export const useMqtt = () => {
  const mqttService = useMqttService();
  const unsubscribeFunctions = useRef<(() => void)[]>([]);

  // Cleanup function to unsubscribe from all topics
  const cleanup = useCallback(() => {
    unsubscribeFunctions.current.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Error during MQTT cleanup:", error);
      }
    });
    unsubscribeFunctions.current = [];
  }, []);

  // Subscribe to a topic with automatic cleanup
  const subscribe = useCallback(
    (topic: string, callback: (data: any) => void) => {
      const unsubscribe = mqttService.subscribe(topic, callback);
      unsubscribeFunctions.current.push(unsubscribe);
      return unsubscribe;
    },
    [mqttService]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected: mqttService.isConnected,
    subscribe,
    connect: mqttService.connect,
    disconnect: mqttService.disconnect,
    cleanup,
  };
};

/**
 * Hook for subscribing to specific match feeds with automatic cleanup
 */
export const useMatchMqtt = (matchId: number | string) => {
  const { subscribe, cleanup } = useMqtt();

  // Subscribe to all match-related topics
  const subscribeToMatch = useCallback(
    (callback: (data: any) => void) => {
      const unsubscribers: (() => void)[] = [];

      // Subscribe to different message types for this match
      unsubscribers.push(
        subscribe(`feeds/live/odds_change/${matchId}`, callback)
      );
      unsubscribers.push(subscribe(`feeds/live/bet_stop/${matchId}`, callback));
      unsubscribers.push(
        subscribe(`feeds/live/fixture_change/${matchId}`, callback)
      );
      unsubscribers.push(
        subscribe(`feeds/prematch/odds_change/${matchId}`, callback)
      );
      unsubscribers.push(
        subscribe(`feeds/prematch/bet_stop/${matchId}`, callback)
      );

      // Return cleanup function for these specific subscriptions
      return () => {
        unsubscribers.forEach((unsub) => unsub());
      };
    },
    [subscribe, matchId]
  );

  return {
    subscribeToMatch,
    cleanup,
  };
};

/**
 * Hook for live betting feeds
 */
export const useLiveMqtt = () => {
  const { subscribe, cleanup } = useMqtt();

  const subscribeToLiveOdds = useCallback(
    (callback: (data: any) => void) => {
      return subscribe("feeds/live/odds_change/+", callback);
    },
    [subscribe]
  );

  const subscribeToLiveBetStop = useCallback(
    (callback: (data: any) => void) => {
      return subscribe("feeds/live/bet_stop/+", callback);
    },
    [subscribe]
  );

  const subscribeToLiveFixtureChange = useCallback(
    (callback: (data: any) => void) => {
      return subscribe("feeds/live/fixture_change/+", callback);
    },
    [subscribe]
  );

  return {
    subscribeToLiveOdds,
    subscribeToLiveBetStop,
    subscribeToLiveFixtureChange,
    cleanup,
  };
};

/**
 * Hook for prematch feeds
 */
export const usePrematchMqtt = () => {
  const { subscribe, cleanup } = useMqtt();

  const subscribeToPrematchOdds = useCallback(
    (callback: (data: any) => void) => {
      return subscribe("feeds/prematch/odds_change/+", callback);
    },
    [subscribe]
  );

  const subscribeToPrematchBetStop = useCallback(
    (callback: (data: any) => void) => {
      return subscribe("feeds/prematch/bet_stop/+", callback);
    },
    [subscribe]
  );

  return {
    subscribeToPrematchOdds,
    subscribeToPrematchBetStop,
    cleanup,
  };
};
