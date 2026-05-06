import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { colors } from "@/hooks/use-theme-color";
import React, { ReactElement } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
export default function Resume({ run }: { run: any }) {
  return (
    <ThemedView style={styles.wrapper}>
      <ThemedText type="title">Finish!</ThemedText>
      <ThemedText>
        Edit{" "}
        <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to
        see changes. Press{" "}
        <ThemedText type="defaultSemiBold">
        </ThemedText>{" "}
        to open developer tools.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
});
