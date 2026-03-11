import { TouchableOpacity, Image, View, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { router } from "expo-router";
import { Text } from "../Themed";
import CurrencyFormatter from "../inputs/CurrencyFormatter";
import AppImage from "../inputs/AppImage";

export default function AppHeader() {
  const { openModal } = useModal();
  const { is_authenticated, user } = useAppSelector((state) => state.user);

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <AppImage
          imageKey={"logo"}
          height={32}
          width={80}
          style={{
            height: 34,
            width: 80,
            resizeMode: "contain",
          }}
        />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            router.push("/search");
          }}
        >
          <FontAwesome name="search" size={22} color="#C72C3B" />
        </TouchableOpacity>
        {is_authenticated ? (
          <>
            <TouchableOpacity
              style={styles.depositButton}
              onPress={() => {
                router.push("/deposit");
                // openModal({ modal_name: MODAL_COMPONENTS.DEPOSIT_MODAL });
              }}
            >
              <Text style={styles.depositText}>Deposit</Text>
            </TouchableOpacity>
            <View style={styles.balanceBox}>
              <CurrencyFormatter
                amount={user?.availableBalance ?? 0}
                textStyle={styles.balanceText}
                decimalStyle={{
                  color: "#989898",
                  fontSize: 14,
                }}
                allowToggle={false}
              />
              {/* <Text style={styles.balanceText}>
                ₦ {user?.availableBalance ?? "0.00"}
              </Text> */}
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => {
                openModal({
                  modal_name: MODAL_COMPONENTS.REGISTER_MODAL,
                });
              }}
              style={styles.joinNowButton}
            >
              <Text style={styles.joinNowText}>Join Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                openModal({
                  modal_name: MODAL_COMPONENTS.LOGIN_MODAL,
                });
              }}
            >
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#d3d7db",
    borderBottomWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22215b",
    borderRadius: 2,
    overflow: "hidden",
    height: 32,
    width: 80,
  },
  logoBet: {
    color: "white",
    fontFamily: "PoppinsSemiBold",
    fontSize: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#22215b",
  },
  logo24: {
    color: "white",
    fontFamily: "PoppinsSemiBold",
    fontSize: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#C72C3B",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  iconButton: {
    marginHorizontal: 8,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  depositButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#C72C3B",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  depositText: {
    color: "#C72C3B",
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
  },
  balanceBox: {
    borderWidth: 1.5,
    borderColor: "#C72C3B",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 6,
    backgroundColor: "#f7f7f7",
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceText: {
    color: "#222",
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
  },
  joinNowButton: {
    borderWidth: 1.5,
    borderColor: "#C72C3B",
    backgroundColor: "#C72C3B",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  joinNowText: {
    color: "white",
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
  },
  loginButton: {
    borderWidth: 1.5,
    borderColor: "#C72C3B",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  loginText: {
    color: "#C72C3B",
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
  },
});
