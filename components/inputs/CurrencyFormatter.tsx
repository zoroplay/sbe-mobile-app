import { useAppSelector } from "@/hooks/useAppDispatch";
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Text } from "../Themed";

type Props = {
  amount: number | string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  decimalStyle?: TextStyle;
  precision?: number;
  allowToggle?: boolean;
};

const CurrencyFormatter = ({
  amount = 0,
  style,
  textStyle,
  decimalStyle,
  precision = 1,
  allowToggle = true,
}: Props) => {
  const [isAbbreviated, setIsAbbreviated] = useState(false);
  const { global_variables } = useAppSelector((state) => state.app);
  const locale = global_variables?.currency_code === "NGN" ? "en-NG" : "en-US";
  const currency = global_variables?.currency_code || "USD";
  const currencySymbol = global_variables?.currency || "₦";

  let numeric_amount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric_amount)) numeric_amount = 0;

  const formatAbbreviated = (value: number) => {
    const absValue = Math.abs(value);

    // Don't abbreviate numbers under 1,000
    if (absValue < 1000) {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      } catch (error) {
        return `${currencySymbol}${value.toFixed(2)}`;
      }
    }

    // Handle larger numbers
    if (absValue >= 1e9) {
      return `${currencySymbol}${(value / 1e9).toFixed(precision)}B`;
    }
    if (absValue >= 1e6) {
      return `${currencySymbol}${(value / 1e6).toFixed(precision)}M`;
    }
    if (absValue >= 1e3) {
      return `${currencySymbol}${(value / 1e3).toFixed(precision)}K`;
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency || "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      return `${currencySymbol}${value.toFixed(2)}`;
    }
  };

  const formatCurrency = (value: number) => {
    if (isAbbreviated) {
      const formatted = formatAbbreviated(value);
      // If the value is under 1000, check if it's under 100
      if (Math.abs(value) < 1000) {
        // For values under 100, render as usual (no splitting)
        if (Math.abs(value) < 100) {
          return {
            integer: formatted,
            decimal: "",
          };
        }
        // For values 100-999, split integer and decimal parts
        const parts = formatted.split(".");
        return {
          integer: parts[0],
          decimal: parts[1] || "",
        };
      }
      return {
        integer: formatted,
        decimal: "",
      };
    }

    let formatted: string;
    try {
      formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      formatted = `${currencySymbol}${value.toFixed(2)}`;
    }

    // For values under 100, render as usual (no splitting)
    if (Math.abs(value) < 100) {
      return {
        integer: formatted,
        decimal: "",
      };
    }

    // For values 100 and above, split integer and decimal parts
    const parts = formatted.split(".");
    return {
      integer: parts[0],
      decimal: parts[1] || "00",
    };
  };

  const formatted = formatCurrency(numeric_amount);

  const handlePress = () => {
    // Only allow toggling for numbers >= 1000 and if allowToggle is true
    if (allowToggle && Math.abs(numeric_amount) >= 1000) {
      setIsAbbreviated(!isAbbreviated);
    }
  };

  const isClickable = allowToggle && Math.abs(numeric_amount) >= 1000;

  const content = (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>{formatted.integer}</Text>
      {formatted.decimal && (
        <Text style={[styles.decimal, decimalStyle]}>.{formatted.decimal}</Text>
      )}
    </View>
  );

  if (isClickable) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.touchable, style]}
      >
        <Text style={[styles.text, textStyle]}>{formatted.integer}</Text>
        {formatted.decimal && (
          <Text style={[styles.decimal, decimalStyle]}>
            .{formatted.decimal}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return content;
};

export default CurrencyFormatter;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  touchable: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  text: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
  },
  decimal: {
    fontSize: 14,
    color: "#9096A2",
    fontWeight: "400",
  },
});
