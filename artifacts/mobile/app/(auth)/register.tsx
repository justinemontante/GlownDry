import { FlaticonIcon } from "@/components/FlaticonIcon";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";
import { useRegisterCustomer } from "@workspace/api-client-react";

const WASHING_MACHINE_D = "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5";

function GradientWashingMachine({ size = 28 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <SvgGradient id="iconGradReg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00C6B5" />
          <Stop offset="100%" stopColor="#006D96" />
        </SvgGradient>
      </Defs>
      {WASHING_MACHINE_D.split("M").map((seg, i) => {
        if (!seg) return null;
        return <Path key={i} d={`M${seg}`} stroke="url(#iconGradReg)" />;
      })}
    </Svg>
  );
}

interface FieldDef {
  label: string;
  icon: string;
  value: string;
  setter: (v: string) => void;
  type?: string;
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const mutation = useRegisterCustomer();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");

  const backOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dividerW = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(20)).current;
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

  async function handleRegister() {
    if (!fullName || !email || !phone || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    try {
      const result = await mutation.mutateAsync({ data: { fullName, email, phone, password } });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await login(result.token, result.customer as Parameters<typeof login>[1]);
      router.replace("/(tabs)/");
    } catch (e: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = (e as { data?: { error?: string } })?.data?.error ?? "Registration failed.";
      Alert.alert("Error", msg);
    }
  }

  const fields: FieldDef[] = [
    { label: "Full Name", icon: "user", value: fullName, setter: setFullName },
    { label: "Email address", icon: "mail", value: email, setter: setEmail, type: "email" },
    { label: "Phone number", icon: "phone", value: phone, setter: setPhone, type: "phone" },
    { label: "Password", icon: "lock", value: password, setter: setPassword, type: "password" },

  ];

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      <StatusBar style="dark" />
      <Animated.View style={{ opacity: backOpacity }}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} testID="btn-back">
          <FlaticonIcon name="arrow-left" size={22} color="#1a2a3a" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.brandSection}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <GradientWashingMachine size={56} />
        </Animated.View>
          <Text style={styles.brandName}><Text style={{ color: "#1a2a3a" }}>Glown</Text><Text style={{ color: "#00C6B5" }}>Dry</Text></Text>
        <Text style={styles.brandLabel}>C U S T O M E R</Text>
      </View>

      <Animated.View style={{ width: dividerW, height: 2, borderRadius: 1, backgroundColor: "#00C6B5", alignSelf: "center", marginVertical: 20 }} />

      <Animated.Text style={[styles.greeting, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>Create account</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>Join GlownDry today</Animated.Text>

      <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formY }] }}>
        <View style={styles.form}>
          {fields.map(f => (
            <View key={f.label} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={[styles.field, { borderColor: focused === f.label ? "#00C6B5" : "#e2e8f0", backgroundColor: "#f7fafa" }]}>
                <View style={styles.iconBox}>
                  <FlaticonIcon name={f.icon} size={14} color="#00C6B5" />
                </View>
                <TextInput
                  style={[styles.input, { color: "#1a2a3a", flex: 1 }]}
                  placeholder={f.label}
                  placeholderTextColor="#c0c8d4"
                  value={f.value}
                  onChangeText={f.setter}
                  secureTextEntry={f.type === "password" && !showPass}
                  keyboardType={f.type === "email" ? "email-address" : f.type === "phone" ? "phone-pad" : "default"}
                  autoCapitalize={f.type === "email" || f.type === "password" ? "none" : "words"}
                  onFocus={() => setFocused(f.label)}
                  onBlur={() => setFocused("")}
                  testID={`input-${f.label.toLowerCase().replace(/\s+/g, "-")}`}
                />
                {f.type === "password" && f.label === "Password" && (
                  <TouchableOpacity onPress={() => setShowPass(v => !v)} testID="btn-toggle-password">
                    <FlaticonIcon name={showPass ? "eye-off" : "eye"} size={16} color="#8a94a6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={mutation.isPending}
            activeOpacity={0.85}
            testID="btn-register"
          >
            <LinearGradient
              colors={["#00C6B5", "#006D96"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.btnRegister, { opacity: mutation.isPending ? 0.7 : 1 }]}
            >
              <Text style={styles.btnText}>{mutation.isPending ? "Creating account..." : "Create Account"}</Text>
              <Animated.View style={{ transform: [{ translateX: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) }] }}>
                <FlaticonIcon name="arrow-left" size={14} color="#fff" style={{ marginLeft: 8, transform: [{ rotate: "180deg" }] }} />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push("/(auth)/login")}
            testID="link-login"
          >
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={{ color: "#00C6B5", fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  back: { marginBottom: 16, width: 40 },
  brandSection: { alignItems: "center", gap: 8, marginBottom: 4 },
  brandName: {
    fontSize: 28, fontFamily: "Inter_900Black",
    letterSpacing: 5,
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
    paddingHorizontal: 10, paddingVertical: 8,
  },
  iconBox: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: "#e8f4f4",
    alignItems: "center", justifyContent: "center",
    marginRight: 8,
  },
  input: { fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 2 },
  btnRegister: {
    flexDirection: "row",
    paddingVertical: 14, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    marginTop: 8,
  },
  btnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  link: { alignItems: "center", paddingVertical: 4 },
  linkText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8a94a6" },
});
