import { DateTimePickerModal } from "@/components/DateTimePickerModal";
import { FlaticonIcon } from "@/components/FlaticonIcon";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Image, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useListServices, useCreateBooking } from "@workspace/api-client-react";

const MIN_WEIGHT = 8;

const SERVICE_ICONS: Record<string, string> = {
  "wash": "washing-machine",
  "dry": "wind",
  "express": "clock",
  "delicate": "star",
  "regular": "washing-machine",
};

function getServiceIcon(name: string) {
  const lower = name.toLowerCase();
  const key = Object.keys(SERVICE_ICONS).find(k => lower.includes(k));
  return SERVICE_ICONS[key ?? "washing-machine"];
}

export default function BookingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: services, isLoading: loadingServices } = useListServices();
  const createBooking = useCreateBooking();

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [showPicker, setShowPicker] = useState(false);

  const selectedSvc = services?.find(s => s.id === selectedService);
  const estimatedTotal = selectedSvc && weight ? parseFloat(weight) * selectedSvc.pricePerKg : 0;
  const weightNum = parseFloat(weight);
  const weightError = weight.trim() !== "" && (isNaN(weightNum) || weightNum < MIN_WEIGHT);

  function formatDateLabel() {
    if (!selectedDate && !selectedTime) return "Tap to select schedule";
    if (selectedDate && selectedTime) {
      const d = new Date(selectedDate + "T12:00:00");
      const dateStr = d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
      const [h, m] = selectedTime.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${dateStr} at ${hour12}:${m} ${ampm}`;
    }
    if (selectedDate) {
      const d = new Date(selectedDate + "T12:00:00");
      return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    }
    return "";
  }

  async function handleBook() {
    if (!selectedService) { Alert.alert("Select a service"); return; }
    if (!selectedDate) { Alert.alert("Select drop-off schedule"); return; }
    if (!selectedTime) { Alert.alert("Select drop-off schedule"); return; }
    if (!customer) { Alert.alert("Not logged in"); return; }
    if (!weight.trim() || isNaN(weightNum) || weightNum < MIN_WEIGHT) {
      Alert.alert(`Minimum of ${MIN_WEIGHT} kg required`);
      return;
    }

    const phDate = new Date(`${selectedDate}T${selectedTime}:00+08:00`);

    try {
      await createBooking.mutateAsync({
        data: {
          customerId: customer.id,
          serviceId: selectedService,
          scheduledDate: phDate.toISOString(),
          weightKg: weightNum,
          notes: notes || undefined,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Booking Confirmed!", "Your drop-off has been scheduled.", [
        { text: "Track Order", onPress: () => router.replace("/(tabs)/track") },
        { text: "OK", onPress: () => router.replace("/(tabs)/") },
      ]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Failed", "Could not create booking. Please try again.");
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#EBF3F6", "#E0EDE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.container, { paddingTop: 20, paddingBottom: bottomPad + 140, flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>New Booking</Text>

      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 0, marginBottom: 0 }]}>Choose Service</Text>
      </View>
      {loadingServices ? (
        <Text style={[styles.loading, { color: colors.mutedForeground }]}>Loading services…</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceGallery}>
          {(services ?? []).map(svc => (
            <TouchableOpacity
              key={svc.id}
              style={[
                styles.serviceCard,
                selectedService === svc.id && { borderColor: colors.primary, backgroundColor: colors.tealLight },
              ]}
              onPress={() => setSelectedService(svc.id)}
              activeOpacity={0.85}
              testID={`btn-service-${svc.id}`}
            >
              {svc.serviceImage ? (
                <Image source={{ uri: svc.serviceImage }} style={styles.svcImage} />
              ) : (
                <View style={[styles.svcIconWrap, { backgroundColor: colors.tealLight }]}>
                  <FlaticonIcon
                    name={getServiceIcon(svc.name)}
                    size={22}
                    color={selectedService === svc.id ? colors.primary : colors.mutedForeground}
                  />
                </View>
              )}
              <Text style={[styles.svcName, { color: selectedService === svc.id ? colors.primary : colors.foreground }]}>
                {svc.name}
              </Text>
              <Text style={[styles.svcPrice, { color: colors.mutedForeground }]}>₱{svc.pricePerKg}/kg</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Drop off Schedule</Text>

      <TouchableOpacity
        style={[styles.scheduleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setShowPicker(true)}
      >
        <View style={[styles.scheduleIconWrap, { backgroundColor: colors.tealLight }]}>
          <FlaticonIcon name="calendar" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.scheduleBtnText, { color: selectedDate ? colors.foreground : colors.mutedForeground }]}>
          {formatDateLabel()}
        </Text>
        <FlaticonIcon name="chevron-right" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      <DateTimePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(date, time) => {
          setSelectedDate(date);
          setSelectedTime(time);
          setShowPicker(false);
        }}
      />

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Weight (kg)</Text>
      <View style={[styles.inputCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.inputCardLabel}>
          <FlaticonIcon name="package" size={16} color={colors.primary} />
          <Text style={[styles.inputCardLabelText, { color: colors.mutedForeground }]}>Estimated weight</Text>
        </View>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="0.0"
          placeholderTextColor={colors.mutedForeground}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          testID="input-weight"
        />
      </View>
      {weightError && (
        <Text style={styles.errorHint}>Minimum of {MIN_WEIGHT} kg required</Text>
      )}

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Notes (optional)</Text>
      <View style={[styles.inputCard, { borderColor: colors.border, backgroundColor: colors.card, paddingVertical: 12 }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground, minHeight: 80, textAlignVertical: "top", paddingTop: 0 }]}
          placeholder="Special instructions, stain notes…"
          placeholderTextColor={colors.mutedForeground}
          value={notes}
          onChangeText={setNotes}
          multiline
          testID="input-notes"
        />
      </View>

      {estimatedTotal > 0 && (
        <View style={[styles.estimateCard, { backgroundColor: colors.tealLight, borderColor: colors.accent }]}>
          <Text style={[styles.estimateLabel, { color: colors.primary }]}>Estimated Total</Text>
          <Text style={[styles.estimateAmount, { color: colors.primary }]}>₱{estimatedTotal.toFixed(2)}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btnBook, { backgroundColor: colors.primary, opacity: (createBooking.isPending || weightError) ? 0.7 : 1 }]}
        onPress={handleBook}
        disabled={createBooking.isPending || weightError}
        activeOpacity={0.85}
        testID="btn-confirm-booking"
      >
        <FlaticonIcon name="check-circle" size={18} color="#fff" />
        <Text style={styles.btnBookText}>
          {createBooking.isPending ? "Booking…" : "Confirm Drop-off"}
        </Text>
      </TouchableOpacity>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 0 },
  sectionHeaderRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 8, marginBottom: 10,
  },
  pageTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4, letterSpacing: -0.5 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 24, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  loading: { fontSize: 14 },
  serviceGallery: { paddingRight: 20, gap: 12, paddingVertical: 8 },
  serviceCard: {
    width: 130, padding: 14, borderRadius: 20, borderWidth: 1.5,
    borderColor: "#e2e8f0", backgroundColor: "#fff",
    alignItems: "center", gap: 8,
    shadowColor: "#0A9C8C", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  svcImage: { width: 60, height: 60, borderRadius: 12, resizeMode: "contain" },
  svcIconWrap: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  svcName: { fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "center", color: "#1a2a3a" },
  svcPrice: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#0A9C8C" },
  scheduleBtn: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    gap: 14,
  },
  scheduleIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  scheduleBtnText: {
    flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold",
  },
  inputCard: {
    borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8,
  },
  inputCardLabel: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2,
  },
  inputCardLabelText: {
    fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4,
  },
  input: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", paddingVertical: 4 },
  estimateCard: {
    marginTop: 24, padding: 18, borderRadius: 16, borderWidth: 1,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  estimateLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  estimateAmount: { fontSize: 24, fontFamily: "Inter_700Bold" },
  btnBook: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 18, borderRadius: 16, marginTop: 28,
    shadowColor: "#0A9C8C", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  btnBookText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  errorHint: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#ef4444", marginTop: 4, marginLeft: 4 },
});
