import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type BookingStatus = "scheduled" | "received" | "in_progress" | "ready" | "claimed";

interface BookingCardProps {
  id: number;
  serviceName?: string | null;
  scheduledDate: string;
  status: string;
  totalAmount: number;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: string }> = {
  scheduled: { label: "Scheduled", color: "#3b82f6", icon: "calendar" },
  received: { label: "Received", color: "#8b5cf6", icon: "inbox" },
  in_progress: { label: "In Progress", color: "#f59e0b", icon: "loader" },
  ready: { label: "Ready", color: "#22c55e", icon: "check-circle" },
  claimed: { label: "Claimed", color: "#6b7280", icon: "archive" },
};

export function BookingCard({ id, serviceName, scheduledDate, status, totalAmount, onPress }: BookingCardProps) {
  const colors = useColors();
  const cfg = STATUS_CONFIG[status as BookingStatus] ?? STATUS_CONFIG.scheduled;
  const date = new Date(scheduledDate).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
      testID={`booking-card-${id}`}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.orderNum, { color: colors.mutedForeground }]}>Order #{id}</Text>
          <Text style={[styles.service, { color: colors.foreground }]}>{serviceName ?? "Laundry Service"}</Text>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, { backgroundColor: cfg.color + "20" }]}>
            <Feather name={cfg.icon as keyof typeof Feather.glyphMap} size={12} color={cfg.color} />
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={[styles.amount, { color: colors.primary }]}>
            ₱{totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  left: { flex: 1, gap: 3 },
  right: { alignItems: "flex-end", gap: 8 },
  orderNum: { fontSize: 11, fontFamily: "Inter_400Regular" },
  service: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  amount: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
