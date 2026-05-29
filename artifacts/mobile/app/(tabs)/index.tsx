import { FlaticonIcon } from "@/components/FlaticonIcon";
import { Skeleton } from "@/components/Skeleton";
import { router } from "expo-router";
import React, { useState, memo } from "react";
import {
  Dimensions, FlatList, Image, Modal, Platform,
  RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { BookingCard } from "@/components/BookingCard";
import { useListBookings, getListBookingsQueryKey, useListServices } from "@workspace/api-client-react";

const { width: SCREEN_W } = Dimensions.get("window");

const WASHING_MACHINE_D = "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5";

const SERVICE_ICONS: Record<string, string> = {
  "wash": "washing-machine",
  "dry": "wind",
  "express": "clock",
  "delicate": "star",
  "regular": "washing-machine",
};

function GradientWashingMachine({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <SvgGradient id="homeIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00C6B5" />
          <Stop offset="100%" stopColor="#006D96" />
        </SvgGradient>
      </Defs>
      {WASHING_MACHINE_D.split("M").map((seg, i) => {
        if (!seg) return null;
        return <Path key={i} d={`M${seg}`} stroke="url(#homeIconGrad)" />;
      })}
    </Svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getServiceIcon(name: string) {
  const lower = name.toLowerCase();
  const key = Object.keys(SERVICE_ICONS).find(k => lower.includes(k));
  return SERVICE_ICONS[key ?? "washing-machine"];
}

const ServicesGallery = memo(function ServicesGallery({ services, colors, onServicePress }: { services: any[]; colors: any; onServicePress: (s: any) => void }) {
  return (
    <View style={styles.servicesWrapper}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>Our Services</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/booking")}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesContainer}>
        {services.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onServicePress(s)}
            activeOpacity={0.85}
          >
            {s.serviceImage ? (
              <Image source={{ uri: s.serviceImage }} style={styles.serviceImage} />
            ) : (
              <View style={[styles.serviceIconWrap, { backgroundColor: colors.tealLight }]}>
                <FlaticonIcon name={getServiceIcon(s.name)} size={24} color={colors.primary} />
              </View>
            )}
            <Text style={styles.serviceName}>{s.name}</Text>
            <Text style={[styles.serviceDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{s.description}</Text>
            <View style={styles.servicePriceRow}>
              <Text style={[styles.servicePrice, { color: colors.primary }]}>₱{s.pricePerKg}/kg</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const { data: bookings, isLoading, refetch } = useListBookings(
    { customerId: customer?.id },
    { query: { queryKey: getListBookingsQueryKey({ customerId: customer?.id }), enabled: !!customer?.id, refetchInterval: 1000, staleTime: 500 } },
  );

  const { data: services } = useListServices({ query: { refetchInterval: 1000, staleTime: 500 } });

  const activeBooking = bookings?.find(b =>
    ["scheduled", "received", "in_progress", "ready"].includes(b.status),
  );
  const recentBookings = bookings?.slice().reverse().slice(0, 10) ?? [];

  const firstName = customer?.fullName?.split(" ")[0] ?? "there";

  function ListHeader() {
    return (
      <View>
        {/* Hero Section */}
        <LinearGradient
          colors={["#ffffff", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.heroSection, { paddingTop: 16 }]}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{getGreeting()}</Text>
              </View>
              <Text style={styles.heroTitle}>Hey, <Text style={styles.heroName}>{firstName}</Text></Text>
              <Text style={styles.heroSub}>Ready to freshen up your laundry?</Text>
            </View>
            <Image source={require("@/assets/images/imageGreeting.png")} style={styles.heroImage} />
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{bookings?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDot} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{activeBooking ? 1 : 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDot} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#4ade80" }]}>
                {bookings?.filter(b => b.status === "completed").length ?? 0}
              </Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </LinearGradient>

        <ServicesGallery services={services ?? []} colors={colors} onServicePress={setSelectedService} />

        {/* Active Order */}
        {activeBooking && (
          <View style={styles.activeSection}>
            <View style={[styles.activeCard, { backgroundColor: colors.primary }]}>
              <View style={styles.activeCardRow}>
                <View>
                  <Text style={styles.activeLabel}>Active Order</Text>
                  <Text style={styles.activeOrder}>Order #{activeBooking.id}</Text>
                  <View style={styles.activeStatusBadge}>
                    <View style={styles.activeStatusDot} />
                    <Text style={styles.activeStatus}>{activeBooking.status.replace(/_/g, " ").toUpperCase()}</Text>
                  </View>
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
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.quickRow}>
            {[
              { icon: "plus-circle" as const, label: "Book Now", route: "/(tabs)/booking" as const },
              { icon: "package" as const, label: "Track", route: "/(tabs)/track" as const },
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
                <View style={[styles.quickIconWrap, { backgroundColor: colors.tealLight }]}>
                  <FlaticonIcon name={a.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.foreground }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Bookings Header */}
        <Text style={styles.recentHeader}>Recent Bookings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#EBF3F6", "#E0EDE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Brand Bar */}
      <View style={[styles.brandBar, { paddingTop: topPad }]}>
        <View style={styles.brandRow}>
          <GradientWashingMachine size={28} />
          <Text style={styles.brandName}>
            <Text style={{ color: "#1a2a3a" }}>Glown</Text>
            <Text style={{ color: "#00C6B5" }}>Dry</Text>
          </Text>
        </View>
        <View style={styles.brandRight}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/(tabs)/notifications")}
            testID="btn-notifications"
          >
            <FlaticonIcon name="bell" size={18} color="#1a2a3a" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            {customer?.profileImage ? (
              <Image source={{ uri: customer.profileImage }} style={styles.profilePic} />
            ) : (
              <View style={[styles.profilePic, { backgroundColor: "#0A9C8C" }]}>
                <Text style={styles.profileInitial}>
                  {(customer?.fullName ?? "?").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Skeleton height={180} borderRadius={24} style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <Skeleton height={140} width={SCREEN_W * 0.55} borderRadius={16} />
            <Skeleton height={140} width={SCREEN_W * 0.55} borderRadius={16} />
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center", gap: 8 }}>
                <Skeleton height={44} width={44} borderRadius={12} />
                <Skeleton height={11} width={44} borderRadius={6} />
              </View>
            ))}
          </View>
          <Skeleton height={16} width={140} borderRadius={6} style={{ marginBottom: 12 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Skeleton height={40} width={40} borderRadius={20} />
              <View style={{ flex: 1, gap: 4 }}>
                <Skeleton height={14} width={160} borderRadius={6} />
                <Skeleton height={11} width={100} borderRadius={6} />
              </View>
              <Skeleton height={14} width={60} borderRadius={6} />
            </View>
          ))}
        </View>
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
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
          refreshControl={
            <RefreshControl
              refreshing={manualRefreshing}
              onRefresh={() => {
                setManualRefreshing(true);
                refetch().finally(() => setManualRefreshing(false));
              }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <FlaticonIcon name="inbox" size={40} color="#8a94a6" />
              <Text style={styles.emptyText}>No bookings yet</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/(tabs)/booking")}
                testID="btn-book-first"
              >
                <Text style={styles.emptyBtnText}>Book your first laundry</Text>
              </TouchableOpacity>
            </View>
          }
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

      {/* Service Detail Modal */}
      <Modal visible={!!selectedService} transparent animationType="fade" onRequestClose={() => setSelectedService(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedService && (
              <>
                {selectedService.serviceImage ? (
                  <Image source={{ uri: selectedService.serviceImage }} style={styles.modalImage} />
                ) : (
                  <View style={[styles.modalIconWrap, { backgroundColor: colors.tealLight }]}>
                    <FlaticonIcon name={getServiceIcon(selectedService.name)} size={48} color={colors.primary} />
                  </View>
                )}
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>{selectedService.name}</Text>
                <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>{selectedService.description}</Text>
                <Text style={[styles.modalPrice, { color: colors.primary }]}>₱{selectedService.pricePerKg} / kg</Text>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={() => { setSelectedService(null); router.push("/(tabs)/booking"); }}
                >
                  <Text style={styles.modalBtnText}>Book Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedService(null)}>
                  <Text style={[styles.modalCloseText, { color: colors.mutedForeground }]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
    brandBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, paddingBottom: 8,
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
  brandRight: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  profilePic: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  profileInitial: {
    fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff",
  },

  // Hero Section
  heroSection: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 6,
    padding: 16, borderRadius: 24,
    shadowColor: "#0A9C8C", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  heroRow: {
    flexDirection: "row", alignItems: "center",
  },
  heroLeft: {
    flex: 1,
  },
  heroImage: {
    width: 100, height: 100, borderRadius: 50,
    marginLeft: 12, resizeMode: "contain",
  },
  heroBadge: {
    alignSelf: "flex-start", backgroundColor: "rgba(10,156,140,0.12)",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    color: "#0A9C8C", letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 24, fontFamily: "Inter_700Bold",
    color: "#1a2a3a",
  },
  heroName: {
    color: "#0A9C8C",
  },
  heroSub: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "rgba(26,42,58,0.6)", marginTop: 2,
  },
  heroDivider: {
    height: 1, backgroundColor: "rgba(10,156,140,0.15)",
    marginVertical: 12,
  },
  heroStats: {
    flexDirection: "row", alignItems: "center",
  },
  statItem: {
    flex: 1, alignItems: "center",
  },
  statNumber: {
    fontSize: 20, fontFamily: "Inter_900Black",
    color: "#1a2a3a",
  },
  statLabel: {
    fontSize: 10, fontFamily: "Inter_500Medium",
    color: "rgba(26,42,58,0.55)", marginTop: 1,
  },
  statDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: "rgba(10,156,140,0.3)",
  },

  // Services Gallery
  servicesWrapper: {
    paddingTop: 8, paddingBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16, fontFamily: "Inter_700Bold",
    color: "#1a2a3a",
  },
  seeAll: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#00C6B5",
  },
  servicesContainer: {
    paddingHorizontal: 16, gap: 12,
  },
  serviceCard: {
    width: SCREEN_W * 0.55, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: "#e2e8f0",
  },
  serviceIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  serviceImage: {
    width: "100%", height: 100, borderRadius: 12,
    marginBottom: 10, resizeMode: "contain",
  },
  serviceName: {
    fontSize: 15, fontFamily: "Inter_900Black", fontWeight: "900", color: "#000",
  },
  serviceDesc: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    marginTop: 2, lineHeight: 14,
  },
  servicePriceRow: {
    flexDirection: "row", marginTop: 6,
  },
  servicePrice: {
    fontSize: 14, fontFamily: "Inter_800ExtraBold",
  },

  // Active Order
  activeSection: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  activeCard: {
    borderRadius: 18, padding: 18,
  },
  activeCardRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  activeLabel: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  activeOrder: {
    fontSize: 18, fontFamily: "Inter_700Bold",
    color: "#fff", marginTop: 2,
  },
  activeStatusBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6,
  },
  activeStatusDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  activeStatus: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.85)",
  },
  trackBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  trackBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Quick Actions
  quickSection: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  quickRow: {
    flexDirection: "row", gap: 10, marginTop: 12,
  },
  quickItem: {
    flex: 1, alignItems: "center", gap: 8,
    padding: 12, borderRadius: 14, borderWidth: 1,
  },
  quickIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  quickLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },

  // Recent Bookings
  recentHeader: {
    fontSize: 16, fontFamily: "Inter_700Bold",
    color: "#1a2a3a", paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 8,
  },

  // Empty state
  empty: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#8a94a6" },
  emptyBtn: {
    backgroundColor: "#00C6B5",
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, marginTop: 4,
  },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  modalContent: {
    width: "100%", borderRadius: 24, padding: 28,
    alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  modalImage: {
    width: "100%", height: 200, borderRadius: 16,
    marginBottom: 20, resizeMode: "contain",
  },
  modalIconWrap: {
    width: 88, height: 88, borderRadius: 24,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 20, marginBottom: 16,
  },
  modalPrice: {
    fontSize: 24, fontFamily: "Inter_800ExtraBold", marginBottom: 24,
  },
  modalBtn: {
    width: "100%", paddingVertical: 16, borderRadius: 16,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff",
  },
  modalClose: {
    marginTop: 12, paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 14, fontFamily: "Inter_500Medium",
  },

  // FAB
  fab: {
    position: "absolute", right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
});
