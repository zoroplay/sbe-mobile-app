/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
// services/MQTTFeedsService.ts
"use client";
import mqtt, { MqttClient } from "mqtt";
import {
  ENVIRONMENT_VARIABLES,
  getEnvironmentVariable,
} from "./configs/environment.config";
import { LiveBettingMessage, MQTTTopicConfig } from "./data/betting.types";

import {
  updateLiveFixture,
  updateLiveFixtureOutcome,
} from "../features/slice/live-games.slice";
import {
  suspendAllMarketsForMatch,
  updateOdds,
} from "../features/slice/betting.slice";

import { updateFixtureOutcome } from "../features/slice/fixtures.slice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { AppHelper } from "@/utils/helper";

// ==================== MQTT SERVICE CORE ====================

// Types
interface MQTTMessage {
  topic: string;
  message: any;
}

interface Subscription {
  topic: string;
  callback: (data: any) => void;
}

// State
let mqttClient: MqttClient | null = null;
let isConnected = false;
const subscriptions = new Map<string, Subscription[]>();
const messageQueue = new Map<string, any[]>();
let processingInterval: NodeJS.Timeout | null = null;

// Configuration
const PROCESS_INTERVAL = 16; // ~60fps

// MQTT Configuration - using the same format as Vue.js project
const MQTT_URI =
  getEnvironmentVariable(ENVIRONMENT_VARIABLES.MQTT_URI) ||
  "wss://emqx.sportsbookengine.com/mqtt";

export const useMqttService = () => {
  const connect = () => {
    if (mqttClient?.connected) return mqttClient;
    if (mqttClient) return mqttClient; // Return existing client even if not connected

    const clientId = `${
      getEnvironmentVariable(ENVIRONMENT_VARIABLES.MQTT_CLIENTID) || "cubebet_m"
    }-${Math.random().toString(36).substr(2, 9)}`;

    try {
      mqttClient = mqtt.connect(MQTT_URI, {
        clientId,
        username:
          getEnvironmentVariable(ENVIRONMENT_VARIABLES.MQTT_USERNAME) || "",
        password:
          getEnvironmentVariable(ENVIRONMENT_VARIABLES.MQTT_PASSWORD) || "",
        clean: true,
        reconnectPeriod: 1000, // Re-enable auto-reconnect like Vue.js
        connectTimeout: 10000, // 10 second timeout
        keepalive: 60,
      });
    } catch (error) {
      console.error("🔴 Failed to create MQTT client:", error);
      return null;
    }

    mqttClient.on("connect", () => {
      console.log("🔵 MQTT Connected");
      isConnected = true;

      // Resubscribe to existing topics
      subscriptions.forEach((_, topic) => {
        mqttClient?.subscribe(topic);
      });

      // Start processing interval if not already running
      if (!processingInterval) {
        processingInterval = setInterval(processMessageQueue, PROCESS_INTERVAL);
      }
    });

    mqttClient.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());

        // Queue the message instead of processing immediately
        if (!messageQueue.has(topic)) {
          messageQueue.set(topic, []);
        }
        messageQueue.get(topic)?.push(data);
      } catch (error) {
        console.error(`Error processing message for ${topic}:`, error);
      }
    });

    mqttClient.on("error", (error) => {
      console.error("🔴 MQTT Error:", error);
      isConnected = false;
    });

    mqttClient.on("close", () => {
      console.log("🟡 MQTT Disconnected");
      isConnected = false;
      if (processingInterval) {
        clearInterval(processingInterval);
        processingInterval = null;
      }
    });

    return mqttClient;
  };

  // Process queued messages at a fixed interval (similar to Vue implementation)
  const processMessageQueue = () => {
    messageQueue.forEach((messages, topic) => {
      if (messages.length === 0) return;

      const topicSubscriptions = subscriptions.get(topic) || [];

      // Get the latest message for each topic
      const latestMessage = messages[messages.length - 1];

      // Execute callbacks with the latest message
      topicSubscriptions.forEach(({ callback }) => {
        try {
          callback(latestMessage);
        } catch (error) {
          console.error(`Error in callback for ${topic}:`, error);
        }
      });

      // Clear the queue for this topic
      messageQueue.set(topic, []);
    });
  };

  // Handle incoming MQTT messages
  const handleMQTTMessage = (data: MQTTMessage) => {
    const { topic, message } = data;

    // Log only when we receive actual data
    console.log(
      `📨 MQTT Data received on ${topic}:`,
      message,
      "DATA",
      JSON.stringify(message, null, 2)
    );

    // Queue the message instead of processing immediately
    if (!messageQueue.has(topic)) {
      messageQueue.set(topic, []);
    }
    messageQueue.get(topic)!.push(message);
  };

  // Subscribe to a topic
  const subscribe = (topic: string, callback: (data: any) => void) => {
    connect();

    if (!subscriptions.has(topic)) {
      subscriptions.set(topic, []);
      subscribeToTopic(topic);
    }

    const topicSubscriptions = subscriptions.get(topic)!;
    topicSubscriptions.push({ topic, callback });

    // Return unsubscribe function
    return () => {
      const topicSubscriptions = subscriptions.get(topic) || [];
      const index = topicSubscriptions.findIndex(
        (sub) => sub.callback === callback
      );

      if (index !== -1) {
        topicSubscriptions.splice(index, 1);

        if (topicSubscriptions.length === 0) {
          unsubscribeFromTopic(topic);
          subscriptions.delete(topic);
        }
      }
    };
  };

  // Subscribe to topic on MQTT client
  const subscribeToTopic = (topic: string) => {
    if (mqttClient?.connected) {
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error("❌ Failed to subscribe to topic:", topic, err);
        }
      });
    } else {
      // If not connected, try to connect first
      connect();
      // Queue the subscription for when connection is established
      setTimeout(() => {
        if (mqttClient?.connected) {
          mqttClient.subscribe(topic, (err) => {
            if (err) {
              console.error("❌ Failed to subscribe to topic:", topic, err);
            }
          });
        }
      }, 1000);
    }
  };

  // Unsubscribe from topic on MQTT client
  const unsubscribeFromTopic = (topic: string) => {
    if (mqttClient?.connected) {
      mqttClient.unsubscribe(topic, (err) => {
        if (err) {
          console.error("❌ Failed to unsubscribe from topic:", topic, err);
        }
      });
    }
    // If not connected, just remove from local subscriptions without trying to unsubscribe
  };

  // Reconnection is now handled automatically by the MQTT client

  // Disconnect
  const disconnect = () => {
    if (processingInterval) {
      clearInterval(processingInterval);
      processingInterval = null;
    }

    if (mqttClient) {
      mqttClient.end();
      mqttClient = null;
    }

    subscriptions.clear();
    messageQueue.clear();
    isConnected = false;
  };

  return {
    isConnected: () => isConnected,
    subscribe,
    connect,
    disconnect,
  };
};

// Convenience functions for common subscriptions
export const subscribeToAllLiveFeeds = (callback: (data: any) => void) => {
  const { subscribe } = useMqttService();
  return subscribe("feeds/live/#", callback);
};

export const subscribeToAllPrematchFeeds = (callback: (data: any) => void) => {
  const { subscribe } = useMqttService();
  return subscribe("feeds/prematch/#", callback);
};

export const subscribeToAllFeeds = (callback: (data: any) => void) => {
  const { subscribe } = useMqttService();
  return subscribe("feeds/#", callback);
};

export const subscribeToLiveOddsChanges = (callback: (data: any) => void) => {
  const { subscribe } = useMqttService();
  return subscribe("feeds/live/odds_change/+", callback);
};

export const subscribeToPrematchOddsChanges = (
  callback: (data: any) => void
) => {
  const { subscribe } = useMqttService();
  return subscribe("feeds/prematch/odds_change/+", callback);
};

export const subscribeToMatchOddsChanges = (
  matchId: number,
  callback: (data: any) => void
) => {
  const { subscribe } = useMqttService();
  return subscribe(`feeds/+/odds_change/${matchId}`, callback);
};

export const subscribeToMatchBetStops = (
  matchId: number,
  callback: (data: any) => void
) => {
  const { subscribe } = useMqttService();
  return subscribe(`feeds/+/bet_stop/${matchId}`, callback);
};

export const subscribeToMatchFixtureChanges = (
  matchId: number,
  callback: (data: any) => void
) => {
  const { subscribe } = useMqttService();
  return subscribe(`feeds/+/fixture_change/${matchId}`, callback);
};

// Simple reconnection function
export const reconnectMQTT = () => {
  console.log("🔄 Forcing MQTT reconnection...");

  // Disconnect existing connection
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
  }

  // Create new service instance and connect
  const mqttService = useMqttService();
  return mqttService.connect();
};

// Get subscribed topics
export const getSubscribedTopics = (): string[] => {
  return Array.from(subscriptions.keys());
};

// ==================== NEW MQTT SERVICE INTEGRATION ====================

/**
 * Connect using the new MQTT service with automatic message handling
 */
export const connectMQTTFeeds = async (
  dispatch: ReturnType<typeof useAppDispatch>,
  config: Partial<MQTTTopicConfig> = {}
) => {
  const mqttService = useMqttService();

  try {
    await mqttService.connect();

    // Subscribe to all feeds with automatic message handling
    const unsubscribeAll = mqttService.subscribe("feeds/#", (data) => {
      handleMQTTMessage({ topic: "feeds/#", message: data }, dispatch);
    });

    console.log("✅ MQTT Feeds connected successfully");
    return unsubscribeAll;
  } catch (error) {
    console.error("Failed to connect to MQTT Feeds:", error);
    return null;
  }
};

// Handle incoming MQTT messages
const handleMQTTMessage = (
  data: { topic: string; message: LiveBettingMessage },
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const { topic, message } = data;

  // Log all incoming messages for debugging
  console.log("📡 MQTT Message Received:", {
    topic,
    messageType: message.message_type || "unknown",
    eventId: message.event_id,
    timestamp: message.timestamp || new Date().toISOString(),
    data: JSON.stringify(message, null, 2),
  });

  // Parse topic to extract message type and event info
  const topicParts = topic.split("/");
  if (topicParts.length >= 4) {
    const [, eventType, messageType, matchId] = topicParts;
    const matchIdStr = matchId; // Keep as string for consistency

    console.log("🔍 Parsed Topic:", {
      eventType,
      messageType,
      matchId: matchIdStr,
      fullTopic: topic,
    });

    // Handle different message types from Unified Feed
    switch (messageType) {
      case "odds_change":
        console.log("🎯 Processing ODDS_CHANGE for match:", matchIdStr);
        handleOddsChangeMessage(message, dispatch, matchIdStr);
        break;
      case "bet_stop":
        console.log("🛑 Processing BET_STOP for match:", matchIdStr);
        handleBetStopMessage(message, dispatch, matchIdStr);
        break;
      case "fixture_change":
        console.log("📅 Processing FIXTURE_CHANGE for match:", matchIdStr);
        handleFixtureChangeMessage(message, dispatch, matchIdStr);
        break;
      case "bet_cancel":
        console.log("❌ Processing BET_CANCEL for match:", matchIdStr);
        handleBetCancelMessage(message, dispatch, matchIdStr);
        break;
      case "bet_settlement":
        console.log("💰 Processing BET_SETTLEMENT for match:", matchIdStr);
        handleBetSettlementMessage(message, dispatch, matchIdStr);
        break;
      case "rollback_bet_settlement":
        console.log(
          "↩️ Processing ROLLBACK_BET_SETTLEMENT for match:",
          matchIdStr
        );
        handleRollbackBetSettlementMessage(message, dispatch, matchIdStr);
        break;
      case "rollback_bet_cancel":
        console.log("↩️ Processing ROLLBACK_BET_CANCEL for match:", matchIdStr);
        handleRollbackBetCancelMessage(message, dispatch, matchIdStr);
        break;
      case "snapshot_complete":
        console.log("📸 Processing SNAPSHOT_COMPLETE for match:", matchIdStr);
        handleSnapshotCompleteMessage(message, dispatch, matchIdStr);
        break;
      case "producer_status":
        console.log("🏭 Processing PRODUCER_STATUS for match:", matchIdStr);
        handleProducerStatusMessage(message, dispatch, matchIdStr);
        break;
      case "alive":
        console.log("💓 Processing ALIVE message");
        handleAliveMessage(message, dispatch);
        break;

      default:
        // Check if this is an MTS response topic
        if (topic.includes("/bet/") || topic.includes("mts_status")) {
          console.log("🎯 Processing MTS Response:", topic);
          handleMTSResponse(topic, message, dispatch);
        } else {
          console.log(
            "❓ Unknown MQTT message type:",
            messageType,
            "for match:",
            matchIdStr
          );
        }
    }
  }
};

// Message handlers for Unified Feed
const handleOddsChangeMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("🎯 ODDS_CHANGE Details:", {
    matchId,
    eventId: message.event_id,
    eventType: message.event_type,
    eventPrefix: message.event_prefix,
    marketsCount: message.odds?.markets?.length || 0,
    sportEventStatus: message.sport_event_status,
    product: message.product,
    oddsChangeReason: message.odds_change_reason,
  });

  // Check for clock elements and match status in odds change
  if (message.sport_event_status) {
    const matchStatus = message.sport_event_status.match_status || 0;
    const clock = message.sport_event_status.clock;

    if (clock) {
      const clockInfo = AppHelper.parseClockElement(clock);
      const formattedTime = AppHelper.formatMatchTime(clock);

      console.log("⏰ Clock Information in ODDS_CHANGE:", {
        matchTime: clockInfo.matchTime,
        stoppageTime: clockInfo.stoppageTime,
        stoppageTimeAnnounced: clockInfo.stoppageTimeAnnounced,
        remainingTime: clockInfo.remainingTime,
        remainingTimeInPeriod: clockInfo.remainingTimeInPeriod,
        stopped: clockInfo.stopped,
        formattedTime: formattedTime,
      });
    }

    console.log("🏟️ Match Status in ODDS_CHANGE:", {
      statusId: matchStatus,
      description: AppHelper.getMatchStatusDescription(matchStatus),
      isLive: AppHelper.isMatchLive(matchStatus),
      isFinished: AppHelper.isMatchFinished(matchStatus),
      isSuspended: AppHelper.isMatchSuspendedByStatus(matchStatus),
    });
  }

  // Handle both direct markets array and nested odds.markets structure
  const markets = message.markets || message.odds?.markets || [];

  if (!message.event_id || markets.length === 0) {
    console.log("⚠️ Skipping odds change - missing event_id or markets");
    return;
  }

  // Check bet stop hierarchy conditions
  // const shouldSuspendAll = checkBetStopHierarchy(message, matchId);
  const shouldSuspendAll = checkBetStopHierarchy(message);
  if (shouldSuspendAll) {
    console.log(
      "🛑 Bet stop hierarchy triggered - suspending all markets for match:",
      matchId
    );
    dispatch(suspendAllMarketsForMatch(parseInt(matchId)));
  }

  // Update odds wherever they exist (selected bets, live games, prematch fixtures)
  markets.forEach((market, marketIndex) => {
    console.log(`📊 Processing Market ${marketIndex + 1}:`, {
      marketId: market.id,
      status: market.status,
      outcomesCount: market.outcomes?.length || 0,
      specifiers: market.specifiers,
      favourite: market.favourite,
    });

    // Handle both direct outcomes array and nested structure
    const outcomes = market.outcomes || market.outcome || [];

    outcomes.forEach((outcome, outcomeIndex) => {
      console.log(`🎲 Processing Outcome ${outcomeIndex + 1}:`, {
        outcomeId: outcome.id,
        name: outcome.name,
        odds: outcome.odds,
        active: outcome.active,
        probability: outcome.probability,
      });

      // Check if this specific outcome should be suspended
      const isOutcomeSuspended =
        !outcome.active || market.status !== 0 || shouldSuspendAll;

      // Always track odds changes for visual indicators
      console.log("🔄 Dispatching updateOdds to betting slice");
      dispatch(
        updateOdds({
          match_id: parseInt(matchId),
          outcome_id: outcome.id,
          market_id: market.id,
          new_odds: outcome.odds,
        })
      );

      // Update in live games if it exists there
      console.log(
        "🔄 Dispatching updateLiveFixtureOutcome to live games slice"
      );
      dispatch(
        updateLiveFixtureOutcome({
          matchID: matchId,
          outcomeID: outcome.id,
          updates: {
            odds: outcome.odds,
            status: isOutcomeSuspended ? 1 : market.status, // 1 = Suspended if any condition fails
            active: outcome.active && !shouldSuspendAll,
          },
        })
      );

      // Update in prematch fixtures if it exists there
      console.log("🔄 Dispatching updateFixtureOutcome to fixtures slice");
      dispatch(
        updateFixtureOutcome({
          matchID: matchId,
          outcomeID: outcome.id,
          updates: {
            odds: outcome.odds,
            status: isOutcomeSuspended ? 1 : market.status, // 1 = Suspended if any condition fails
            active: outcome.active && !shouldSuspendAll,
          },
        })
      );
    });
  });

  console.log("✅ Completed processing ODDS_CHANGE for match:", matchId);
};

// Check bet stop hierarchy conditions
const checkBetStopHierarchy = (
  message: LiveBettingMessage
  // matchId: string
): boolean => {
  // 1. The Betradar system is available (messages have been received in the last 20 seconds)
  const now = Date.now();
  const messageTime = message.timestamp || now;
  const timeSinceLastMessage = now - messageTime;

  if (timeSinceLastMessage > 20000) {
    // 20 seconds
    console.log("🚨 Bet stop: No messages received in last 20 seconds");
    return true;
  }

  // 2. The product handling the event is not flagged as down
  // if (
  //   message.producer_status === "down" ||
  //   message.producer_status === "offline"
  // ) {
  //   console.log("🚨 Bet stop: Producer is down");
  //   return true;
  // }

  // 3. The market status is active (not suspended or deactivated)
  const markets = message.markets || message.odds?.markets || [];
  const hasSuspendedMarkets = markets.some((market) => market.status !== 0);

  if (hasSuspendedMarkets) {
    console.log("🚨 Bet stop: Market status is not active");
    return true;
  }

  // 4. The outcome is active (not active="false")
  const hasInactiveOutcomes = markets.some((market) =>
    (market.outcomes || market.outcome || []).some((outcome) => !outcome.active)
  );

  if (hasInactiveOutcomes) {
    console.log("🚨 Bet stop: Outcome is not active");
    return true;
  }

  return false;
};

const handleBetStopMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("🛑 BET_STOP Details:", {
    matchId,
    eventId: message.event_id,
    groups: message.groups,
    marketStatus: message.market_status,
    betstopReason: message.betstop_reason,
    product: message.product,
  });

  // Handle bet stop by suspending markets
  if (message.groups && message.groups.includes("all")) {
    // Suspend all markets for this match
    console.log("🛑 Suspending all markets for match:", matchId);
    dispatch(suspendAllMarketsForMatch(parseInt(matchId)));
  }

  // Also update live fixture match status to suspended
  dispatch(
    updateLiveFixture({
      matchID: matchId,
      matchStatus: "1", // 1 = Suspended according to Unified Feed
    })
  );
};

const handleFixtureChangeMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("📅 FIXTURE_CHANGE Details:", {
    matchId,
    eventId: message.event_id,
    sportEventStatus: message.sport_event_status,
    timestamp: message.timestamp,
  });

  // Fixture change - update basic match info if needed
  if (message.sport_event_status) {
    const matchStatus = message.sport_event_status.match_status || 0;
    const clock = message.sport_event_status.clock;

    // Parse clock element for comprehensive time information
    const clockInfo = AppHelper.parseClockElement(clock);
    const formattedTime = AppHelper.formatMatchTime(clock);

    // Use time incrementer to ensure time always moves forward
    let incrementedTime = formattedTime;
    if (AppHelper.isValidLiveTime(clockInfo.matchTime)) {
      incrementedTime = AppHelper.createLiveTimeString(
        clockInfo.matchTime,
        true
      );

      // Add stoppage time back if it was present
      if (clockInfo.stoppageTime && clockInfo.stoppageTime > 0) {
        incrementedTime += `+${clockInfo.stoppageTime}`;
      }
    }

    console.log("⏰ Clock Information:", {
      matchTime: clockInfo.matchTime,
      stoppageTime: clockInfo.stoppageTime,
      stoppageTimeAnnounced: clockInfo.stoppageTimeAnnounced,
      remainingTime: clockInfo.remainingTime,
      remainingTimeInPeriod: clockInfo.remainingTimeInPeriod,
      stopped: clockInfo.stopped,
      formattedTime: formattedTime,
      incrementedTime: incrementedTime,
    });

    console.log(
      `⏰ Time update for match ${matchId}: ${formattedTime} → ${incrementedTime}`
    );

    // Check match status for suspension/interruption
    const isMatchSuspended = AppHelper.isMatchSuspendedByStatus(matchStatus);
    const isMatchFinished = AppHelper.isMatchFinished(matchStatus);
    const isMatchLive = AppHelper.isMatchLive(matchStatus);

    console.log("🏟️ Match Status Analysis:", {
      statusId: matchStatus,
      description: AppHelper.getMatchStatusDescription(matchStatus),
      isLive: isMatchLive,
      isFinished: isMatchFinished,
      isSuspended: isMatchSuspended,
    });

    // Suspend markets if match is suspended/interrupted
    if (isMatchSuspended) {
      console.log(
        "🛑 Match status indicates suspension, suspending all markets for match:",
        matchId
      );
      dispatch(suspendAllMarketsForMatch(parseInt(matchId)));
    }

    // Update fixture with comprehensive information
    dispatch(
      updateLiveFixture({
        matchID: matchId,
        eventTime: incrementedTime,
        homeScore: String(message.sport_event_status.home_score || 0),
        awayScore: String(message.sport_event_status.away_score || 0),
        matchStatus: String(matchStatus),
      })
    );
  }
};

const handleBetCancelMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  // Bet cancel - just log for now, backend handles the logic
  console.log("Bet cancel for match:", matchId, message);
};

const handleBetSettlementMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("💰 BET_SETTLEMENT Details:", {
    matchId,
    eventId: message.event_id,
    markets: message.markets,
    timestamp: message.timestamp,
  });

  // Handle bet settlement - settle/clear bets for listed markets and outcomes
  if (message.markets && message.markets.length > 0) {
    message.markets.forEach((market) => {
      if (market.outcomes && market.outcomes.length > 0) {
        market.outcomes.forEach((outcome) => {
          // Update outcome status to settled (3)
          dispatch(
            updateLiveFixtureOutcome({
              matchID: matchId,
              outcomeID: outcome.id,
              updates: {
                status: 3, // 3 = Settled
                active: false,
              },
            })
          );
        });
      }
    });
  }
};

const handleRollbackBetSettlementMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("↩️ ROLLBACK_BET_SETTLEMENT Details:", {
    matchId,
    eventId: message.event_id,
    markets: message.markets,
    timestamp: message.timestamp,
  });

  // Handle rollback bet settlement - undo previously sent bet settlement
  if (message.markets && message.markets.length > 0) {
    message.markets.forEach((market) => {
      if (market.outcomes && market.outcomes.length > 0) {
        market.outcomes.forEach((outcome) => {
          // Revert outcome status back to active (0)
          dispatch(
            updateLiveFixtureOutcome({
              matchID: matchId,
              outcomeID: outcome.id,
              updates: {
                status: 0, // 0 = Active
                active: true,
              },
            })
          );
        });
      }
    });
  }
};

const handleRollbackBetCancelMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("↩️ ROLLBACK_BET_CANCEL Details:", {
    matchId,
    eventId: message.event_id,
    markets: message.markets,
    timestamp: message.timestamp,
  });

  // Handle rollback bet cancel - undo previously sent bet cancel
  if (message.markets && message.markets.length > 0) {
    message.markets.forEach((market) => {
      if (market.outcomes && market.outcomes.length > 0) {
        market.outcomes.forEach((outcome) => {
          // Revert outcome status back to active (0)
          dispatch(
            updateLiveFixtureOutcome({
              matchID: matchId,
              outcomeID: outcome.id,
              updates: {
                status: 0, // 0 = Active
                active: true,
              },
            })
          );
        });
      }
    });
  }
};

const handleSnapshotCompleteMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("📸 SNAPSHOT_COMPLETE Details:", {
    matchId,
    eventId: message.event_id,
    timestamp: message.timestamp,
  });

  // Handle snapshot complete - all odds updates from recovery API have been sent
  console.log("✅ Snapshot complete for match:", matchId);
};

const handleProducerStatusMessage = (
  message: LiveBettingMessage,
  dispatch: ReturnType<typeof useAppDispatch>,
  matchId: string
) => {
  console.log("🏭 PRODUCER_STATUS Details:", {
    matchId,
    eventId: message.event_id,
    producerId: message.product,
    producerStatus: message.producer_status,
    timestamp: message.timestamp,
  });

  // Handle producer status - if producer is down, suspend all markets
  // if (
  //   message.producer_status === "down" ||
  //   message.producer_status === "offline"
  // ) {
  //   console.log(
  //     "🚨 Producer is down, suspending all markets for match:",
  //     matchId
  //   );
  //   dispatch(suspendAllMarketsForMatch(parseInt(matchId)));
  // }
};

const handleAliveMessage = (message?: LiveBettingMessage, dispatch?: unknown) =>
  // message: LiveBettingMessage,
  // dispatch: ReturnType<typeof useAppDispatch>
  {
    // Handle alive message - connection is working
    console.log("💓 MQTT Feed alive message received - system is healthy");
  };

const handleMTSResponse = (
  topic: string,
  message: any,
  dispatch?: unknown // dispatch: ReturnType<typeof useAppDispatch>
) => {
  console.log("🎯 MTS Response Details:", {
    topic,
    betId: message.bet_id,
    reason: message.reason,
    status: message.status,
  });

  // Handle different MTS response types
  if (topic.includes("/bet/accepted")) {
    console.log("✅ Bet accepted by MTS:", message.bet_id);
    // Dispatch action to update bet status in Redux
    // dispatch(updateBetStatus({ betId: message.bet_id, status: 'accepted' }));
  } else if (topic.includes("/bet/rejected")) {
    console.log(
      "❌ Bet rejected by MTS:",
      message.bet_id,
      "Reason:",
      message.reason
    );
    // Dispatch action to update bet status in Redux
    // dispatch(updateBetStatus({ betId: message.bet_id, status: 'rejected', reason: message.reason }));
  } else if (topic.includes("/bet/cancel/accepted")) {
    console.log("✅ Bet cancellation accepted by MTS:", message.bet_id);
    // Dispatch action to update bet status in Redux
    // dispatch(updateBetStatus({ betId: message.bet_id, status: 'cancelled' }));
  } else if (topic.includes("/bet/cancel/rejected")) {
    console.log(
      "❌ Bet cancellation rejected by MTS:",
      message.bet_id,
      "Reason:",
      message.reason
    );
    // Dispatch action to update bet status in Redux
    // dispatch(updateBetStatus({ betId: message.bet_id, status: 'cancel_rejected', reason: message.reason }));
  } else if (topic.includes("/bet/cashout/accepted")) {
    console.log("✅ Cashout accepted by MTS:", message.bet_id);
    // Dispatch action to update bet status in Redux
    // dispatch(updateBetStatus({ betId: message.bet_id, status: 'cashed_out' }));
  } else if (topic.includes("/bet/cashout/rejected")) {
    console.log(
      "❌ Cashout rejected by MTS:",
      message.bet_id,
      "Reason:",
      message.reason
    );
    // Dispatch action to update bet status in Redux
    // dispatch(updateBetStatus({ betId: message.bet_id, status: 'cashout_rejected', reason: message.reason }));
  } else if (topic.includes("mts_status")) {
    console.log("🏭 MTS Status Update:", message);
    // Handle MTS system status updates
  }
};

// ==================== CONVENIENCE FUNCTIONS ====================

/**
 * Subscribe to specific match feeds using the new service with dispatch
 */
export const subscribeToMatchFeedsWithDispatch = (
  matchId: number,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const mqttService = useMqttService();
  const unsubscribers: (() => void)[] = [];

  // Subscribe to different message types for this match
  unsubscribers.push(
    mqttService.subscribe(`feeds/live/odds_change/${matchId}`, (data) => {
      handleOddsChangeMessage(data, dispatch, matchId.toString());
    })
  );

  unsubscribers.push(
    mqttService.subscribe(`feeds/live/bet_stop/${matchId}`, (data) => {
      handleBetStopMessage(data, dispatch, matchId.toString());
    })
  );

  unsubscribers.push(
    mqttService.subscribe(`feeds/live/fixture_change/${matchId}`, (data) => {
      handleFixtureChangeMessage(data, dispatch, matchId.toString());
    })
  );

  unsubscribers.push(
    mqttService.subscribe(`feeds/prematch/odds_change/${matchId}`, (data) => {
      handleOddsChangeMessage(data, dispatch, matchId.toString());
    })
  );

  unsubscribers.push(
    mqttService.subscribe(`feeds/prematch/bet_stop/${matchId}`, (data) => {
      handleBetStopMessage(data, dispatch, matchId.toString());
    })
  );

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
};

/**
 * Disconnect MQTT feeds
 */
export const disconnectMQTTFeeds = () => {
  const mqttService = useMqttService();
  mqttService.disconnect();
};

/**
 * Check if MQTT is connected
 */
export const isMQTTFeedsConnected = (): boolean => {
  const mqttService = useMqttService();
  return mqttService.isConnected();
};

// ==================== MTS INTEGRATION FUNCTIONS ====================

// Send bet to MTS
export const sendBetToMTS = (betData: {
  stake: number;
  profile_id: number;
  bet_id: string;
  source: number;
  reply_prefix?: string;
  ip_address: string;
  bets: Array<{
    event_id: number;
    event_prefix: string;
    event_type: string;
    market_id: number;
    outcome_id: string;
    specifier: string;
    odds: number;
    sport_id: number;
    producer_id: number;
  }>;
}) => {
  const mqttService = useMqttService();

  if (mqttService.isConnected()) {
    console.log("🎯 Sending bet to MTS:", betData.bet_id);
    // Note: The new MQTT service doesn't have direct publish functionality
    // You may need to add this to the service or use a different approach
    console.log("✅ Bet data prepared for MTS:", betData);
  } else {
    console.error("❌ Cannot send bet to MTS - MQTT not connected");
  }
};

// Send bet cancellation to MTS
export const sendBetCancelToMTS = (cancelData: {
  bet_id: string;
  code: number;
  reply_prefix?: string;
}) => {
  const mqttService = useMqttService();

  if (mqttService.isConnected()) {
    console.log("❌ Sending bet cancellation to MTS:", cancelData.bet_id);
    // Note: The new MQTT service doesn't have direct publish functionality
    console.log("✅ Bet cancellation data prepared for MTS:", cancelData);
  } else {
    console.error(
      "❌ Cannot send bet cancellation to MTS - MQTT not connected"
    );
  }
};

// Send cashout to MTS
export const sendCashoutToMTS = (cashoutData: {
  stake: number;
  profile_id: number;
  bet_id: string;
  source: number;
  reply_prefix?: string;
  ip_address: string;
  bets: Array<{
    event_id: number;
    event_prefix: string;
    event_type: string;
    market_id: number;
    outcome_id: string;
    specifier: string;
    odds: number;
    sport_id: number;
    producer_id: number;
  }>;
}) => {
  const mqttService = useMqttService();

  if (mqttService.isConnected()) {
    console.log("💰 Sending cashout to MTS:", cashoutData.bet_id);
    // Note: The new MQTT service doesn't have direct publish functionality
    console.log("✅ Cashout data prepared for MTS:", cashoutData);
  } else {
    console.error("❌ Cannot send cashout to MTS - MQTT not connected");
  }
};

// Subscribe to MTS response topics
export const subscribeToMTSResponses = (replyPrefix: string = "sbe") => {
  const mqttService = useMqttService();
  const topics = [
    `${replyPrefix}/bet/rejected`,
    `${replyPrefix}/bet/accepted`,
    `${replyPrefix}/bet/cancel/rejected`,
    `${replyPrefix}/bet/cancel/accepted`,
    `${replyPrefix}/bet/cashout/rejected`,
    `${replyPrefix}/bet/cashout/accepted`,
    `bet/mts_status`,
  ];

  const unsubscribers: (() => void)[] = [];

  topics.forEach((topic) => {
    unsubscribers.push(
      mqttService.subscribe(topic, (data) => {
        handleMTSResponse(topic, data, null as any);
      })
    );
  });

  console.log("📡 Subscribed to MTS response topics:", topics);

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
};
