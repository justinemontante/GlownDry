import { FlaticonIcon } from "@/components/FlaticonIcon";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useListServices, useCreateBooking } from "@workspace/api-client-react";

const WASHING_MACHINE_D = "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5";

function GradientWashingMachine({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <SvgGradient id="bookingIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00C6B5" />
          <Stop offset="100%" stopColor="#006D96" />
        </SvgGradient>
      </Defs>
      {WASHING_MACHINE_D.split("M").map((seg, i) => {
        if (!seg) return null;
        return <Path key={i} d={`M${seg}`} stroke="url(#bookingIconGrad)" />;
      })}
    </Svg>
  );
}

const TIME_SLOTS = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

export default function BookingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: services, isLoading: loadingServices } = useListServices();
  const createBooking = useCreateBooking();

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const selectedSvc = services?.find(s => s.id === selectedService);
  const estimatedTotal = selectedSvc && weight ? parseFloat(weight) * selectedSvc.pricePerKg : 0;

  async function handleBook() {
    if (!selectedService) { Alert.alert("Select a service"); return; }
    if (!selectedDate) { Alert.alert("Select a date"); return; }
    if (!selectedTime) { Alert.alert("Select a time slot"); return; }
    if (!customer) { Alert.alert("Not logged in"); return; }

    const dateStr = `${selectedDate}T${selectedTime === "8:00 AM" ? "08:00" : selectedTime === "10:00 AM" ? "10:00" : selectedTime === "12:00 PM" ? "12:00" : selectedTime === "2:00 PM" ? "14:00" : selectedTime === "4:00 PM" ? "16:00" : "18:00"}:00`;

    try {
      await createBooking.mutateAsync({
        data: {
          customerId: customer.id,
          serviceId: selectedService,
          scheduledDate: new Date(dateStr).toISOString(),
          weightKg: weight ? parseFloat(weight) : undefined,
          notes: notes || undefined,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Booking Confirmed!", "Your laundry has been scheduled.", [
        { text: "Track Order", onPress: () => router.replace("/(tabs)/track") },
        { text: "OK", onPress: () => router.replace("/(tabs)/") },
      ]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Failed", "Could not create booking. Please try again.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Brand Bar */}
      <View style={[styles.brandBar, { paddingTop: topPad }]}>
        <View style={styles.brandRow}>
          <GradientWashingMachine size={28} />
          <Text style={styles.brandName}>
            <Text style={{ color: "#1a2a3a" }}>Glown</Text>
            <Text style={{ color: "#00C6B5" }}>Dry</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn]}
          onPress={() => router.push("/(tabs)/notifications")}
          testID="btn-notifications"
        >
          <FlaticonIcon name="bell" size={18} color="#1a2a3a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingTop: 8, paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
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

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Schedule Date</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <FlaticonIcon name="calendar" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedForeground}
          value={selectedDate}
          onChangeText={setSelectedDate}
          testID="input-date"
        />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Time Slot</Text>
      <View style={styles.timeGrid}>
        {TIME_SLOTS.map(slot => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.timeChip,
              { borderColor: selectedTime === slot ? colors.primary : colors.border, backgroundColor: selectedTime === slot ? colors.primary : colors.card },
            ]}
            onPress={() => setSelectedTime(slot)}
            testID={`btn-time-${slot}`}
          >
            <Text style={[styles.timeText, { color: selectedTime === slot ? "#fff" : colors.foreground }]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
          {createBooking.isPending ? "Booking…" : "Confirm Booking"}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Brand Bar
  brandBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: "#f7fafa",
    borderBottomWidth: 1.5, borderBottomColor: "#d4dce8",
  },
  brandRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  brandName: {
    fontSize: 18, fontFamily: "Inter_900Black",
    letterSpacing: 2,
  },
  notifBtn: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#e2e8f0",
  },

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
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  timeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
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
