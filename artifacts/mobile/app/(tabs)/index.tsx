import { FlaticonIcon } from "@/components/FlaticonIcon";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator, FlatList, Platform, RefreshControl,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { BookingCard } from "@/components/BookingCard";
import { useListBookings } from "@workspace/api-client-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: bookings, isLoading, refetch, isRefetching } = useListBookings(
    { customerId: customer?.id },
    { query: { enabled: !!customer?.id } },
  );

  const activeBooking = bookings?.find(b =>
    ["scheduled", "received", "in_progress", "ready"].includes(b.status),
  );
  const recentBookings = bookings?.slice().reverse().slice(0, 10) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {getGreeting()},
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {customer?.fullName?.split(" ")[0] ?? "there"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/notifications")}
          testID="btn-notifications"
        >
          <FlaticonIcon name="bell" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {activeBooking && (
        <View style={[styles.activeCard, { backgroundColor: colors.primary }]}>
          <View style={styles.activeCardRow}>
            <View>
              <Text style={styles.activeLabel}>Active Order</Text>
              <Text style={styles.activeOrder}>Order #{activeBooking.id}</Text>
              <Text style={styles.activeStatus}>{activeBooking.status.replace("_", " ").toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => router.push("/(tabs)/track")}
              testID="btn-track-order"
            >
              <FlaticonIcon name="map-pin" size={16} color={colors.primary} />
              <Text style={[styles.trackBtnText, { color: colors.primary }]}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.quickActions}>
        {[
          { icon: "plus-circle" as const, label: "Book Now", route: "/(tabs)/booking" as const },
          { icon: "package" as const, label: "Track Order", route: "/(tabs)/track" as const },
          { icon: "bell" as const, label: "Alerts", route: "/(tabs)/notifications" as const },
          { icon: "user" as const, label: "Profile", route: "/(tabs)/profile" as const },
        ].map(a => (
          <TouchableOpacity
            key={a.label}
            style={[styles.quickItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(a.route)}
            activeOpacity={0.7}
            testID={`btn-quick-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.tealLight }]}>
              <FlaticonIcon name={a.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Bookings</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={recentBookings}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <BookingCard
              id={item.id}
              serviceName={item.serviceName}
              scheduledDate={String(item.scheduledDate)}
              status={item.status}
              totalAmount={item.totalAmount}
              onPress={() => router.push("/(tabs)/track")}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <FlaticonIcon name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No bookings yet</Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/booking")}
                testID="btn-book-first"
              >
                <Text style={styles.emptyBtnText}>Book your first laundry</Text>
              </TouchableOpacity>
            </View>
          }
          scrollEnabled={!!(recentBookings.length > 0)}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPad + 90 }]}
        onPress={() => router.push("/(tabs)/booking")}
        activeOpacity={0.85}
        testID="fab-book"
      >
        <FlaticonIcon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 16,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  name: { fontSize: 24, fontFamily: "Inter_700Bold" },
  notifBtn: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  activeCard: {
    marginHorizontal: 20, borderRadius: 16, padding: 18, marginBottom: 20,
  },
  activeCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  activeLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  activeOrder: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  activeStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)", marginTop: 4 },
  trackBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  trackBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  quickActions: {
    flexDirection: "row", paddingHorizontal: 20,
    gap: 10, marginBottom: 24,
  },
  quickItem: {
    flex: 1, alignItems: "center", gap: 8,
    padding: 12, borderRadius: 14, borderWidth: 1,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  quickLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  empty: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  emptyBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, marginTop: 4,
  },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  fab: {
    position: "absolute", right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
});
