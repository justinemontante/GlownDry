import { FlaticonIcon } from "@/components/FlaticonIcon";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator, Platform, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { StepTracker } from "@/components/StepTracker";
import { useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";

const WASHING_MACHINE_D = "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5";

function GradientWashingMachine({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <SvgGradient id="trackIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00C6B5" />
          <Stop offset="100%" stopColor="#006D96" />
        </SvgGradient>
      </Defs>
      {WASHING_MACHINE_D.split("M").map((seg, i) => {
        if (!seg) return null;
        return <Path key={i} d={`M${seg}`} stroke="url(#trackIconGrad)" />;
      })}
    </Svg>
  );
}

export default function TrackScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: bookings, isLoading, refetch, isRefetching } = useListBookings(
    { customerId: customer?.id },
    { query: { queryKey: getListBookingsQueryKey({ customerId: customer?.id }), enabled: !!customer?.id } },
  );

  const activeBooking = bookings
    ?.slice()
    .reverse()
    .find(b => ["scheduled", "received", "in_progress", "ready"].includes(b.status))
    ?? bookings?.[bookings.length - 1];

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
        contentContainerStyle={[styles.container, { paddingTop: 8, paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Order Tracker</Text>

      {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}

      {!isLoading && !activeBooking && (
        <View style={styles.empty}>
          <FlaticonIcon name="package" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No active orders</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Book a laundry service to track your order here
          </Text>
        </View>
      )}

      {activeBooking && (
        <>
          <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.orderRow}>
              <View>
                <Text style={[styles.orderLabel, { color: colors.mutedForeground }]}>Order Number</Text>
                <Text style={[styles.orderNum, { color: colors.foreground }]}>#{activeBooking.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.tealLight }]}>
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  {activeBooking.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailsGrid}>
              {[
                { label: "Service", value: activeBooking.serviceName ?? "—" },
                { label: "Total", value: `₱${activeBooking.totalAmount.toFixed(2)}` },
                {
                  label: "Scheduled",
                  value: new Date(activeBooking.scheduledDate).toLocaleDateString("en-PH", {
                    month: "short", day: "numeric",
                  }),
                },
                { label: "Weight", value: activeBooking.weightKg ? `${activeBooking.weightKg} kg` : "—" },
              ].map(d => (
                <View key={d.label} style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{d.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]}>{d.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.trackerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.trackerTitle, { color: colors.foreground }]}>Progress</Text>
            <StepTracker currentStatus={activeBooking.status} />
          </View>

          {activeBooking.notes && (
            <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.notesLabel, { color: colors.mutedForeground }]}>Notes</Text>
              <Text style={[styles.notesText, { color: colors.foreground }]}>{activeBooking.notes}</Text>
            </View>
          )}
        </>
      )}
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
    borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
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

  container: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 20 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
  orderCard: {
    borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  orderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  orderNum: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  divider: { height: 1, marginVertical: 14 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  detailItem: { width: "45%" },
  detailLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.4 },
  detailValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 3 },
  trackerCard: {
    borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14,
  },
  trackerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 16 },
  notesCard: { borderRadius: 16, padding: 18, borderWidth: 1 },
  notesLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  notesText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
});
