import { FlaticonIcon } from "@/components/FlaticonIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Image, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useUpdateCustomer } from "@workspace/api-client-react";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer, logout, updateProfile } = useAuth();
  const updateMutation = useUpdateCustomer();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(customer?.fullName ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [uploading, setUploading] = useState(false);

  const initials = customer?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const joinDate = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library to change your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) return;

    const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
    if (!customer) return;

    setUploading(true);
    try {
      const updated = await updateMutation.mutateAsync({ id: customer.id, data: { profileImage: base64 } });
      await updateProfile({ profileImage: updated.profileImage });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Could not update profile picture.");
    } finally {
      setUploading(false);
    }
  }

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
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#EBF3F6", "#E0EDE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: bottomPad + 120 }}
        showsVerticalScrollIndicator={false}
      >

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePickImage} disabled={uploading} activeOpacity={0.8}>
          <View style={styles.avatarOuter}>
            {customer?.profileImage ? (
              <Image source={{ uri: customer.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: "#0A7474" }]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <FlaticonIcon name="camera" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{customer?.fullName}</Text>
        <Text style={styles.email}>{customer?.email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <FlaticonIcon name="check-circle" size={12} color="#0A7474" />
            <Text style={styles.badgeText}>{customer?.totalOrders ?? 0} orders</Text>
          </View>
          {joinDate && (
            <View style={styles.badge}>
              <FlaticonIcon name="calendar" size={12} color="#0A7474" />
              <Text style={styles.badgeText}>Since {joinDate}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Personal Info Card */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.cardIconWrap, { backgroundColor: "#e8f4f4" }]}>
              <FlaticonIcon name="user" size={16} color="#0A7474" />
            </View>
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          {!editing ? (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditing(true)}
              testID="btn-edit-profile"
            >
              <FlaticonIcon name="edit-2" size={14} color="#0A7474" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)} testID="btn-cancel-edit">
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} testID="btn-save-profile">
                <FlaticonIcon name="check" size={14} color="#fff" />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldsContainer}>
          <View style={styles.fieldRow}>
            <View style={[styles.fieldIconWrap, { backgroundColor: "#e8f4f4" }]}>
              <FlaticonIcon name="user" size={16} color="#0A7474" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={fullName}
                  onChangeText={setFullName}
                  testID="input-full-name"
                />
              ) : (
                <Text style={styles.fieldValue}>{fullName || "—"}</Text>
              )}
            </View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <View style={[styles.fieldIconWrap, { backgroundColor: "#e8f4f4" }]}>
              <FlaticonIcon name="phone" size={16} color="#0A7474" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  testID="input-phone"
                />
              ) : (
                <Text style={styles.fieldValue}>{phone || "—"}</Text>
              )}
            </View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <View style={[styles.fieldIconWrap, { backgroundColor: "#e8f4f4" }]}>
              <FlaticonIcon name="mail" size={16} color="#0A7474" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={[styles.fieldValue, { color: "#8a94a6" }]}>{customer?.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Links Card */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.cardIconWrap, { backgroundColor: "#e8f4f4" }]}>
              <FlaticonIcon name="clock" size={16} color="#0A7474" />
            </View>
            <Text style={styles.cardTitle}>Quick Links</Text>
          </View>
        </View>
        <View style={styles.divider} />
        {[
          { label: "Booking History", icon: "archive" as const, desc: "View all your past bookings", route: "/(tabs)/notifications" as const },
          { label: "Track Current Order", icon: "map-pin" as const, desc: "See real-time order status", route: "/(tabs)/track" as const },
          { label: "New Booking", icon: "plus-circle" as const, desc: "Schedule a new laundry service", route: "/(tabs)/booking" as const },
        ].map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
            testID={`menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#f0fdfa" }]}>
              <FlaticonIcon name={item.icon} size={18} color="#0A7474" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <FlaticonIcon name="chevron-right" size={16} color="#c0c8d4" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
        testID="btn-logout"
      >
        <FlaticonIcon name="log-out" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Profile Header
  profileHeader: {
    alignItems: "center", paddingBottom: 24, gap: 6,
  },
  avatarOuter: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    marginBottom: 4, borderWidth: 2, borderColor: "#e2e8f0",
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: "center", justifyContent: "center",
  },
  initials: {
    fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff",
  },
  avatarImage: {
    width: 84, height: 84, borderRadius: 42,
  },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#0A7474",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  name: {
    fontSize: 22, fontFamily: "Inter_700Bold",
    color: "#1a2a3a",
  },
  email: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#8a94a6",
  },
  badgeRow: {
    flexDirection: "row", gap: 8, marginTop: 6,
  },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#e8f4f4", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#0A7474",
  },

  // Cards
  sectionCard: {
    backgroundColor: "#fff", borderRadius: 18,
    marginBottom: 16, padding: 4,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16, paddingVertical: 16,
    flexWrap: "wrap", gap: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row", alignItems: "center", gap: 10,
    flexShrink: 1,
  },
  cardIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15, fontFamily: "Inter_700Bold",
    color: "#1a2a3a",
  },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#e8f4f4", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#0A7474",
  },
  editActions: {
    flexDirection: "row", gap: 6,
  },
  cancelBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  cancelBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#8a94a6",
  },
  saveBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#0A7474", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  divider: {
    height: 1, backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },

  // Fields
  fieldsContainer: {
    paddingVertical: 4,
  },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  fieldDivider: {
    height: 1, backgroundColor: "#f7fafa",
    marginLeft: 64, marginRight: 16,
  },
  fieldIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  fieldContent: { flex: 1 },
  fieldLabel: {
    fontSize: 11, fontFamily: "Inter_500Medium",
    textTransform: "uppercase", letterSpacing: 0.5,
    color: "#8a94a6",
  },
  fieldValue: {
    fontSize: 15, fontFamily: "Inter_500Medium",
    color: "#1a2a3a", marginTop: 2,
  },
  fieldInput: {
    fontSize: 15, fontFamily: "Inter_500Medium",
    color: "#1a2a3a", marginTop: 2,
    borderBottomWidth: 1.5, borderBottomColor: "#0A7474",
    paddingBottom: 2,
  },

  // Menu
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  menuContent: { flex: 1 },
  menuLabel: {
    fontSize: 15, fontFamily: "Inter_600SemiBold",
    color: "#1a2a3a",
  },
  menuDesc: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    color: "#8a94a6", marginTop: 1,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "#ef4444", marginTop: 8,
  },
  logoutText: {
    fontSize: 15, fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
