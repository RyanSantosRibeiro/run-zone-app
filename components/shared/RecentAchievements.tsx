import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useColors } from "@/hooks/use-theme-color";

interface Achievement {
  id: number;
  achievements: {
    icon: string;
    name: string;
    points_reward?: number;
  };
}

interface RecentAchievementsProps {
  recentAchievements: Achievement[];
}

export default function RecentAchievements({ recentAchievements }: RecentAchievementsProps) {
  const colors = useColors();
  if (!recentAchievements || recentAchievements.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Conquistas Recentes</ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {recentAchievements.map((ua) => (
          <View key={ua.id} style={[styles.item, { borderColor: colors.primary }]}>
            <View style={styles.iconWrap}>
              <ThemedText style={styles.icon}>{ua.achievements.icon}</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.name}>{ua.achievements.name}</ThemedText>
              {ua.achievements.points_reward != null && (
                <ThemedText style={styles.xp}>+{ua.achievements.points_reward} XP</ThemedText>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "700",
  },
  list: {
    gap: 12,
    paddingRight: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    gap: 10,
    minWidth: 130,
  },
  iconWrap: {},
  icon: {
    fontSize: 22,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
  },
  xp: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
});
