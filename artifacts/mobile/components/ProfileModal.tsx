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
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
            <View style={styles.sectionCard}>
              <View style={styles.profileHeader}>
                <TouchableOpacity onPress={handlePickImage} disabled={uploading} activeOpacity={0.8}>
                  <View style={styles.avatarOuter}>
                    {customer?.profileImage ? (
                      <Image source={{ uri: customer.profileImage }} style={styles.avatarImage} />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: "#00C6B5" }]}>
                        <FlaticonIcon name="camera" size={34} color="#1a2a3a" />
                      </View>
                    )}
                    <View style={[styles.cameraOverlay, !customer?.profileImage && styles.cameraOverlayEmpty]}>
                      <FlaticonIcon name="camera" size={16} color={customer?.profileImage ? "#1a2a3a" : "#00C6B5"} />
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
                    <FlaticonIcon name="check-circle" size={12} color="#00C6B5" />
                    <Text style={styles.badgeText}>{customer?.totalOrders ?? 0} orders</Text>
                  </View>
                  {joinDate && (
                    <View style={styles.badge}>
                      <FlaticonIcon name="calendar" size={12} color="#00C6B5" />
                      <Text style={styles.badgeText}>Since {joinDate}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                {!editing ? (
                  <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                    <FlaticonIcon name="edit-2" size={14} color="#00C6B5" />
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
                    <FlaticonIcon name="user" size={16} color="#00C6B5" />
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
                    <FlaticonIcon name="phone" size={16} color="#00C6B5" />
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
                    <FlaticonIcon name="mail" size={16} color="#00C6B5" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <Text style={[styles.fieldValue, { color: "#8a94a6" }]}>{customer?.email}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                <FlaticonIcon name="log-out" size={18} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
            </View>
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
    backgroundColor: "#1a2a3a",
    shadowColor: "#000", shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 16,
  },
  container: {
    paddingHorizontal: 20, paddingBottom: 40,
  },
  drawerHeader: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 16, paddingHorizontal: 20,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  profileHeader: {
    alignItems: "center", paddingTop: 24, paddingBottom: 8, gap: 8,
  },
  avatarOuter: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
  },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#00C6B5",
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#1a2a3a",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  cameraOverlayEmpty: {
    backgroundColor: "#fff",
  },
  changePhotoText: {
    fontSize: 12, fontFamily: "Inter_500Medium",
    color: "#00C6B5", textAlign: "center", marginTop: 6,
  },
  name: {
    fontSize: 22, fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  email: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  badgeRow: {
    flexDirection: "row", gap: 8, marginTop: 6,
  },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,198,181,0.15)",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(0,198,181,0.3)",
  },
  badgeText: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    color: "#00C6B5",
  },
  sectionCard: {
    backgroundColor: "#243044",
    borderRadius: 20,
    marginTop: 20,
    paddingBottom: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16, paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 15, fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,198,181,0.15)",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(0,198,181,0.3)",
  },
  editBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#00C6B5",
  },
  editActions: {
    flexDirection: "row", gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cancelBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.6)",
  },
  saveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#00C6B5", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#1a2a3a",
  },
  divider: {
    height: 1, backgroundColor: "rgba(255,255,255,0.06)",
  },
  fieldsContainer: {
    paddingVertical: 4,
  },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  fieldDivider: {
    height: 1, backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: 62, marginRight: 16,
  },
  fieldIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(0,198,181,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  fieldContent: { flex: 1 },
  fieldLabel: {
    fontSize: 11, fontFamily: "Inter_500Medium",
    textTransform: "uppercase", letterSpacing: 0.5,
    color: "rgba(255,255,255,0.45)",
  },
  fieldValue: {
    fontSize: 15, fontFamily: "Inter_500Medium",
    color: "#fff", marginTop: 3,
  },
  fieldInput: {
    fontSize: 15, fontFamily: "Inter_500Medium",
    color: "#fff", marginTop: 3,
    borderBottomWidth: 1.5, borderBottomColor: "#00C6B5",
    paddingBottom: 3,
  },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 14,
    backgroundColor: "#ef4444", marginTop: 16,
  },
  logoutText: {
    fontSize: 15, fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
