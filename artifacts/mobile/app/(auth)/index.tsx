import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={["#18967f", "#0e6b5c", "#0a4f45"]}
      style={[styles.container, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
    >
      <View style={styles.logoSection}>
        <View style={styles.iconWrap}>
          <Feather name="wind" size={40} color="#fff" />
        </View>
        <Text style={styles.brand}>GlownDry</Text>
        <Text style={styles.tagline}>Premium Laundry, Delivered</Text>
      </View>

      <View style={styles.featuresSection}>
        {[
          { icon: "calendar" as const, text: "Smart booking in seconds" },
          { icon: "map-pin" as const, text: "Live order tracking" },
          { icon: "star" as const, text: "Premium garment care" },
        ].map(f => (
          <View key={f.text} style={styles.featureRow}>
            <View style={styles.featureDot}>
              <Feather name={f.icon} size={16} color="#fff" />
            </View>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.85}
          testID="btn-get-started"
        >
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
          testID="btn-sign-in"
        >
          <Text style={styles.btnSecondaryText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  logoSection: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  brand: {
    fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff",
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 16, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  featuresSection: { gap: 14, marginBottom: 40 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureDot: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  featureText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
  buttons: { gap: 12 },
  btnPrimary: {
    backgroundColor: "#fff",
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center",
  },
  btnPrimaryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#18967f" },
  btnSecondary: {
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)",
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
