import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useLoginCustomer } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const mutation = useLoginCustomer();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

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
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()} testID="btn-back">
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        <View style={[styles.field, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.fieldIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Email address"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="input-email"
          />
        </View>

        <View style={[styles.field, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.fieldIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground, flex: 1 }]}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            testID="input-password"
          />
          <TouchableOpacity onPress={() => setShowPass(v => !v)} testID="btn-toggle-password">
            <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btnLogin, { backgroundColor: colors.primary, opacity: mutation.isPending ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={mutation.isPending}
          activeOpacity={0.85}
          testID="btn-login"
        >
          <Text style={styles.btnLoginText}>{mutation.isPending ? "Signing in…" : "Sign In"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/register")}
          testID="link-register"
        >
          <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
            Don't have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  back: { marginBottom: 32 },
  header: { marginBottom: 32, gap: 6 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 15, fontFamily: "Inter_400Regular" },
  form: { gap: 14 },
  field: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  fieldIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  btnLogin: {
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center", marginTop: 8,
  },
  btnLoginText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  link: { alignItems: "center", paddingVertical: 8 },
  linkText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
