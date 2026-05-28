import { FlaticonIcon } from "@/components/FlaticonIcon";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator, FlatList, Platform, RefreshControl,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import {
  useListNotifications, useMarkNotificationRead, useListBookings,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { BookingCard } from "@/components/BookingCard";
import { router } from "expo-router";

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const queryClient = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [tab, setTab] = useState<"notifications" | "history">("notifications");

  const { data: notifications, isLoading: loadingNotifs, refetch: refetchNotifs, isRefetching: isRefetchingNotifs } = useListNotifications(
    { customerId: customer?.id ?? 0 },
    { query: { enabled: !!customer?.id } },
  );

  const { data: bookings, isLoading: loadingBookings, refetch: refetchBookings } = useListBookings(
    { customerId: customer?.id },
    { query: { enabled: !!customer?.id } },
  );

  const markRead = useMarkNotificationRead();

  async function handleMarkRead(id: number) {
    await markRead.mutateAsync({ id });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({ customerId: customer?.id ?? 0 }) });
  }

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;
  const sortedNotifs = [...(notifications ?? [])].reverse();
  const sortedBookings = [...(bookings ?? [])].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          {tab === "notifications" ? "Notifications" : "History"}
          {tab === "notifications" && unreadCount > 0 && (
            <Text style={{ color: colors.primary }}> ({unreadCount})</Text>
          )}
        </Text>
        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          {(["notifications", "history"] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && { backgroundColor: colors.card }]}
              onPress={() => setTab(t)}
              testID={`tab-${t}`}
            >
              <Text style={[styles.tabText, { color: tab === t ? colors.foreground : colors.mutedForeground }]}>
                {t === "notifications" ? "Alerts" : "History"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === "notifications" ? (
        loadingNotifs ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={sortedNotifs}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notifCard,
                  { backgroundColor: item.isRead ? colors.card : colors.tealLight, borderColor: colors.border },
                ]}
                onPress={() => !item.isRead && handleMarkRead(item.id)}
                activeOpacity={0.75}
                testID={`notification-${item.id}`}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.notifIcon, { backgroundColor: colors.primary + "20" }]}>
                    <FlaticonIcon
  name="bell"
  size={16}
  color={colors.primary}
/>
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.notifMsg, { color: colors.mutedForeground }]}>{item.message}</Text>
                    <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                      {new Date(item.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  {!item.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
            refreshControl={
              <RefreshControl refreshing={isRefetchingNotifs} onRefresh={refetchNotifs} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <FlaticonIcon name="bell-off" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No notifications yet</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        loadingBookings ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={sortedBookings}
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
              <RefreshControl refreshing={false} onRefresh={refetchBookings} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <FlaticonIcon name="inbox" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No bookings yet</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 14 },
  tabs: {
    flexDirection: "row", borderRadius: 10, padding: 3,
  },
  tab: {
    flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center",
  },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 20, paddingTop: 12 },
  notifCard: {
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1,
  },
  notifRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  notifIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  notifContent: { flex: 1, gap: 3 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  notifMsg: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
