// Save as: @/components/inputs/DateRangePicker.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  isValid,
} from "date-fns";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DateRangePickerProps {
  value?: { startDate: string; endDate: string };
  onChange: (range: { startDate: string; endDate: string }) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date range",
  label,
  error,
  required = false,
  style,
  inputStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    value?.startDate ? new Date(value.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    value?.endDate ? new Date(value.endDate) : null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDayInput, setStartDayInput] = useState("");
  const [startMonthInput, setStartMonthInput] = useState("");
  const [startYearInput, setStartYearInput] = useState("");
  const [endDayInput, setEndDayInput] = useState("");
  const [endMonthInput, setEndMonthInput] = useState("");
  const [endYearInput, setEndYearInput] = useState("");

  const startMonthRef = useRef<TextInput>(null);
  const startYearRef = useRef<TextInput>(null);
  const endDayRef = useRef<TextInput>(null);
  const endMonthRef = useRef<TextInput>(null);
  const endYearRef = useRef<TextInput>(null);

  // Update input values when dates change from calendar
  useEffect(() => {
    if (startDate) {
      setStartDayInput(format(startDate, "dd"));
      setStartMonthInput(format(startDate, "MM"));
      setStartYearInput(format(startDate, "yyyy"));
    }
    if (endDate) {
      setEndDayInput(format(endDate, "dd"));
      setEndMonthInput(format(endDate, "MM"));
      setEndYearInput(format(endDate, "yyyy"));
    }
  }, [startDate, endDate]);

  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (isBefore(date, startDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      setEndDate(date);
      onChange({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(date, "yyyy-MM-dd"),
      });
      setIsOpen(false);
    }
  };

  const handleStartDayChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    if (value.length <= 2) {
      setStartDayInput(value);
      if (value.length === 2) {
        startMonthRef.current?.focus();
      }
    }
  };

  const handleStartMonthChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    if (value.length <= 2) {
      setStartMonthInput(value);
      if (value.length === 2) {
        startYearRef.current?.focus();
      }
    }
  };

  const handleStartYearChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    if (value.length <= 4) {
      setStartYearInput(value);
      if (value.length === 4 && startDayInput && startMonthInput) {
        const newDate = new Date(
          parseInt(value),
          parseInt(startMonthInput) - 1,
          parseInt(startDayInput)
        );
        if (isValid(newDate)) {
          setStartDate(newDate);
        }
      }
    }
  };

  const handleEndDayChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    if (value.length <= 2) {
      setEndDayInput(value);
      if (value.length === 2) {
        endMonthRef.current?.focus();
      }
    }
  };

  const handleEndMonthChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    if (value.length <= 2) {
      setEndMonthInput(value);
      if (value.length === 2) {
        endYearRef.current?.focus();
      }
    }
  };

  const handleEndYearChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    if (value.length <= 4) {
      setEndYearInput(value);
      if (value.length === 4 && endDayInput && endMonthInput && startDate) {
        const newDate = new Date(
          parseInt(value),
          parseInt(endMonthInput) - 1,
          parseInt(endDayInput)
        );
        if (isValid(newDate) && isAfter(newDate, startDate)) {
          setEndDate(newDate);
          onChange({
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(newDate, "yyyy-MM-dd"),
          });
        }
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(
      direction === "prev"
        ? subMonths(currentMonth, 1)
        : addMonths(currentMonth, 1)
    );
  };

  const renderCalendar = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const firstDayOfMonth = startOfMonth(currentMonth);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const paddingDays = Array(firstDayOfWeek).fill(null);

    return (
      <View style={styles.calendarContainer}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => navigateMonth("prev")}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.monthYearText}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>

          <TouchableOpacity
            onPress={() => navigateMonth("next")}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {/* Padding days */}
          {paddingDays.map((_, index) => (
            <View key={`padding-${index}`} style={styles.dayCell} />
          ))}

          {/* Actual days */}
          {days.map((day) => {
            const isInRange =
              startDate &&
              endDate &&
              isAfter(day, startDate) &&
              isBefore(day, endDate);
            const isStart = startDate && isSameDay(day, startDate);
            const isEnd = endDate && isSameDay(day, endDate);

            return (
              <TouchableOpacity
                key={day.toString()}
                onPress={() => handleDateSelect(day)}
                style={[
                  styles.dayCell,
                  !isSameMonth(day, currentMonth) && styles.otherMonthDay,
                  isInRange && styles.inRangeDay,
                  (isStart || isEnd) && styles.selectedDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !isSameMonth(day, currentMonth) && styles.otherMonthText,
                    (isStart || isEnd) && styles.selectedDayText,
                  ]}
                >
                  {format(day, "d")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[styles.inputWrapper, error && styles.inputError, inputStyle]}
      >
        {/* Start Date Inputs */}
        <View style={styles.dateInputGroup}>
          <TextInput
            value={startDayInput}
            onChangeText={handleStartDayChange}
            placeholder="DD"
            placeholderTextColor="#9ca3af"
            style={styles.dateInput}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            ref={startMonthRef}
            value={startMonthInput}
            onChangeText={handleStartMonthChange}
            placeholder="MM"
            placeholderTextColor="#9ca3af"
            style={styles.dateInput}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            ref={startYearRef}
            value={startYearInput}
            onChangeText={handleStartYearChange}
            placeholder="YYYY"
            placeholderTextColor="#9ca3af"
            style={styles.yearInput}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        <Ionicons name="remove-outline" size={20} color="#6b7280" />

        {/* End Date Inputs */}
        <View style={styles.dateInputGroup}>
          <TextInput
            ref={endDayRef}
            value={endDayInput}
            onChangeText={handleEndDayChange}
            placeholder="DD"
            placeholderTextColor="#9ca3af"
            style={styles.dateInput}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            ref={endMonthRef}
            value={endMonthInput}
            onChangeText={handleEndMonthChange}
            placeholder="MM"
            placeholderTextColor="#9ca3af"
            style={styles.dateInput}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            ref={endYearRef}
            value={endYearInput}
            onChangeText={handleEndYearChange}
            placeholder="YYYY"
            placeholderTextColor="#9ca3af"
            style={styles.yearInput}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        {/* Calendar Icon */}
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={styles.calendarButton}
        >
          <Ionicons name="calendar-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Calendar Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.calendarScroll}
            >
              {renderCalendar()}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setStartDayInput("");
                  setStartMonthInput("");
                  setStartYearInput("");
                  setEndDayInput("");
                  setEndMonthInput("");
                  setEndYearInput("");
                  onChange({ startDate: "", endDate: "" });
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setIsOpen(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DateRangePicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  required: {
    color: "#ef4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  dateInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateInput: {
    width: 28,
    textAlign: "center",
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  yearInput: {
    width: 42,
    textAlign: "center",
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  separator: {
    fontSize: 14,
    color: "#6b7280",
  },
  calendarButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  calendarScroll: {
    maxHeight: 400,
  },

  // Calendar Styles
  calendarContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  dayText: {
    fontSize: 14,
    color: "#111827",
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: "#9ca3af",
  },
  inRangeDay: {
    backgroundColor: "#dbeafe",
  },
  selectedDay: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "700",
  },

  // Modal Actions
  modalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  doneButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
