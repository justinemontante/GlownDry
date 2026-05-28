import { FlaticonIcon } from "@/components/FlaticonIcon";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useRegisterCustomer } from "@workspace/api-client-react";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const mutation = useRegisterCustomer();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !phone || !password || !confirm) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
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

  const fields: { label: string; icon: string; value: string; setter: (v: string) => void; type?: string }[] = [
    { label: "Full Name", icon: "user", value: fullName, setter: setFullName },
    { label: "Email address", icon: "mail", value: email, setter: setEmail, type: "email" },
    { label: "Phone number", icon: "phone", value: phone, setter: setPhone, type: "phone" },
    { label: "Password", icon: "lock", value: password, setter: setPassword, type: "password" },
    { label: "Confirm password", icon: "lock", value: confirm, setter: setConfirm, type: "password" },
  ];

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()} testID="btn-back">
        <FlaticonIcon name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Join GlownDry today</Text>
      </View>

      <View style={styles.form}>
        {fields.map(f => (
          <View key={f.label} style={[styles.field, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <FlaticonIcon name={f.icon} size={18} color={colors.mutedForeground} style={styles.fieldIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground, flex: 1 }]}
              placeholder={f.label}
              placeholderTextColor={colors.mutedForeground}
              value={f.value}
              onChangeText={f.setter}
              secureTextEntry={f.type === "password" && !showPass}
              keyboardType={f.type === "email" ? "email-address" : f.type === "phone" ? "phone-pad" : "default"}
              autoCapitalize={f.type === "email" || f.type === "password" ? "none" : "words"}
              testID={`input-${f.label.toLowerCase().replace(/\s+/g, "-")}`}
            />
            {f.type === "password" && f.label === "Password" && (
              <TouchableOpacity onPress={() => setShowPass(v => !v)} testID="btn-toggle-password">
                  <FlaticonIcon name={showPass ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btnRegister, { backgroundColor: colors.primary, opacity: mutation.isPending ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={mutation.isPending}
          activeOpacity={0.85}
          testID="btn-register"
        >
          <Text style={styles.btnText}>{mutation.isPending ? "Creating account…" : "Create Account"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/login")}
          testID="link-login"
        >
          <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  back: { marginBottom: 32 },
  header: { marginBottom: 28, gap: 6 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 15, fontFamily: "Inter_400Regular" },
  form: { gap: 12 },
  field: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  fieldIcon: { marginRight: 10 },
  input: { fontSize: 15, fontFamily: "Inter_400Regular" },
  btnRegister: {
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center", marginTop: 8,
  },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  link: { alignItems: "center", paddingVertical: 8 },
  linkText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
