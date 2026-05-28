import { FlaticonIcon } from "@/components/FlaticonIcon";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";
import { useLoginCustomer } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";

const WASHING_MACHINE_D = "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5";

function GradientWashingMachine({ size = 28 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <SvgGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00C6B5" />
          <Stop offset="100%" stopColor="#006D96" />
        </SvgGradient>
      </Defs>
      {WASHING_MACHINE_D.split("M").map((seg, i) => {
        if (!seg) return null;
        return <Path key={i} d={`M${seg}`} stroke="url(#iconGrad)" />;
      })}
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const mutation = useLoginCustomer();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const backOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dividerW = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(20)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(backOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, friction: 5 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(dividerW, { toValue: 32, duration: 400, useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(formY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(badgeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }
    try {
      const result = await mutation.mutateAsync({ data: { email, password } });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await login(result.token, result.customer as Parameters<typeof login>[1]);
      router.replace("/(tabs)/");
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      <Animated.View style={{ opacity: backOpacity }}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} testID="btn-back">
          <FlaticonIcon name="arrow-left" size={22} color="#1a2a3a" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.brandSection}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <GradientWashingMachine size={56} />
        </Animated.View>
        <Text style={styles.brandName}>GlownDry</Text>
        <Text style={styles.brandLabel}>C U S T O M E R</Text>
      </View>

      <Animated.View style={{ width: dividerW, height: 2, borderRadius: 1, backgroundColor: "#00C6B5", alignSelf: "center", marginVertical: 20 }} />

      <Animated.Text style={[styles.greeting, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>Welcome back</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>Sign in to your account</Animated.Text>

      <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formY }] }}>
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={[styles.field, { borderColor: emailFocused ? "#00C6B5" : "#e2e8f0", backgroundColor: "#f7fafa" }]}>
              <View style={styles.iconBox}>
                <FlaticonIcon name="mail" size={14} color="#00C6B5" />
              </View>
              <TextInput
                style={[styles.input, { color: "#1a2a3a" }]}
                placeholder="admin@glowndry.com"
                placeholderTextColor="#c0c8d4"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                testID="input-email"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.field, { borderColor: passFocused ? "#00C6B5" : "#e2e8f0", backgroundColor: "#f7fafa" }]}>
              <View style={styles.iconBox}>
                <FlaticonIcon name="lock" size={14} color="#00C6B5" />
              </View>
              <TextInput
                style={[styles.input, { color: "#1a2a3a", flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#c0c8d4"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                testID="input-password"
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} testID="btn-toggle-password">
                <FlaticonIcon name={showPass ? "eye-off" : "eye"} size={16} color="#8a94a6" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRemember(!remember)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, {
                backgroundColor: remember ? "#00C6B5" : "transparent",
                borderColor: remember ? "#00C6B5" : "#d1d5db",
              }]}
            >
              {remember && (
                <FlaticonIcon name="check" size={10} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={mutation.isPending}
            activeOpacity={0.85}
            testID="btn-login"
          >
            <LinearGradient
              colors={["#00C6B5", "#006D96"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.btnLogin, { opacity: mutation.isPending ? 0.7 : 1 }]}
            >
              <FlaticonIcon name="lock" size={14} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnLoginText}>{mutation.isPending ? "Signing in..." : "Sign In"}</Text>
              <Animated.View style={{ transform: [{ translateX: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) }] }}>
                <FlaticonIcon name="arrow-left" size={14} color="#fff" style={{ marginLeft: 8, transform: [{ rotate: "180deg" }] }} />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push("/(auth)/register")}
            testID="link-register"
          >
            <Text style={styles.linkText}>
              Don't have an account?{" "}
              <Text style={{ color: "#00C6B5", fontFamily: "Inter_600SemiBold" }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={[styles.securityBadge, { opacity: badgeOpacity }]}>
        <View style={styles.shieldIcon}>
          <FlaticonIcon name="check-circle" size={12} color="#00C6B5" />
        </View>
        <Text style={styles.shieldText}>Protected by GlownDry System</Text>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  back: { marginBottom: 16, width: 40 },
  brandSection: { alignItems: "center", gap: 8, marginBottom: 4 },
  brandName: {
    fontSize: 24, fontFamily: "Inter_700Bold",
    color: "#1a2a3a", letterSpacing: 5,
  },
  brandLabel: {
    fontSize: 10, fontFamily: "Inter_700Bold",
    color: "#00C6B5", letterSpacing: 4,
  },
  greeting: {
    fontSize: 22, fontFamily: "Inter_700Bold",
    color: "#1a2a3a", textAlign: "center",
  },
  subtitle: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#8a94a6", textAlign: "center",
    marginBottom: 24,
  },
  form: { gap: 14 },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#1a2a3a",
  },
  field: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  iconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "#e8f4f4",
    alignItems: "center", justifyContent: "center",
    marginRight: 10,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  checkboxRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  checkboxLabel: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#8a94a6",
  },
  btnLogin: {
    flexDirection: "row",
    paddingVertical: 14, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    marginTop: 4,
  },
  btnLoginText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  link: { alignItems: "center", paddingVertical: 4 },
  linkText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8a94a6" },
  securityBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 28, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: "#f0f0f0",
  },
  shieldIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#f0fdfa",
    alignItems: "center", justifyContent: "center",
  },
  shieldText: {
    fontSize: 11, fontFamily: "Inter_500Medium",
    color: "#c0c8d4",
  },
});
