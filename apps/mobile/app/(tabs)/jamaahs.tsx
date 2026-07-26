import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { routes } from "../../src/navigation/routes";
import { colors, radii, shadows, spacing } from "../../src/theme/tokens";

export default function JamaahsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.location}>Frankfurt am Main</Text>
      <View style={styles.prayerCard}>
        <Text style={styles.cardMuted}>5 Muharram, 1448</Text>
        <Text style={styles.cardTitle}>Fajr</Text>
        <Text style={styles.cardMuted}>Next: Sunrise 05:16</Text>
      </View>
      <Text style={styles.heading}>{t("jamaahs")}</Text>
      <Text style={styles.helper}>Pull to refresh once Supabase is configured.</Text>
      <View style={styles.emptyCard}>
        <Text style={styles.body}>Exact location data must only be fetched for approved participants through a server-authorized function.</Text>
      </View>
      <Link asChild href={routes.createJamaah}>
        <Pressable style={styles.startButton}>
          <Text style={styles.startButtonLabel}>{t("startJamaah")}</Text>
        </Pressable>
      </Link>
      <Link asChild href={routes.jamaahDetailsDemo}>
        <Pressable style={styles.previewButton}>
          <Text style={styles.previewButtonLabel}>Open details preview</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    minHeight: "100%",
  },
  location: {
    color: colors.text,
    fontSize: 22,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  prayerCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.glow,
  },
  cardMuted: {
    color: colors.muted,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginVertical: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    marginTop: spacing.xl,
  },
  helper: {
    color: colors.muted,
    marginTop: spacing.sm,
  },
  emptyCard: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  body: {
    color: colors.text,
    lineHeight: 22,
  },
  startButton: {
    width: 220,
    height: 220,
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: colors.text,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxl,
    ...shadows.glow,
  },
  startButtonLabel: {
    color: colors.surfaceDark,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  previewButton: {
    marginTop: spacing.xl,
    alignSelf: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewButtonLabel: {
    color: colors.text,
    fontWeight: "700",
  },
});
