// Save this as: @/components/LiveTimeDisplay.tsx

import { AppHelper } from "@/utils/helper";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextStyle } from "react-native";

type ParsedTime = {
  minutes: number;
  seconds: number;
  addedTime: number;
  isValid: boolean;
};

const SPECIAL_STATES = [
  "HT",
  "FT",
  "AET",
  "PEN",
  "INT",
  "Pause",
  "Ended",
  "NS",
  "TBA",
];

const parseGameTime = (time: string): ParsedTime => {
  if (!time || SPECIAL_STATES.includes(time)) {
    return { minutes: 0, seconds: 0, addedTime: 0, isValid: false };
  }

  const cleaned = time.replace(/'/g, "").trim();

  if (/^\d+:\d{1,2}(\+\d+)?$/.test(cleaned)) {
    const [main, added] = cleaned.split("+");
    const [min, sec] = main.split(":");

    return {
      minutes: Number(min),
      seconds: Number(sec),
      addedTime: added ? Number(added) : 0,
      isValid: true,
    };
  }

  const [min, added] = cleaned.split("+");

  return {
    minutes: Number(min),
    seconds: 0,
    addedTime: added ? Number(added) : 0,
    isValid: !isNaN(Number(min)),
  };
};

const formatGameTime = (
  minutes: number,
  seconds: number,
  addedTime: number
): string => {
  const sec = seconds.toString().padStart(2, "0");
  return addedTime > 0
    ? `${minutes}'+${addedTime}:${sec}`
    : `${minutes}':${sec}`;
};

interface LiveTimeDisplayProps {
  eventTime: string;
  style?: TextStyle;
  isLive?: boolean;
  testMode?: boolean;
}

/**
 * Component that displays and auto-increments live game time
 * Handles formats like: "23'", "45'+2", "HT", "90'+5"
 *
 * Usage:
 * <LiveTimeDisplay
 *   eventTime={fixture.eventTime}
 *   isLive={fixture.status === "live"}
 * />
 */

const LiveTimeDisplay: React.FC<LiveTimeDisplayProps> = ({
  eventTime: _event_time,
  style,
  isLive = true,
  testMode = false,
}) => {
  // If you want to clean the eventTime, add your helper here, e.g.:
  // const eventTime = AppHelper.extractCleanTime(_event_time);
  const eventTime =
    _event_time === "--:--"
      ? _event_time
      : AppHelper.extractCleanTime(_event_time);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [addedTime, setAddedTime] = useState(0);
  const [display, setDisplay] = useState(eventTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isLive) {
      setDisplay(eventTime);
      return;
    }

    const parsed = parseGameTime(eventTime);
    if (!parsed.isValid) {
      setDisplay(eventTime);
      return;
    }

    setMinutes(parsed.minutes);
    setSeconds(parsed.seconds);
    setAddedTime(parsed.addedTime);
    setDisplay(
      formatGameTime(parsed.minutes, parsed.seconds, parsed.addedTime)
    );

    const interval = testMode ? 1000 : 1000;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s < 59) return s + 1;
        setMinutes((m) => m + 1);
        return 0;
      });
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [eventTime, isLive, testMode]);

  useEffect(() => {
    setDisplay(formatGameTime(minutes, seconds, addedTime));
  }, [minutes, seconds, addedTime]);

  return (
    <Text
      style={[
        {
          color: "#eee",
          fontSize: 13,
          marginBottom: 4,
          fontWeight: "600",
        },
        style,
      ]}
    >
      {display}
    </Text>
  );
};

export default LiveTimeDisplay;
