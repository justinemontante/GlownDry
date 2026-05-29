import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Redirect, Tabs, router } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { FlaticonIcon } from "@/components/FlaticonIcon";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

function ProfileHeader() {
  const { customer } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <View style={[headerStyles.bar, { paddingTop: insets.top + 4 }]}>
      <View style={headerStyles.right}>
        <TouchableOpacity style={headerStyles.notifBtn} onPress={() => router.push("/(tabs)/notifications")} testID="btn-notifications">
          <FlaticonIcon name="bell" size={18} color="#1a2a3a" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          {customer?.profileImage ? (
            <Image source={{ uri: customer.profileImage }} style={headerStyles.profilePic} />
          ) : (
            <View style={[headerStyles.profilePic, { backgroundColor: "#0A9C8C" }]}>
              <Text style={headerStyles.profileInitial}>
                {(customer?.fullName ?? "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  bar: {
    backgroundColor: "#fff",
    borderBottomWidth: 1.5, borderBottomColor: "#d4dce8",
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: "flex-end",
  },
  right: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  notifBtn: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  profilePic: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  profileInitial: {
    fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff",
  },
});

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="booking">
        <Icon sf={{ default: "calendar", selected: "calendar" }} />
        <Label>Book</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="track">
        <Icon sf={{ default: "shippingbox", selected: "shippingbox.fill" }} />
        <Label>Track</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <Icon sf={{ default: "bell", selected: "bell.fill" }} />
        <Label>Alerts</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const tabScreens: {
    name: string;
    title: string;
    sfSymbol: string;
    featherIcon: string;
  }[] = [
    { name: "index", title: "Home", sfSymbol: "house", featherIcon: "home" },
    { name: "booking", title: "Book", sfSymbol: "calendar", featherIcon: "calendar" },
    { name: "track", title: "Track", sfSymbol: "shippingbox", featherIcon: "package" },
    { name: "notifications", title: "Alerts", sfSymbol: "bell", featherIcon: "bell" },
    { name: "profile", title: "Profile", sfSymbol: "person", featherIcon: "user" },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 4,
        },
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 0,
          elevation: isWeb ? 0 : 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "visible",
          ...(isWeb ? { height: 84 } : { height: 70 }),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
      }}
    >
      {tabScreens.map(screen => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            headerShown: screen.name !== "index",
            header: () => <ProfileHeader />,
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name={screen.sfSymbol as any} tintColor={color} size={24} />
              ) : (
                                <FlaticonIcon name={screen.featherIcon} size={22} color={color} />
              ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  const { customer, isLoading } = useAuth();

  if (!isLoading && !customer) {
    return <Redirect href="/(auth)/" />;
  }

  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
