import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const STEPS = [
  { key: "scheduled", label: "Scheduled", icon: "calendar" as const },
  { key: "received", label: "Received", icon: "inbox" as const },
  { key: "in_progress", label: "In Progress", icon: "loader" as const },
  { key: "ready", label: "Ready", icon: "package" as const },
  { key: "claimed", label: "Claimed", icon: "check-circle" as const },
];

const STATUS_ORDER = ["scheduled", "received", "in_progress", "ready", "claimed"];

interface StepTrackerProps {
  currentStatus: string;
}

export function StepTracker({ currentStatus }: StepTrackerProps) {
  const colors = useColors();
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isPending = idx > currentIdx;

        const circleColor = isDone || isActive ? colors.primary : colors.border;
        const textColor = isPending ? colors.mutedForeground : colors.foreground;

        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.iconCol}>
              <View style={[
                styles.circle,
                { backgroundColor: circleColor, borderColor: circleColor },
                isActive && { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
              ]}>
                <Feather
                  name={isDone ? "check" : step.icon}
                  size={14}
                  color={isDone || isActive ? "#fff" : colors.mutedForeground}
                />
              </View>
              {idx < STEPS.length - 1 && (
                <View style={[
                  styles.line,
                  { backgroundColor: isDone ? colors.primary : colors.border },
                ]} />
              )}
            </View>
            <View style={styles.labelCol}>
              <Text style={[
                styles.label,
                { color: textColor },
                isActive && { fontFamily: "Inter_700Bold", color: colors.primary },
              ]}>
                {step.label}
              </Text>
              {isActive && (
                <Text style={[styles.active, { color: colors.primary }]}>Current status</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", minHeight: 52 },
  iconCol: { alignItems: "center", width: 36 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { width: 2, flex: 1, marginVertical: 2, minHeight: 16 },
  labelCol: { flex: 1, paddingLeft: 12, paddingTop: 6 },
  label: { fontSize: 14, fontFamily: "Inter_500Medium" },
  active: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
