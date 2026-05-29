import { FlaticonIcon } from "@/components/FlaticonIcon";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, Modal, Platform, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { StepTracker } from "@/components/StepTracker";
import { useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Scheduled", color: "#3b82f6" },
  received: { label: "Received", color: "#8b5cf6" },
  in_progress: { label: "In Progress", color: "#f59e0b" },
  ready: { label: "Ready for Pickup", color: "#22c55e" },
  claimed: { label: "Claimed", color: "#6b7280" },
};

function getEstimatedReady(scheduledDate: string) {
  const d = new Date(scheduledDate);
  d.setHours(d.getHours() + 24);
  return d;
}

function ReceiptModal({ booking, visible, onClose }: { booking: any; visible: boolean; onClose: () => void }) {
  const colors = useColors();
  if (!booking) return null;

  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.scheduled;
  const readyDate = getEstimatedReady(booking.scheduledDate);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={receiptStyles.overlay}>
        <TouchableOpacity style={receiptStyles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[receiptStyles.sheet, { backgroundColor: "#fff" }]}>
          <View style={receiptStyles.handleRow}>
            <View style={receiptStyles.handle} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Receipt Header */}
            <View style={[receiptStyles.receiptHeader, { backgroundColor: colors.primary }]}>
              <View style={receiptStyles.receiptHeaderRow}>
                <View>
                  <Text style={receiptStyles.receiptBrand}>GLOWNDRY</Text>
                  <Text style={receiptStyles.receiptSub}>Official Laundry Receipt</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={receiptStyles.closeBtn}>
                  <FlaticonIcon name="x" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Receipt Body */}
            <View style={receiptStyles.receiptBody}>
              <View style={receiptStyles.receiptInfoRow}>
                <View>
                  <Text style={receiptStyles.receiptMetaLabel}>Order Number</Text>
                  <Text style={receiptStyles.receiptMetaValue}>#{booking.id}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={receiptStyles.receiptMetaLabel}>Date</Text>
                  <Text style={receiptStyles.receiptMetaValue}>
                    {new Date(booking.scheduledDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
              </View>

              <View style={receiptStyles.receiptDividerContainer}>
                <View style={[receiptStyles.receiptDivider, { borderColor: colors.border }]} />
              </View>

              <View style={receiptStyles.receiptRow}>
                <Text style={receiptStyles.receiptLabel}>Service Type</Text>
                <Text style={receiptStyles.receiptValue}>{booking.serviceName ?? "Laundry Service"}</Text>
              </View>
              <View style={receiptStyles.receiptRow}>
                <Text style={receiptStyles.receiptLabel}>Estimated Weight</Text>
                <Text style={receiptStyles.receiptValue}>{booking.weightKg ? `${booking.weightKg} kg` : "—"}</Text>
              </View>
              <View style={receiptStyles.receiptRow}>
                <Text style={receiptStyles.receiptLabel}>Current Status</Text>
                <View style={[receiptStyles.statusBadge, { backgroundColor: statusCfg.color + "15" }]}>
                  <Text style={[receiptStyles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
              </View>

              <View style={receiptStyles.receiptDividerContainer}>
                <View style={[receiptStyles.receiptDivider, { borderColor: colors.border }]} />
              </View>

              <View style={receiptStyles.receiptRow}>
                <Text style={receiptStyles.receiptLabel}>Total Amount Due</Text>
                <Text style={[receiptStyles.receiptAmount, { color: colors.primary }]}>
                  ₱{booking.totalAmount?.toFixed(2) ?? "0.00"}
                </Text>
              </View>

              <View style={receiptStyles.receiptDividerContainer}>
                <View style={[receiptStyles.receiptDivider, { borderColor: colors.border }]} />
              </View>

              <View style={receiptStyles.receiptSchedule}>
                <Text style={receiptStyles.scheduleTitle}>Laundry Schedule</Text>
                <View style={receiptStyles.scheduleRow}>
                  <FlaticonIcon name="calendar" size={14} color={colors.mutedForeground} />
                  <Text style={receiptStyles.scheduleText}>
                    Drop off: {new Date(booking.scheduledDate).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
                {booking.status !== "claimed" && (
                  <View style={receiptStyles.scheduleRow}>
                    <FlaticonIcon name="clock" size={14} color="#22c55e" />
                    <Text style={[receiptStyles.scheduleText, { color: "#22c55e" }]}>
                      Est. Ready: {readyDate.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                )}
              </View>

              <View style={receiptStyles.barcodeContainer}>
                <FlaticonIcon name="package" size={40} color={colors.border} />
                <Text style={receiptStyles.barcodeText}>GLN-{booking.id}-{new Date(booking.scheduledDate).getTime()}</Text>
              </View>

              <View style={receiptStyles.receiptFooter}>
                <Text style={receiptStyles.receiptFooterText}>Thank you for choosing GlownDry!</Text>
                <Text style={receiptStyles.receiptFooterSub}>
                  This is a digital receipt for your laundry service.
                </Text>
                <TouchableOpacity
                  style={[receiptStyles.doneBtn, { backgroundColor: colors.primary }]}
                  onPress={onClose}
                >
                  <Text style={receiptStyles.doneBtnText}>Close Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function TrackScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [manualRefreshing, setManualRefreshing] = useState(false);
  const { data: bookings, isLoading, refetch } = useListBookings(
    { customerId: customer?.id },
    { query: { enabled: !!customer?.id } },
  );

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const activeBooking = bookings
    ?.slice()
    .reverse()
    .find(b => ["scheduled", "received", "in_progress", "ready"].includes(b.status))
    ?? bookings?.[bookings.length - 1];

  const readyDate = activeBooking ? getEstimatedReady(activeBooking.scheduledDate) : null;

  function openReceipt(b: any) {
    setSelectedBooking(b);
    setReceiptOpen(true);
  }

  const onRefresh = async () => {
    setManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  };

  const statusCfg = activeBooking ? (STATUS_CONFIG[activeBooking.status] ?? STATUS_CONFIG.scheduled) : null;

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
        contentContainerStyle={[styles.container, { paddingTop: 8, paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={manualRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
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

        {activeBooking && statusCfg && (
          <>
            {/* Order Card */}
            <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.orderRow}>
                <View>
                  <Text style={[styles.orderLabel, { color: colors.mutedForeground }]}>Order Number</Text>
                  <Text style={[styles.orderNum, { color: colors.foreground }]}>#{activeBooking.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + "15" }]}>
                  <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.detailsGrid}>
                {[
                  { label: "Service", value: activeBooking.serviceName ?? "—" },
                  { label: "Total", value: `₱${activeBooking.totalAmount?.toFixed(2) ?? "0.00"}` },
                  {
                    label: "Drop off",
                    value: new Date(activeBooking.scheduledDate).toLocaleDateString("en-PH", {
                      month: "short", day: "numeric", year: "numeric",
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

            {/* Pickup Schedule Card */}
            {activeBooking.status !== "claimed" && (
              <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.scheduleCardHeader}>
                  <Text style={[styles.scheduleCardTitle, { color: colors.foreground }]}>Pickup Schedule</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.scheduleRow}>
                  <View style={[styles.scheduleIconWrap, { backgroundColor: colors.tealLight }]}>
                    <FlaticonIcon name="calendar" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.scheduleContent}>
                    <Text style={[styles.scheduleLabel, { color: colors.mutedForeground }]}>Drop Off</Text>
                    <Text style={[styles.scheduleValue, { color: colors.foreground }]}>
                      {new Date(activeBooking.scheduledDate).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                </View>
                {activeBooking.status === "ready" ? (
                  <View style={styles.scheduleRow}>
                    <View style={[styles.scheduleIconWrap, { backgroundColor: "#dcfce7" }]}>
                      <FlaticonIcon name="check-circle" size={18} color="#22c55e" />
                    </View>
                    <View style={styles.scheduleContent}>
                      <Text style={[styles.scheduleLabel, { color: "#22c55e" }]}>Ready for Pickup!</Text>
                      <Text style={[styles.scheduleValue, { color: "#22c55e" }]}>
                        Your laundry is ready. Please pick up at our store.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.scheduleRow}>
                    <View style={[styles.scheduleIconWrap, { backgroundColor: "#fef3c7" }]}>
                      <FlaticonIcon name="clock" size={18} color="#f59e0b" />
                    </View>
                    <View style={styles.scheduleContent}>
                      <Text style={[styles.scheduleLabel, { color: colors.mutedForeground }]}>Est. Ready for Pickup</Text>
                      <Text style={[styles.scheduleValue, { color: colors.foreground }]}>
                        {readyDate?.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Progress Tracker */}
            <View style={[styles.trackerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.trackerTitle, { color: colors.foreground }]}>Progress</Text>
              <StepTracker currentStatus={activeBooking.status} />
            </View>

            {/* Receipt Button */}
            <TouchableOpacity
              style={[styles.receiptBtn, { backgroundColor: colors.primary }]}
              onPress={() => openReceipt(activeBooking)}
              activeOpacity={0.85}
            >
              <FlaticonIcon name="receipt" size={18} color="#fff" />
              <Text style={styles.receiptBtnText}>View Receipt</Text>
            </TouchableOpacity>

            {/* Notes */}
            {activeBooking.notes && (
              <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.notesLabel, { color: colors.mutedForeground }]}>Notes</Text>
                <Text style={[styles.notesText, { color: colors.foreground }]}>{activeBooking.notes}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {selectedBooking && (
        <ReceiptModal
          visible={receiptOpen}
          booking={selectedBooking}
          onClose={() => setReceiptOpen(false)}
        />
      )}
    </View>
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
  statusText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginVertical: 14 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  detailItem: { width: "45%" },
  detailLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.4 },
  detailValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 3 },
  trackerCard: {
    borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14,
  },
  trackerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 16 },
  scheduleCard: {
    borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  scheduleCardHeader: { marginBottom: 12 },
  scheduleCardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  scheduleRow: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10,
  },
  scheduleIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  scheduleContent: { flex: 1 },
  scheduleLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.4 },
  scheduleValue: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 2 },
  receiptBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 14,
  },
  receiptBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  notesCard: {
    borderRadius: 16, padding: 18, borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  notesLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  notesText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
});

const receiptStyles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    maxHeight: "92%",
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 20,
  },
  handleRow: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 36, height: 5, borderRadius: 2.5, backgroundColor: "#e2e8f0" },
  receiptHeader: {
    padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32,
  },
  receiptHeaderRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  receiptBrand: { fontSize: 24, fontFamily: "Inter_900Black", color: "#fff", letterSpacing: 2 },
  receiptSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  receiptBody: { padding: 24 },
  receiptInfoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  receiptMetaLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 },
  receiptMetaValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1e293b", marginTop: 4 },
  receiptDividerContainer: { marginVertical: 20 },
  receiptDivider: { height: 1, borderStyle: "dashed", borderWidth: 1, borderRadius: 1 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  receiptLabel: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#64748b" },
  receiptValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1e293b" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  receiptAmount: { fontSize: 24, fontFamily: "Inter_800ExtraBold" },
  receiptSchedule: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 18, marginTop: 4 },
  scheduleTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1e293b", marginBottom: 12 },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  scheduleText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#334155" },
  barcodeContainer: { alignItems: "center", marginTop: 32, opacity: 0.5 },
  barcodeText: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94a3b8", marginTop: 8, letterSpacing: 2 },
  receiptFooter: { alignItems: "center", marginTop: 32, paddingBottom: 20 },
  receiptFooterText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1e293b" },
  receiptFooterSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748b", marginTop: 6, textAlign: "center" },
  doneBtn: { width: "100%", paddingVertical: 16, borderRadius: 16, marginTop: 24, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
