import { useEffect, useRef } from "react";
import { Animated, type ViewStyle } from "react-native";

export function Skeleton({ height, width, borderRadius, style }: { height: number; width?: number | string; borderRadius?: number; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[{ height, width: width ?? "100%", borderRadius: borderRadius ?? 8, backgroundColor: "#d4dce8", opacity }, style]}
    />
  );
}