import { Link } from "expo-router";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useJamaahDiscovery } from "../../src/features/jamaahs/use-jamaah-discovery";
import { routes } from "../../src/navigation/routes";
import { colors, radii, shadows, spacing } from "../../src/theme/tokens";

export default function JamaahsScreen() {
  const { data = [], error, isFetching, refresh } = useJamaahDiscovery();
  return (
    <ScrollView contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refresh} tintColor={colors.gold} />}>
      <Text style={styles.location}>Frankfurt am Main</Text>
      <View style={styles.prayerCard}><Text style={styles.cardMuted}>Nearby prayer</Text><Text style={styles.cardTitle}>Jama'ah</Text><Text style={styles.cardMuted}>Approximate locations remain private by design.</Text></View>
      <Text style={styles.heading}>Jama'ahs</Text>
      {error ? <Text style={styles.error}>{error.message}</Text> : null}
      {!isFetching && data.length === 0 ? <View style={styles.emptyCard}><Text style={styles.body}>No upcoming Jama'ahs. Start one for your community.</Text></View> : null}
      {data.map((item) => (
        <Link key={item.id} asChild href={`/jamaahs/${item.id}`}>
          <Pressable style={styles.jamaahCard}>
            <View><Text style={styles.jamaahPrayer}>{item.prayer_name}</Text><Text style={styles.cardMuted}>{new Date(item.starts_at).toLocaleString()}</Text></View>
            <Text style={styles.count}>{item.participant_count} joined</Text>
          </Pressable>
        </Link>
      ))}
      <Link asChild href={routes.createJamaah}><Pressable style={styles.startButton}><Text style={styles.startButtonLabel}>Start Jama'ah</Text></Pressable></Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, backgroundColor: colors.background, minHeight: "100%" },
  location: { color: colors.text, fontSize: 22, textAlign: "center", marginBottom: spacing.md },
  prayerCard: { backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...shadows.glow },
  cardMuted: { color: colors.muted },
  cardTitle: { color: colors.text, fontSize: 30, fontWeight: "800", marginVertical: spacing.sm },
  heading: { color: colors.text, fontSize: 34, fontWeight: "900", marginTop: spacing.xl, marginBottom: spacing.md },
  emptyCard: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  body: { color: colors.text, lineHeight: 22 },
  error: { color: "#ECA1A6", marginBottom: spacing.md },
  jamaahCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  jamaahPrayer: { color: colors.text, fontSize: 20, fontWeight: "800" },
  count: { color: colors.gold, fontWeight: "700" },
  startButton: { width: 180, height: 180, alignSelf: "center", borderRadius: 999, backgroundColor: colors.text, justifyContent: "center", alignItems: "center", marginTop: spacing.xl, ...shadows.glow },
  startButtonLabel: { color: colors.surfaceDark, fontSize: 28, fontWeight: "900", textAlign: "center" },
});
