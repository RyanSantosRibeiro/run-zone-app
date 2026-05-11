import { TouchableOpacity, Text, View } from "react-native";
import { useColors } from "@/hooks/use-theme-color";

interface CustomTabButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityState?: { selected?: boolean };
  label?: string;
}

export function CustomTabButton({
  children,
  onPress,
  accessibilityState,
  label,
}: CustomTabButtonProps) {
  const focused = accessibilityState?.selected ?? false;
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: focused ? colors.primary : `${colors.primary}18`,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 6,
        flexDirection: "row",
      }}
    >
      <View style={{ marginRight: focused ? 6 : 0 }}>{children}</View>
      {focused && label && (
        <Text style={{ color: colors.primaryForeground, fontWeight: "bold", fontSize: 14 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
