import React, { useState, forwardRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../Themed";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  optionalLabel?: React.ReactNode;
  bottomLabel?: React.ReactNode;
  required?: boolean;
  isValid?: boolean;
  isChecking?: boolean;
  validatePassword?: boolean;
  className?: string;
  type?: "text" | "email" | "password" | "number" | "phone" | "num_select";
  countryCode?: string;
  num_select_placeholder?: string | React.ReactNode;
  onSuffixPress?: () => void;
  // Style props
  wrapperStyle?: object;
  inputStyle?: object;
  suffixStyle?: object;
}

interface PasswordStrength {
  score: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  minLength: boolean;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      optionalLabel,
      bottomLabel,
      required = false,
      isValid,
      isChecking,
      validatePassword = false,
      className = "",
      placeholder,
      value,
      onChangeText,
      type = "text",
      countryCode = "+234",
      num_select_placeholder,
      onSuffixPress,
      wrapperStyle,
      inputStyle,
      suffixStyle,
      style,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const [showError, setShowError] = useState(false);
    const [validationMessage, setValidationMessage] = useState<string | null>(
      null,
    );
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
      score: 0,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSpecial: false,
      minLength: false,
    });

    const password = type === "password";
    const isNumSelect = type === "num_select";

    useEffect(() => {
      if (password && validatePassword && value) {
        const strength = checkPasswordStrength(value as string);
        setPasswordStrength(strength);
      }
    }, [password, validatePassword, value]);

    const checkPasswordStrength = (password: string): PasswordStrength => {
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
      const minLength = password.length >= 8;

      let score = 0;
      if (hasLower) score++;
      if (hasUpper) score++;
      if (hasNumber) score++;
      if (hasSpecial) score++;
      if (minLength) score++;

      score = Math.min(4, Math.floor(score * 0.8));

      return {
        score,
        hasLower,
        hasUpper,
        hasNumber,
        hasSpecial,
        minLength,
      };
    };

    const handleBlur = () => {
      setIsFocused(false);

      if (required && !value) {
        setShowError(true);
        setValidationMessage("This field is required");
      } else if (password && validatePassword && value) {
        const strength = passwordStrength;
        if (strength.score < 3) {
          setShowError(true);
          setValidationMessage("Password is not strong enough");
        } else {
          setShowError(false);
          setValidationMessage(null);
        }
      } else {
        setShowError(false);
        setValidationMessage(null);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      setShowError(false);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const getBorderColor = () => {
      if (showError || error) return "#ff6347";
      if (isValid) return "#10b981";
      if (isFocused) return "#3b82f6";
      return isDark ? "#333333" : "#e5e7eb";
    };

    const getPasswordStrengthColor = () => {
      const { score } = passwordStrength;
      if (score === 0) return "#ef4444";
      if (score === 1) return "#f59e0b";
      if (score === 2) return "#f59e0b";
      if (score === 3) return "#10b981";
      if (score === 4) return "#10b981";
      return "#e5e7eb";
    };

    const getPasswordStrengthText = () => {
      const { score } = passwordStrength;
      if (score === 0) return "Very Weak";
      if (score === 1) return "Weak";
      if (score === 2) return "Fair";
      if (score === 3) return "Good";
      if (score === 4) return "Strong";
      return "";
    };

    const renderSuffixContent = () => {
      if (typeof num_select_placeholder === "string") {
        return (
          <Text style={[styles.suffixText, suffixStyle]}>
            {num_select_placeholder ?? ""}
          </Text>
        );
      }
      return num_select_placeholder;
    };

    return (
      <View style={styles.container}>
        {label && (
          <View style={styles.labelRow}>
            <Text
              style={[
                styles.labelText,
                showError || error
                  ? styles.errorText
                  : isDark
                    ? styles.darkLabel
                    : styles.lightLabel,
              ]}
            >
              {label}
              {required && <Text style={styles.errorText}> *</Text>}
            </Text>
            {optionalLabel && (
              <Text style={styles.optionalLabel}>{optionalLabel}</Text>
            )}
          </View>
        )}

        <View
          style={[
            styles.inputWrapper,
            { borderColor: getBorderColor() },
            wrapperStyle,
          ]}
        >
          {type === "phone" && (
            <Text
              style={[styles.prefix, { color: isDark ? "#f9fafb" : "#111827" }]}
            >
              {countryCode}
            </Text>
          )}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#111827" : "#f9fafb",
                color: isDark ? "#f9fafb" : "#111827",
                paddingLeft: type === "phone" ? 0 : 12,
                paddingRight:
                  isNumSelect || password || isChecking || isValid ? 48 : 12,
              },
              props.multiline ? { height: "auto" } : { height: 44 },
              inputStyle,
              style,
            ]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={password && !showPassword}
            placeholderTextColor="#9ca3af"
            keyboardType={
              type === "phone"
                ? "phone-pad"
                : type === "number" || isNumSelect
                  ? "numeric"
                  : props.keyboardType
            }
            {...props}
          />

          {/* num_select suffix */}
          {isNumSelect && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={() => {
                if (onSuffixPress) {
                  onSuffixPress();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.suffixContainer}>
                {renderSuffixContent()}
              </View>
            </TouchableOpacity>
          )}

          {/* Password toggle */}
          {password && !isNumSelect && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={togglePasswordVisibility}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>
          )}

          {/* Checking indicator */}
          {isChecking && !isNumSelect && (
            <View style={styles.rightIcon}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#6b7280" />
            </View>
          )}

          {/* Valid indicator */}
          {isValid && !isChecking && !password && !isNumSelect && (
            <View style={styles.rightIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            </View>
          )}
        </View>

        {password && validatePassword && value && (
          <View style={styles.passwordContainer}>
            <View style={styles.passwordStrengthRow}>
              <Text style={styles.passwordStrengthLabel}>
                Password strength:
              </Text>
              <Text
                style={[
                  styles.passwordStrengthText,
                  { color: getPasswordStrengthColor() },
                ]}
              >
                {getPasswordStrengthText()}
              </Text>
            </View>

            <View style={styles.passwordStrengthBarBackground}>
              <View
                style={[
                  styles.passwordStrengthBar,
                  {
                    width: `${(passwordStrength.score / 4) * 100}%`,
                    backgroundColor: getPasswordStrengthColor(),
                  },
                ]}
              />
            </View>

            <View style={styles.passwordCriteriaRow}>
              <PasswordCriteria
                label="8+ chars"
                met={passwordStrength.minLength}
              />
              <PasswordCriteria
                label="Uppercase"
                met={passwordStrength.hasUpper}
              />
              <PasswordCriteria
                label="Lowercase"
                met={passwordStrength.hasLower}
              />
              <PasswordCriteria
                label="Number"
                met={passwordStrength.hasNumber}
              />
              <PasswordCriteria
                label="Special char"
                met={passwordStrength.hasSpecial}
              />
            </View>
          </View>
        )}

        {bottomLabel && !password && (
          <Text style={styles.bottomLabel}>{bottomLabel}</Text>
        )}

        {(showError || error) && (
          <Text style={styles.errorMessage}>
            {validationMessage || error || ""}
          </Text>
        )}
      </View>
    );
  },
);

export default Input;

const styles = StyleSheet.create({
  container: { marginBottom: 12, width: "100%" },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  labelText: { fontSize: 14, fontWeight: "500" },
  lightLabel: { color: "#999A99" },
  darkLabel: { color: "#e5e7eb" },
  errorText: { color: "#ff6347" },
  optionalLabel: { fontSize: 12, color: "#6b7280" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    height: 44,
  },
  prefix: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 4,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  suffixContainer: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
  },
  suffixText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6b7280",
  },
  passwordContainer: { marginTop: 8 },
  passwordStrengthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  passwordStrengthLabel: { fontSize: 12, color: "#6b7280" },
  passwordStrengthText: { fontSize: 12, fontWeight: "500" },
  passwordStrengthBarBackground: {
    flexDirection: "row",
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  passwordStrengthBar: { height: 4 },
  passwordCriteriaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  bottomLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
  errorMessage: { fontSize: 12, color: "#ff6347", marginTop: 4 },
});

const PasswordCriteria = ({ label, met }: { label: string; met: boolean }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      opacity: met ? 1 : 0.5,
      marginRight: 8,
      marginBottom: 4,
    }}
  >
    <Ionicons
      name={met ? "checkmark-circle" : "close-circle"}
      size={14}
      color={met ? "#10b981" : "#ef4444"}
    />
    <Text style={{ fontSize: 12, color: "#4b5563", marginLeft: 4 }}>
      {label}
    </Text>
  </View>
);
