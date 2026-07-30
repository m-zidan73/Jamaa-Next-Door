import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { formatCountdown } from "../../src/features/jamaahs/countdown";
import { useJamaahDetails } from "../../src/features/jamaahs/use-jamaah-details";
import { colors, radii, spacing } from "../../src/theme/tokens";

export default function JamaahDetailsScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const controller = useJamaahDetails(id);
  const [, tick] = useState(0);
  useEffect(() => { const timer = setInterval(() => tick((value) => value + 1), 1000); return () => clearInterval(timer); }, []);
  const item = controller.data;

  if (controller.isLoading) return <View style={styles.screen}><Text style={styles.value}>Loading Jama'ah...</Text></View>;
  if (!item) return <View style={styles.screen}><Text style={styles.error}>{controller.error?.message ?? "Jama'ah not found."}</Text></View>;

  const closed = item.status === "cancelled" || item.status === "concluded";
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>{item.prayer_name} Jama'ah</Text>
      <Text style={styles.countdown}>{closed ? item.status.toUpperCase() : formatCountdown(item.starts_at)}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Starts</Text><Text style={styles.value}>{new Date(item.starts_at).toLocaleString()}</Text>
        <Text style={styles.label}>Approximate area</Text><Text style={styles.value}>{item.approximate_lat?.toFixed(3)}, {item.approximate_lng?.toFixed(3)}</Text>
        <Text style={styles.label}>Participants</Text><Text style={styles.value}>{item.participant_count}</Text>
        {item.exact_address ? <><Text style={styles.label}>Exact location</Text><Text style={styles.value}>{item.exact_address}</Text></> : <Text style={styles.private}>Join with an approved selfie to reveal the exact location.</Text>}
        {item.exact_photo_url ? <Image source={{ uri: item.exact_photo_url }} style={styles.image} /> : null}
      </View>
      {controller.actionError ? <Text style={styles.error}>{controller.actionError}</Text> : null}
      {!closed && !item.is_participant ? <Action label="Join Jama'ah" disabled={controller.acting} onPress={controller.join} /> : null}
      {!closed && item.is_host ? <><Action label="Cancel Jama'ah" disabled={controller.acting} onPress={controller.cancel} secondary /><Action label="Conclude Jama'ah" disabled={controller.acting} onPress={controller.conclude} /></> : null}
    </ScrollView>
  );
}

function Action({ label, disabled, onPress, secondary = false }: { label: string; disabled: boolean; onPress: () => void; secondary?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.action, secondary && styles.secondary, disabled && styles.disabled]}><Text style={styles.actionLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  countdown: { color: colors.gold, fontSize: 34, fontWeight: "900", marginVertical: spacing.lg },
  card: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  label: { color: colors.muted, marginTop: spacing.sm, textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 16, lineHeight: 22 },
  private: { color: colors.gold, marginTop: spacing.lg },
  image: { width: "100%", height: 220, borderRadius: radii.md, marginTop: spacing.md },
  error: { color: "#ECA1A6", marginVertical: spacing.md },
  action: { backgroundColor: colors.gold, borderRadius: radii.md, alignItems: "center", padding: spacing.md, marginTop: spacing.md },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  actionLabel: { color: colors.text, fontWeight: "800" },
});
