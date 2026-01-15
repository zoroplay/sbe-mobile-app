import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CurrencyFormatter from "@/components/inputs/CurrencyFormatter";
import { useAppSelector } from "@/hooks/useAppDispatch";

interface SuccessModalProps {
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
  const { title, props, description } = useAppSelector((state) => state.modal);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (betslipId: string) => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(betslipId);
      } else {
        Clipboard.setString(betslipId);
      }
      setCopied(true);
      // Optionally show a toast here
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // fallback or error handling
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          {/* Description */}
          <Text style={styles.description}>{description}</Text>
          {/* Betslip ID */}
          {props?.betslip_id && (
            <View style={styles.rowBetween}>
              <View style={styles.rowStart}>
                <Text style={styles.label}>BetSlip ID:</Text>
                <Text style={styles.value}>{props.betslip_id}</Text>
              </View>
              <TouchableOpacity onPress={() => handleCopy(props.betslip_id)}>
                <Ionicons
                  name={copied ? "copy" : "copy-outline"}
                  size={22}
                  color={copied ? "#22c55e" : "#2563eb"}
                />
              </TouchableOpacity>
            </View>
          )}
          {/* Stake */}
          {props?.stake && (
            <View style={styles.rowStart}>
              <Text style={styles.label}>Stake:</Text>
              <CurrencyFormatter
                amount={props.stake}
                textStyle={styles.value}
              />
            </View>
          )}
          {/* Potential Winnings */}
          {props?.potential_winnings && (
            <View style={styles.rowStart}>
              <Text style={styles.label}>Potential Winnings:</Text>
              <CurrencyFormatter
                amount={props.potential_winnings}
                textStyle={styles.value}
              />
            </View>
          )}
          {/* Continue Button */}
          <TouchableOpacity style={styles.continueBtn} onPress={onClose}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
  },
  description: {
    color: "#444",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  rowStart: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: "#222",
    fontWeight: "600",
    fontSize: 15,
    marginRight: 4,
  },
  value: {
    color: "#222",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  continueBtn: {
    marginTop: 18,
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  continueBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
