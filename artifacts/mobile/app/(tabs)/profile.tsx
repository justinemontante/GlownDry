import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useUpdateCustomer } from "@workspace/api-client-react";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer, logout, updateProfile } = useAuth();
  const updateMutation = useUpdateCustomer();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(customer?.fullName ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");

  const initials = customer?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  async function handleSave() {
    if (!customer) return;
    try {
      const updated = await updateMutation.mutateAsync({ id: customer.id, data: { fullName, phone } });
      updateProfile({ fullName: updated.fullName, phone: updated.phone });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
    } catch {
      Alert.alert("Error", "Could not update profile.");
    }
  }

  async function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/");
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{customer?.fullName}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{customer?.email}</Text>
        <View style={[styles.badge, { backgroundColor: colors.tealLight }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {customer?.totalOrders ?? 0} orders
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Personal Info</Text>
          {!editing ? (
            <TouchableOpacity
              onPress={() => setEditing(true)}
              testID="btn-edit-profile"
            >
              <Feather name="edit-2" size={18} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setEditing(false)} testID="btn-cancel-edit">
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} testID="btn-save-profile">
                <Feather name="check" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {[
          { label: "Full Name", value: fullName, setter: setFullName, icon: "user" as const },
          { label: "Phone", value: phone, setter: setPhone, icon: "phone" as const, type: "phone" },
        ].map(f => (
          <View key={f.label} style={styles.fieldRow}>
            <View style={[styles.fieldIconWrap, { backgroundColor: colors.tealLight }]}>
              <Feather name={f.icon} size={16} color={colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
              {editing ? (
                <TextInput
                  style={[styles.fieldInput, { color: colors.foreground, borderBottomColor: colors.primary }]}
                  value={f.value}
                  onChangeText={f.setter}
                  keyboardType={f.type === "phone" ? "phone-pad" : "default"}
                  testID={`input-${f.label.toLowerCase().replace(/\s+/g, "-")}`}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>{f.value || "—"}</Text>
              )}
            </View>
          </View>
        ))}

        <View style={styles.fieldRow}>
          <View style={[styles.fieldIconWrap, { backgroundColor: colors.tealLight }]}>
            <Feather name="mail" size={16} color={colors.primary} />
          </View>
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
            <Text style={[styles.fieldValue, { color: colors.mutedForeground }]}>{customer?.email}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: "Booking History", icon: "clock" as const, onPress: () => router.push("/(tabs)/notifications") },
          { label: "Track Current Order", icon: "map-pin" as const, onPress: () => router.push("/(tabs)/track") },
          { label: "New Booking", icon: "plus-circle" as const, onPress: () => router.push("/(tabs)/booking") },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={item.onPress}
            activeOpacity={0.7}
            testID={`menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Feather name={item.icon} size={18} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.destructive }]}
        onPress={handleLogout}
        activeOpacity={0.8}
        testID="btn-logout"
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  avatarSection: { alignItems: "center", paddingBottom: 28, gap: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  initials: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  email: { fontSize: 14, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  card: {
    borderRadius: 16, padding: 4, borderWidth: 1, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 14,
  },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  editActions: { flexDirection: "row", gap: 14 },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  fieldIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4 },
  fieldValue: { fontSize: 15, fontFamily: "Inter_500Medium", marginTop: 2 },
  fieldInput: {
    fontSize: 15, fontFamily: "Inter_500Medium",
    borderBottomWidth: 1.5, paddingBottom: 2, marginTop: 2,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5,
  },
  logoutText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
