import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WASHING_MACHINE_D = "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
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
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, friction: 7 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn1Y, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(btn2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn2Y, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("@/assets/images/loginImage.png")}
        resizeMode="cover"
        style={[styles.container, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
      >
        <View style={styles.overlay} />

        <View style={styles.bottomSection}>
          <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], alignItems: "center" }}>
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Defs>
                <SvgGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00C6B5" />
                  <Stop offset="100%" stopColor="#006D96" />
                </SvgGradient>
              </Defs>
              {WASHING_MACHINE_D.split("M").map((seg, i) => {
                if (!seg) return null;
                return <Path key={i} d={`M${seg}`} stroke="url(#welcomeGrad)" />;
              })}
            </Svg>
          </Animated.View>
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
    alignItems: "center",
  },
  brand: {
    fontSize: 42, fontFamily: "Inter_700Bold",
    letterSpacing: 2, marginTop: 12, marginBottom: 8,
  },
  tagline: {
    fontSize: 16, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
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
