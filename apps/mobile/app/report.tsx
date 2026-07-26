import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../src/theme/tokens";

export default function ReportScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Report & Block</Text>
      <Text style={styles.body}>This flow should collect a reason, optional context, and an optional block action, then write both the report and the moderation audit trail server-side.</Text>
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
