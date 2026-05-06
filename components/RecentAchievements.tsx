import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./themed-text";
import { colors } from "@/hooks/use-theme-color";

export default function RecentAchievements({ recentAchievements }) {
  return (
    <View style={styles.container}>
      {recentAchievements && recentAchievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <View style={styles.header}>
            <ThemedText style={styles.headerText}>Conquistas Recentes</ThemedText>
            <TouchableOpacity style={styles.viewAllButton}>
              {/* <ThemedText style={styles.viewAllText}>Ver todas</ThemedText> */}
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsList}>
            {recentAchievements.map((userAchievement) => (
              <View key={userAchievement.id} style={styles.achievementItem}>
                <View style={styles.iconContainer}>
                  <ThemedText style={styles.icon}>{userAchievement.achievements.icon}</ThemedText>
                </View>
                <View>
                  <ThemedText style={styles.achievementName}>{userAchievement.achievements.name}</ThemedText>
                  <ThemedText style={styles.pointsReward}>+{userAchievement.achievements.points_reward} XP</ThemedText>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  achievementsContainer: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  viewAllButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 9999, // Makes it round
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 12,
  },
  achievementsList: {
    flexDirection: 'row',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120, // Ensures each item has a minimum width
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 24,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '500',
  },
  pointsReward: {
    opacity: .5,
    fontSize: 10,
  },
});
