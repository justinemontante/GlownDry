import { FlaticonIcon } from "@/components/FlaticonIcon";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";
import { useLoginCustomer } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const mutation = useLoginCustomer();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  const backOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dividerW = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(20)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(backOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
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
      style={{ flex: 1, backgroundColor: "#f0f4f8" }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      <Animated.View style={{ opacity: backOpacity }}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} testID="btn-back">
          <FlaticonIcon name="arrow-left" size={22} color="#1a2a3a" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
        <View style={styles.brandSection}>
          <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
            <View style={styles.logoWrap}>
              <FlaticonIcon name="washing-machine" size={28} color="#fff" />
            </View>
          </Animated.View>
          <Text style={styles.brandName}>GlownDry</Text>
          <Text style={styles.brandLabel}>C U S T O M E R</Text>
        </View>

        <Animated.View style={{ width: dividerW, height: 2, borderRadius: 1, backgroundColor: "#00C6B5", alignSelf: "center", marginVertical: 16 }} />

        <Animated.Text style={[styles.greeting, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>Welcome back</Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>Sign in to your account</Animated.Text>

        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formY }] }}>
          <View style={styles.form}>
            <View style={[styles.field, { borderColor: "#e2e8f0", backgroundColor: "#fff" }]}>
              <FlaticonIcon name="mail" size={16} color="#8a94a6" style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: "#1a2a3a" }]}
                placeholder="Email address"
                placeholderTextColor="#c0c8d4"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="input-email"
              />
            </View>

            <View style={[styles.field, { borderColor: "#e2e8f0", backgroundColor: "#fff" }]}>
              <FlaticonIcon name="lock" size={16} color="#8a94a6" style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: "#1a2a3a", flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#c0c8d4"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                testID="input-password"
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} testID="btn-toggle-password">
                <FlaticonIcon name={showPass ? "eye-off" : "eye"} size={16} color="#8a94a6" />
              </TouchableOpacity>
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
              style={[styles.btnLogin, { opacity: mutation.isPending ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={mutation.isPending}
              activeOpacity={0.85}
              testID="btn-login"
            >
              <FlaticonIcon name="lock" size={14} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnLoginText}>{mutation.isPending ? "Signing in..." : "Sign In"}</Text>
              <FlaticonIcon name="arrow-left" size={14} color="#fff" style={{ marginLeft: 8, transform: [{ rotate: "180deg" }] }} />
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
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  back: { marginBottom: 16, width: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  brandSection: { alignItems: "center", gap: 6 },
  logoWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#00C6B5",
    alignItems: "center", justifyContent: "center",
  },
  brandName: {
    fontSize: 20, fontFamily: "Inter_700Bold",
    color: "#1a2a3a", letterSpacing: 4,
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
    marginBottom: 20,
  },
  form: { gap: 14 },
  field: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  fieldIcon: { marginRight: 10 },
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
    backgroundColor: "#00C6B5",
  },
  btnLoginText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  link: { alignItems: "center", paddingVertical: 4 },
  linkText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8a94a6" },
  securityBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 20, paddingTop: 16,
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
