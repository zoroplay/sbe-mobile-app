import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LoadingBar from "../loaders/LoadingBar";
import { Text } from "../Themed";

export type SearchState = {
  isValid: boolean;
  isNotFound: boolean;
  isLoading: boolean;
  message: string;
};

export type SingleSearchInputProps = {
  placeholder: string;
  label?: string;
  onSearch: (query: string) => void;
  searchState: SearchState;
  required?: boolean;
  className?: string;
  error?: null | string;
  value?: string;
  fetchThreshold?: number;
  onResetSearchState?: () => void;
  type?: "text" | "email";
  bgColor?: string;
  textColor?: string;
};

const SingleSearchInput = ({
  placeholder,
  label,
  onSearch,
  searchState,
  required = false,
  className = "",
  error,
  value = "",
  fetchThreshold = 4,
  onResetSearchState,
  type = "text",
  textColor = "text-slate-800",
  bgColor = "#f8fafc",
}: SingleSearchInputProps) => {
  const [query, setQuery] = useState<string>(value || "");
  const [showError, setShowError] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValidFormat, setIsValidFormat] = useState<boolean>(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>(query);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateInput = (value: string): boolean => {
    if (type === "email") {
      const isValid = emailRegex.test(value);
      setIsValidFormat(isValid);
      if (!isValid && value.length > 0) {
        setValidationMessage("Please enter a valid email address");
        setShowError(true);
      } else {
        setShowError(false);
        setValidationMessage("");
      }
      return isValid;
    }
    return true;
  };

  const handleBlur = () => {
    setIsFocused(false);
    Keyboard.dismiss();

    if (required && !query) {
      setShowError(true);
      setValidationMessage("This field is required");
    } else if (type === "email") {
      validateInput(query);
    }
  };

  const handleChange = (text: string) => {
    setQuery(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text !== lastQueryRef.current) {
      setHasSearched(false);
      onResetSearchState?.();
    }

    // Validate the input format
    const isValid = validateInput(text);

    // Only trigger search if the input is valid (for email) or if type is text
    if (
      text.length >= fetchThreshold &&
      !hasSearched &&
      (type !== "email" || isValid)
    ) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch(text);
        setHasSearched(true);
        lastQueryRef.current = text;
      }, 500);
    }
  };

  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
      setHasSearched(false);
      lastQueryRef.current = value;
      if (type === "email") {
        validateInput(value);
      }
    }
  }, [value]);

  useEffect(() => {
    setShowError(Boolean(error));
  }, [error]);

  const getBorderColor = () => {
    if (isFocused) return "border-blue-500";
    if (searchState.isNotFound || !isValidFormat) return "border-red-500";
    if (searchState.isValid && isValidFormat) return "border-green-500";
    return "border-slate-300";
  };

  const getRingColor = () => {
    if (isFocused) return "focus:ring-blue-500";
    if (searchState.isNotFound || !isValidFormat) return "focus:ring-red-500";
    if (searchState.isValid && isValidFormat) return "focus:ring-green-500";
    return "focus:ring-blue-500";
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    setIsFocused(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, className ? {} : null]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                showError ? styles.labelError : styles.labelDefault,
              ]}
            >
              {label}
            </Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              isFocused && styles.inputFocused,
              !isValidFormat || searchState.isNotFound
                ? styles.inputError
                : null,
              searchState.isValid && isValidFormat ? styles.inputValid : null,
              // Custom colors if provided
              textColor ? { color: textColor } : null,
              bgColor
                ? { backgroundColor: bgColor }
                : { backgroundColor: styles.input.backgroundColor },
            ]}
            placeholder={placeholder}
            value={query}
            onChangeText={handleChange}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            editable={!searchState.isLoading}
            keyboardType={type === "email" ? "email-address" : "default"}
            autoCapitalize={type === "email" ? "none" : "sentences"}
            placeholderTextColor="#94a3b8"
          />

          <LoadingBar isLoading={searchState.isLoading} height={44} />
        </View>

        {!searchState.isLoading && searchState.isValid && isValidFormat && (
          <View style={styles.statusRow}>
            <MaterialIcons name="check-circle" size={20} color="#22c55e" />
            <Text style={styles.statusValidText}>
              {searchState.message || "Item found!"}
            </Text>
          </View>
        )}

        {!searchState.isLoading && searchState.isNotFound && isValidFormat && (
          <View style={styles.statusRow}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.statusErrorText}>
              {searchState.message || "Item not found."}
            </Text>
          </View>
        )}

        {!isValidFormat && query.length > 0 && (
          <View style={styles.statusRow}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.statusErrorText}>
              Please enter a valid email address
            </Text>
          </View>
        )}

        {/* {searchState.isLoading && (
          <Text style={styles.searchingText}>Searching...</Text>
        )} */}

        {validationMessage ||
          (error && (
            <View style={styles.errorContainer}>
              <Text
                style={[
                  styles.errorText,
                  showError ? styles.errorVisible : styles.errorHidden,
                ]}
              >
                * {validationMessage || error}
              </Text>
            </View>
          ))}
      </View>
    </TouchableWithoutFeedback>
  );
  // React Native StyleSheet styles
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
  },
  labelContainer: {
    justifyContent: "flex-start",
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  labelError: {
    color: "#ef4444",
  },
  labelDefault: {
    color: "#334155",
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
  input: {
    height: 42,
    width: "100%",
    paddingHorizontal: 12,
    // paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    fontSize: 15,
    color: "#334155",
    transitionProperty: "border-color",
    transitionDuration: "200ms",
  },
  inputFocused: {
    borderColor: "#3b82f6",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  inputValid: {
    borderColor: "#22c55e",
  },
  loadingOverlay: {
    position: "absolute",
    opacity: 0.7,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  statusValidText: {
    fontSize: 12,
    color: "#22c55e",
  },
  statusErrorText: {
    fontSize: 12,
    color: "#ef4444",
  },
  searchingText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  errorContainer: {
    height: 16,
    overflow: "hidden",
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ef4444",
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: "200ms",
  },
  errorVisible: {
    opacity: 1,
  },
  errorHidden: {
    opacity: 0,
  },
});

export default SingleSearchInput;
