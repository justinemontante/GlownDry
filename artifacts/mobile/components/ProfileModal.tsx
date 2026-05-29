import { FlaticonIcon } from "./FlaticonIcon";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert, Animated, Dimensions, Image, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useUpdateCustomer } from "@workspace/api-client-react";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_W = SCREEN_W;

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer, logout, updateProfile } = useAuth();
  const updateMutation = useUpdateCustomer();
  const slideAnim = useRef(new Animated.Value(DRAWER_W)).current;
  const [rendered, setRendered] = useState(visible);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(customer?.fullName ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      slideAnim.setValue(DRAWER_W);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: DRAWER_W,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setRendered(false));
    }
  }, [visible, slideAnim]);

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
          onClose();
          router.replace("/(auth)/");
        },
      },
    ]);
  }

  if (!rendered) return null;

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawer,
            { paddingTop: insets.top, paddingBottom: insets.bottom + 20, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.drawerHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <FlaticonIcon name="arrow-left" size={20} color="#1a2a3a" />
            </TouchableOpacity>
            <Text style={styles.drawerTitle}>Profile</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={handlePickImage} disabled={uploading} activeOpacity={0.8}>
                <View style={styles.avatarOuter}>
                  {customer?.profileImage ? (
                    <Image source={{ uri: customer.profileImage }} style={styles.avatarImage} />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: "#0A7474" }]}>
                      <FlaticonIcon name="camera" size={34} color="#fff" />
                    </View>
                  )}
                  <View style={[styles.cameraOverlay, !customer?.profileImage && styles.cameraOverlayEmpty]}>
                    <FlaticonIcon name="camera" size={16} color={customer?.profileImage ? "#fff" : "#0A7474"} />
                  </View>
                </View>
                <Text style={styles.changePhotoText}>
                  {uploading ? "Uploading..." : customer?.profileImage ? "Change Photo" : "Tap to Add Photo"}
                </Text>
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

            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                {!editing ? (
                  <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                    <FlaticonIcon name="edit-2" size={14} color="#0A7474" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                      <FlaticonIcon name="check" size={14} color="#fff" />
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.divider} />
              <View style={styles.fieldsContainer}>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIconWrap}>
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
                  <TouchableOpacity style={styles.fieldIconWrap} activeOpacity={0.7}>
                    <FlaticonIcon name="phone" size={16} color="#0A7474" />
                  </TouchableOpacity>
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
                  <View style={styles.fieldIconWrap}>
                    <FlaticonIcon name="mail" size={16} color="#0A7474" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <Text style={[styles.fieldValue, { color: "#8a94a6" }]}>{customer?.email}</Text>
                  </View>
                </View>
              </View>
            </View>



            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <FlaticonIcon name="log-out" size={18} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawer: {
    position: "absolute", top: 0, right: 0, bottom: 0,
    width: DRAWER_W,
    backgroundColor: "#EBF3F6",
    paddingHorizontal: 20,
    shadowColor: "#000", shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 16,
  },
  drawerHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 16,
  },
  drawerTitle: {
    fontSize: 20, fontFamily: "Inter_800ExtraBold",
    color: "#1a2a3a",
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  profileHeader: {
    alignItems: "center", paddingVertical: 16, gap: 6,
  },
  avatarOuter: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    marginBottom: 4, borderWidth: 3, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
  },
  cameraOverlay: {
    position: "absolute", bottom: -2, right: -2,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#0A7474",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2.5, borderColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 5,
  },
  cameraOverlayEmpty: {
    backgroundColor: "#fff",
  },
  changePhotoText: {
    fontSize: 12, fontFamily: "Inter_500Medium",
    color: "#0A7474", textAlign: "center", marginTop: 4,
  },
  name: {
    fontSize: 20, fontFamily: "Inter_700Bold",
    color: "#1a2a3a",
  },
  email: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#8a94a6",
  },
  badgeRow: {
    flexDirection: "row", gap: 8, marginTop: 4,
  },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#e8f4f4", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    color: "#0A7474",
  },
  sectionCard: {
    backgroundColor: "#fff", borderRadius: 18,
    marginBottom: 14, paddingBottom: 4,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16, paddingVertical: 14,
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
  },
  fieldsContainer: {
    paddingVertical: 4,
  },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  fieldDivider: {
    height: 1, backgroundColor: "#f7fafa",
    marginLeft: 60, marginRight: 16,
  },
  fieldIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#e8f4f4",
    alignItems: "center", justifyContent: "center",
  },
  fieldContent: { flex: 1 },
  fieldLabel: {
    fontSize: 11, fontFamily: "Inter_500Medium",
    textTransform: "uppercase", letterSpacing: 0.5,
    color: "#8a94a6",
  },
  fieldValue: {
    fontSize: 14, fontFamily: "Inter_500Medium",
    color: "#1a2a3a", marginTop: 2,
  },
  fieldInput: {
    fontSize: 14, fontFamily: "Inter_500Medium",
    color: "#1a2a3a", marginTop: 2,
    borderBottomWidth: 1.5, borderBottomColor: "#0A7474",
    paddingBottom: 2,
  },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "#ef4444", marginBottom: 8,
  },
  logoutText: {
    fontSize: 15, fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
