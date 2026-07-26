import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { disabledJoinReason } from "@jnd/core";
import { colors, radii, spacing } from "../../src/theme/tokens";

export default function JamaahDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const joinReason = disabledJoinReason("not_submitted");

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Jama'ah Details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>ID</Text>
        <Text style={styles.value}>{id}</Text>
        <Text style={styles.label}>Visibility</Text>
        <Text style={styles.value}>Approximate area only until the participant is approved and joined.</Text>
        <Text style={styles.label}>Join state</Text>
        <Text style={styles.value}>{joinReason}</Text>
        <Text style={styles.chatNote}>Chat must remain text-only, rate-limited, and auditable by administrators.</Text>
      </View>
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
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  label: {
    color: colors.muted,
    marginTop: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  chatNote: {
    color: colors.gold,
    marginTop: spacing.lg,
  },
});
