import { StyleSheet, Text, View } from "react-native";
import { useUiStore } from "../../src/store/ui-store";
import { buildPrayerTimes } from "../../src/lib/prayer-times";
import { colors, spacing } from "../../src/theme/tokens";

export default function PrayerTimesScreen() {
  const calculationMethod = useUiStore((state) => state.calculationMethod);
  const madhhab = useUiStore((state) => state.madhhab);
  const prayerTimes = buildPrayerTimes(new Date(), calculationMethod, madhhab);
  const items: [string, Date][] = [
    ["Fajr", prayerTimes.fajr],
    ["Dhuhr", prayerTimes.dhuhr],
    ["Asr", prayerTimes.asr],
    ["Maghrib", prayerTimes.maghrib],
    ["Isha", prayerTimes.isha],
  ];

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Prayer Times</Text>
      <Text style={styles.subtitle}>Europe/Berlin timezone with calculation adapter support.</Text>
      {items.map(([label, date]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
        </View>
      ))}
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
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.text,
    fontSize: 18,
  },
  value: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "700",
  },
});
