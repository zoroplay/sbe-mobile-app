import { StyleSheet, TouchableOpacity, View, Linking } from "react-native";
import React from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useAppDispatch";
import { logoutUser } from "@/store/features/slice/user.slice";
import { FontAwesome6 } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { brandName } from "@/config/theme";
import { Text } from "../Themed";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useModal } from "@/hooks/useModal";

const Footer = () => {
  const { is_authenticated } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  const year = new Date().getFullYear();
  const openLink = (url: string) => Linking.openURL(url);
  return (
    <View style={{ width: "100%", backgroundColor: "#2c3039" }}>
      <View
        style={{
          alignItems: "center",
          width: "100%",
          paddingBottom: 0,
          gap: 12,
          paddingBlock: 12,
        }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.ageRow}>
            <FontAwesome6
              name="file-contract"
              size={22}
              color="#b0b8c1"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.ageText}>18</Text>
            <Text style={styles.agePlus}>+</Text>
          </View>
          <Text style={styles.copyright}>
            © {year} {brandName()}. All rights reserved.
          </Text>
        </View>

        {/* Logo and payment methods */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 8,
            marginTop: 8,
            gap: 12,
          }}
        >
          <View style={styles.logoRow}>
            <Text style={styles.logoBet}>bet</Text>
            <Text style={styles.logo24}>24</Text>
          </View>
          <Text style={styles.paymentMethodsLabel}>Payment methods</Text>
          <View style={styles.paymentIconsRow}>
            {/* VISA */}
            <Text style={styles.paymentIconText}>VISA</Text>
            {/* Mastercard */}
            <MaterialIcons
              name="payment"
              size={28}
              color="#e53935"
              style={{ marginHorizontal: 6 }}
            />
            {/* Bank transfer */}
            <MaterialIcons
              name="swap-horiz"
              size={28}
              color="#2d3a8c"
              style={{ marginHorizontal: 6 }}
            />
            {/* Wallet */}
            <MaterialIcons
              name="account-balance-wallet"
              size={28}
              color="#fbc02d"
              style={{ marginHorizontal: 6 }}
            />
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Age 18 and above only to register or play at Bet24. Play Responsibly.
          Betting is addictive and can be psychologically harmful. | Bet24 is a
          product of Fane International Sports Tour LTD and is licensed by the
          National Lottery Regulatory Commission.
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Links */}
        <View style={styles.linkRow}>
          <Text style={styles.linkText} onPress={() => openLink("#")}>
            Terms & Conditions
          </Text>
          <Text style={styles.linkText} onPress={() => openLink("#")}>
            About Us
          </Text>
          <Text style={styles.linkText} onPress={() => openLink("#")}>
            Responsible Gaming
          </Text>
        </View>
        <View style={styles.linkRow}>
          <Text style={styles.linkText} onPress={() => openLink("#")}>
            Privacy Policy
          </Text>
          <Text style={styles.linkText} onPress={() => openLink("#")}>
            Refund Policy
          </Text>
        </View>

        {/* Back to Top button */}
        <TouchableOpacity
          style={styles.backToTopBtn}
          onPress={() => {
            if (!is_authenticated) {
              openModal({
                modal_name: MODAL_COMPONENTS.LOGIN_MODAL,
              });
              return;
            }
            dispatch(logoutUser());
            // Scroll to top logic (if available)
          }}
        >
          <Text style={styles.backToTopText}>
            {!is_authenticated ? "Login" : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: "#404653",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#404653",
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ageText: {
    color: "#b0b8c1",
    fontFamily: "PoppinsSemibold",
    fontSize: 24,
    marginLeft: 2,
  },
  agePlus: {
    color: "#b0b8c1",
    fontFamily: "PoppinsSemibold",
    fontSize: 18,
    marginLeft: 1,
  },
  copyright: {
    color: "#e53935",
    fontSize: 13,
    fontFamily: "PoppinsSemibold",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  logoBet: {
    color: "#2d3a8c",
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingHorizontal: 6,
    fontWeight: "bold",
    fontSize: 32,
    letterSpacing: 1,
  },
  logo24: {
    color: "#fff",
    backgroundColor: "#e53935",
    borderRadius: 4,
    paddingHorizontal: 6,
    fontWeight: "bold",
    fontSize: 32,
    letterSpacing: 1,
    marginLeft: 2,
  },
  paymentMethodsLabel: {
    color: "#b0b8c1",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 2,
  },
  paymentIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  paymentIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    marginHorizontal: 6,
    letterSpacing: 1,
  },
  disclaimer: {
    color: "#b0b8c1",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    marginHorizontal: 12,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#2a3350",
    width: "100%",
    marginVertical: 8,
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 4,
  },
  linkText: {
    color: "#7ea7e0",
    textDecorationLine: "underline",
    marginHorizontal: 4,
    fontSize: 14,
  },
  backToTopBtn: {
    backgroundColor: "#444b5a",
    borderRadius: 4,
    marginTop: 16,
    width: "90%",
    alignSelf: "center",
    marginBottom: 16,
  },
  backToTopText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    paddingVertical: 12,
  },
});
