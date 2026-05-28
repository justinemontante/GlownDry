import { FlaticonIcon } from "@/components/FlaticonIcon";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, ImageBackground, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(40)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const btn1Opacity = useRef(new Animated.Value(0)).current;
  const btn1Y = useRef(new Animated.Value(30)).current;
  const btn2Opacity = useRef(new Animated.Value(0)).current;
  const btn2Y = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
        Animated.timing(iconOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(btn1Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(btn1Y, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btn2Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(btn2Y, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden />
      <ImageBackground
        source={require("@/assets/images/loginImage.png")}
        resizeMode="cover"
        style={[styles.container, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
      >
        <View style={styles.overlay} />

        <Animated.View style={{ position: "absolute", top: 60, left: 24, opacity: iconOpacity, transform: [{ scale: iconScale }] }}>
          <FlaticonIcon name="washing-machine" size={64} color="#fff" />
        </Animated.View>

        <View style={styles.bottomSection}>
          <Animated.Text style={[styles.brand, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
            <Text style={{ color: "#fff" }}>Glown</Text>
            <Text style={{ color: "#00C6B5" }}>Dry</Text>
          </Animated.Text>
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Smart Laundry Service Management System
          </Animated.Text>

          <View style={styles.buttons}>
            <Animated.View style={{ opacity: btn1Opacity, transform: [{ translateY: btn1Y }] }}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.85}
                testID="btn-sign-in"
              >
                <Text style={styles.btnPrimaryText}>Login</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ opacity: btn2Opacity, transform: [{ translateY: btn2Y }] }}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => router.push("/(auth)/register")}
                activeOpacity={0.85}
                testID="btn-get-started"
              >
                <Text style={styles.btnSecondaryText}>Get Started</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  brand: {
    fontSize: 42, fontFamily: "Inter_700Bold",
    letterSpacing: 2, marginBottom: 8,
  },
  tagline: {
    fontSize: 16, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 48,
  },
  buttons: { gap: 12 },
  btnPrimary: {
    backgroundColor: "#fff",
    paddingVertical: 16, borderRadius: 24,
    alignItems: "center",
    shadowColor: "#00C6B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#00C6B5" },
  btnSecondary: {
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)",
    paddingVertical: 16, borderRadius: 24,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
