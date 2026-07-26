import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { i18n } from "../../src/lib/i18n";
import { SUPPORTED_LOCALES, type LocaleCode } from "../../src/features/settings/preferences";
import { useUiStore } from "../../src/store/ui-store";
import { colors, radii, spacing } from "../../src/theme/tokens";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const localeOverride = useUiStore((state) => state.localeOverride);
  const setLocaleOverride = useUiStore((state) => state.setLocaleOverride);

  function switchLanguage(next: LocaleCode) {
    setLocaleOverride(next);
    void i18n.changeLanguage(next);
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t("settings")}</Text>
      <Text style={styles.subtitle}>Device language is applied automatically, with manual override stored locally.</Text>
      <View style={styles.row}>
        {SUPPORTED_LOCALES.map((locale) => (
          <Pressable
            key={locale}
            onPress={() => switchLanguage(locale)}
            style={[styles.chip, localeOverride === locale && styles.chipActive]}
          >
            <Text style={styles.chipLabel}>{locale.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.link}>{t("privacy")}</Text>
      <Text style={styles.link}>{t("terms")}</Text>
      <Text style={styles.link}>{t("safety")}</Text>
      <Text style={styles.link}>{t("notifications")}</Text>
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
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceDark,
  },
  chipActive: {
    backgroundColor: colors.gold,
  },
  chipLabel: {
    color: colors.text,
    fontWeight: "700",
  },
  link: {
    color: colors.text,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
