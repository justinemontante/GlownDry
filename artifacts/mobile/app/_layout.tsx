import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (process.env?.EXPO_PUBLIC_DOMAIN) {
      setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
    }
    SplashScreen.hideAsync();
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#00C6B5" />
        <Text style={styles.splashText}>
          <Text style={{ color: "#1a2a3a" }}>Glown</Text>
          <Text style={{ color: "#00C6B5" }}>Dry</Text>
        </Text>
      </View>
);
  }

  const styles = StyleSheet.create({
    splash: {
      flex: 1,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    splashText: {
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: 3,
    },
  });

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <StatusBar style="dark" />
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
