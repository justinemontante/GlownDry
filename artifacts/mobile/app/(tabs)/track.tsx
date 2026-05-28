import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator, Platform, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { StepTracker } from "@/components/StepTracker";
import { useListBookings } from "@workspace/api-client-react";

export default function TrackScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: bookings, isLoading, refetch, isRefetching } = useListBookings(
    { customerId: customer?.id },
    { query: { enabled: !!customer?.id } },
  );

  const activeBooking = bookings
    ?.slice()
    .reverse()
    .find(b => ["scheduled", "received", "in_progress", "ready"].includes(b.status))
    ?? bookings?.[bookings.length - 1];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Order Tracker</Text>

      {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}

      {!isLoading && !activeBooking && (
        <View style={styles.empty}>
          <Feather name="package" size={48} color={colors.mutedForeground} />
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
  );
}

const styles = StyleSheet.create({
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
