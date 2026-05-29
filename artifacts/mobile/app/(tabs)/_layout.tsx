import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Redirect, Tabs, router } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { FlaticonIcon } from "@/components/FlaticonIcon";
import { ProfileModal } from "@/components/ProfileModal";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const WASHING_MACHINE_D = "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5";

function GradientWashingMachine({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <SvgGradient id="headerIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00C6B5" />
          <Stop offset="100%" stopColor="#006D96" />
        </SvgGradient>
      </Defs>
      {WASHING_MACHINE_D.split("M").map((seg, i) => {
        if (!seg) return null;
        return <Path key={i} d={`M${seg}`} stroke="url(#headerIconGrad)" />;
      })}
    </Svg>
  );
}

function BrandHeader() {
  const { customer } = useAuth();
  const insets = useSafeAreaInsets();
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <>
      <LinearGradient
        colors={["#EBF3F6", "#E0EDE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[brandStyles.bar, { paddingTop: insets.top }]}
      >
        <View style={brandStyles.row}>
          <View style={brandStyles.left}>
            <GradientWashingMachine size={28} />
            <Text style={brandStyles.name}>
              <Text style={{ color: "#1a2a3a" }}>Glown</Text>
              <Text style={{ color: "#00C6B5" }}>Dry</Text>
            </Text>
          </View>
          <View style={brandStyles.right}>
            <TouchableOpacity style={brandStyles.notifBtn} onPress={() => router.push("/(tabs)/notifications")} testID="btn-notifications">
              <FlaticonIcon name="bell" size={18} color="#1a2a3a" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setProfileOpen(true)}>
              {customer?.profileImage ? (
                <Image source={{ uri: customer.profileImage }} style={brandStyles.profilePic} />
              ) : (
                <View style={[brandStyles.profilePic, { backgroundColor: "#0A9C8C" }]}>
                  <Text style={brandStyles.profileInitial}>
                    {(customer?.fullName ?? "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <ProfileModal visible={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}

const brandStyles = StyleSheet.create({
  bar: {
    justifyContent: "flex-end", paddingBottom: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1.5, borderBottomColor: "#d4dce8",
  },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  left: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  name: {
    fontSize: 18, fontFamily: "Inter_900Black", letterSpacing: 2,
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
      <NativeTabs.Trigger name="orders">
        <Icon sf={{ default: "shippingbox", selected: "shippingbox.fill" }} />
        <Label>Orders</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <Icon sf={{ default: "bell", selected: "bell.fill" }} />
        <Label>Alerts</Label>
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
    { name: "orders", title: "Orders", sfSymbol: "shippingbox", featherIcon: "package" },
    { name: "notifications", title: "Alerts", sfSymbol: "bell", featherIcon: "bell" },
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
            header: () => <BrandHeader />,
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
