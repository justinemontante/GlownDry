import { DateTimePickerModal } from "@/components/DateTimePickerModal";
import { FlaticonIcon } from "@/components/FlaticonIcon";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useListServices, useCreateBooking } from "@workspace/api-client-react";

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

    const phDate = new Date(`${selectedDate}T${selectedTime}:00+08:00`);

    try {
      await createBooking.mutateAsync({
        data: {
          customerId: customer.id,
          serviceId: selectedService,
          scheduledDate: phDate.toISOString(),
          weightKg: weight ? parseFloat(weight) : undefined,
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
        contentContainerStyle={[styles.container, { paddingTop: 8, paddingBottom: bottomPad + 140 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>New Booking</Text>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Choose Service</Text>
      {loadingServices ? (
        <Text style={[styles.loading, { color: colors.mutedForeground }]}>Loading services…</Text>
      ) : (
        <View style={styles.serviceGrid}>
          {(services ?? []).map(svc => (
            <TouchableOpacity
              key={svc.id}
              style={[
                styles.serviceCard,
                { backgroundColor: colors.card, borderColor: selectedService === svc.id ? colors.primary : colors.border },
                selectedService === svc.id && { backgroundColor: colors.tealLight },
              ]}
              onPress={() => setSelectedService(svc.id)}
              activeOpacity={0.75}
              testID={`btn-service-${svc.id}`}
            >
              <FlaticonIcon
                name="wind"
                size={22}
                color={selectedService === svc.id ? colors.primary : colors.mutedForeground}
              />
              <Text style={[styles.svcName, { color: selectedService === svc.id ? colors.primary : colors.foreground }]}>
                {svc.name}
              </Text>
              <Text style={[styles.svcPrice, { color: colors.mutedForeground }]}>₱{svc.pricePerKg}/kg</Text>
            </TouchableOpacity>
          ))}
        </View>
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
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <FlaticonIcon name="package" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="Estimated weight"
          placeholderTextColor={colors.mutedForeground}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          testID="input-weight"
        />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Notes (optional)</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card, alignItems: "flex-start" }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground, minHeight: 80, textAlignVertical: "top", paddingTop: 4 }]}
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
        style={[styles.btnBook, { backgroundColor: colors.primary, opacity: createBooking.isPending ? 0.7 : 1 }]}
        onPress={handleBook}
        disabled={createBooking.isPending}
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
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 20, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  loading: { fontSize: 14 },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceCard: {
    width: "47%", padding: 14, borderRadius: 14, borderWidth: 1.5,
    alignItems: "center", gap: 6,
  },
  svcName: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  svcPrice: { fontSize: 12, fontFamily: "Inter_400Regular" },
  scheduleBtn: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    gap: 12,
  },
  scheduleIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  scheduleBtnText: {
    flex: 1, fontSize: 15, fontFamily: "Inter_500Medium",
  },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  estimateCard: {
    marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  estimateLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  estimateAmount: { fontSize: 22, fontFamily: "Inter_700Bold" },
  btnBook: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 14, marginTop: 24,
  },
  btnBookText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
