import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../src/theme/tokens";

export default function AccountDeletionScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account Deletion Request</Text>
      <Text style={styles.body}>Deletion requests should move through pending, approved, rejected-with-reason, and completed states without exposing internal moderation notes to other users.</Text>
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
