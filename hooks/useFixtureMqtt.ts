import { useEffect, useRef, useState } from "react";
import { useMatchMqtt } from "./useMqtt";

export interface OddsOverride {
  odds: number;
  active: boolean | number;
  trend: "increase" | "decrease" | "stable";
}

/**
 * Per-fixture MQTT hook built on top of useMatchMqtt.
 *
 * - Subscribes to odds_change for this match (live + prematch) and maintains
 *   a local `oddsOverrides` map keyed by outcomeID so callers can merge live
 *   odds into their outcome objects without touching Redux state.
 *
 * - Subscribes to bet_stop for this match.  When received, `isStopped`
 *   becomes true so the calling component can return null and remove itself
 *   from the rendered list.
 *
 * - Trend arrows ("increase" / "decrease") reset back to "stable" after 2 s.
 */
export const useFixtureMqtt = (matchID: string | undefined) => {
  const [oddsOverrides, setOddsOverrides] = useState<
    Record<string, OddsOverride>
  >({});
  const [isStopped, setIsStopped] = useState(false);
  const isMountedRef = useRef(true);
  const { subscribeToMatch } = useMatchMqtt(matchID ?? "");

  // Track mounted state for safe async callbacks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!matchID) return;

    const unsubscribe = subscribeToMatch((data: any) => {
      if (!isMountedRef.current) return;

      // ── bet_stop ──────────────────────────────────────────────────────────
      // Primary: topic injected by mqtt-feeds.service; fallback: no markets
      if (
        data?._topic?.includes("bet_stop") ||
        data?.message_type === "bet_stop"
      ) {
        setIsStopped(true);
        return;
      }

      // ── fixture_status (live only) ────────────────────────────────────────
      // status_code 100 = match ended; treat same as bet_stop
      if (data?._topic?.includes("fixture_status")) {
        if (data?.status_code === 100) {
          setIsStopped(true);
        }
        return;
      }

      // ── odds_change: update local odds overrides ──────────────────────────
      const markets: any[] = data?.markets || data?.odds?.markets || [];
      // Secondary bet_stop guard: odds_change always has markets; if empty, it's a stop
      if (!markets.length && data?._topic?.includes("odds_change") === false) {
        setIsStopped(true);
        return;
      }
      if (!markets.length) return;

      setOddsOverrides((prev) => {
        const next = { ...prev };

        markets.forEach((market) => {
          const outcomes: any[] = market.outcomes || market.outcome || [];
          outcomes.forEach((outcome) => {
            const prevOdds = prev[outcome.id]?.odds;
            const newOdds: number = outcome.odds;

            let trend: OddsOverride["trend"] = "stable";
            if (prevOdds !== undefined && newOdds !== prevOdds) {
              trend = newOdds > prevOdds ? "increase" : "decrease";
            }

            next[outcome.id] = { odds: newOdds, active: outcome.active, trend };

            // Reset trend arrow after 2 s — safe to do here (not in a reducer)
            if (trend !== "stable") {
              setTimeout(() => {
                if (!isMountedRef.current) return;
                setOddsOverrides((curr) => {
                  const entry = curr[outcome.id];
                  if (!entry || entry.trend === "stable") return curr;
                  return {
                    ...curr,
                    [outcome.id]: { ...entry, trend: "stable" },
                  };
                });
              }, 2000);
            }
          });
        });

        return next;
      });
    });

    return () => unsubscribe();
  }, [matchID]);

  return { oddsOverrides, isStopped };
};
