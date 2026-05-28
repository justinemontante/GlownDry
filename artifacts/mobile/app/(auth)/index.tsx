import { FlaticonIcon } from "@/components/FlaticonIcon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ImageBackground
      source={require("@/assets/images/loginImage.png")}
      style={[styles.container, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
    >
      <View style={styles.overlay} />

      <View style={styles.logoSection}>
        <View style={styles.iconWrap}>
          <FlaticonIcon name="wind" size={40} color="#fff" />
        </View>
        <Text style={styles.brand}>GlownDry</Text>
        <Text style={styles.tagline}>Premium Laundry, Delivered</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
          testID="btn-sign-in"
        >
          <Text style={styles.btnPrimaryText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.85}
          testID="btn-get-started"
        >
          <Text style={styles.btnSecondaryText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
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
  buttons: { gap: 12, paddingHorizontal: 20 },
  btnPrimary: {
    backgroundColor: "#fff",
    paddingVertical: 16, borderRadius: 24,
    alignItems: "center",
    shadowColor: "#18967f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#18967f" },
  btnSecondary: {
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)",
    paddingVertical: 16, borderRadius: 24,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
