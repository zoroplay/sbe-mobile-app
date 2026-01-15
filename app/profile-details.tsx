import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useModal } from "@/hooks/useModal";

const Profile = () => {
  const { is_authenticated, user } = useAppSelector((state) => state.user);
  // Helper to get value or 'Not Set'
  const getValue = (val: string | undefined | null) =>
    val && val !== "" ? val : "Not Set";
  const { openModal } = useModal();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "rgb(6,0,25)" }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{getValue(user?.username)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>First Name</Text>
        <Text style={styles.value}>{getValue(user?.firstName)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Last Name</Text>
        <Text style={styles.value}>{getValue(user?.lastName)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <TouchableOpacity>
          <Text style={styles.valueLink}>{getValue(user?.email)}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Phone Number</Text>
        <Text style={styles.value}>
          {user?.phone ? `+234 ${user.phone}` : "Not Set"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Address</Text>
        <TouchableOpacity>
          <Text style={styles.valueLink}>{getValue(user?.address)}</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.row}>
        <Text style={styles.label}>City</Text>
        <TouchableOpacity>
          <Text style={styles.valueLink}>{getValue(user?.city)}</Text>
        </TouchableOpacity>
      </View> */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          openModal({
            modal_name: MODAL_COMPONENTS.CHANGE_PASSWORD_MODAL,
          });
        }}
      >
        <Text style={styles.label}>Change your password</Text>
        <Text style={styles.valueLink}>{">"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#07142a",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2332",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  value: {
    color: "#bfc9d1",
    fontSize: 16,
    fontWeight: "400",
  },
  valueLink: {
    color: "#bfc9d1",
    fontSize: 16,
    fontWeight: "400",
    textDecorationLine: "underline",
  },
});
