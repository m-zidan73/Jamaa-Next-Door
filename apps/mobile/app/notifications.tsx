import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../src/theme/tokens";

export default function NotificationsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.body}>Expo push registration, in-app history, and privacy-safe message bodies belong here once credentials are supplied.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    marginTop: spacing.md,
    lineHeight: 22,
  },
});
