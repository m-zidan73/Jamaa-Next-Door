import { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { formatCountdown } from "../countdown";
import { useJamaahDetails } from "../use-jamaah-details";
import { colors, radii, shadows, spacing } from "../../../theme/tokens";

type JamaahDetailsSheetProps = {
  jamaahId: string | null;
  onClose: () => void;
};

export function JamaahDetailsSheet({ jamaahId, onClose }: JamaahDetailsSheetProps) {
  const controller = useJamaahDetails(jamaahId ?? "");
  const [, tick] = useState(0);

  useEffect(() => {
    if (!jamaahId) return;
    const timer = setInterval(() => tick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [jamaahId]);

  const item = controller.data;
  const expired = item ? new Date(item.starts_at).getTime() <= Date.now() : false;
  const closed = !item || expired || item.status === "cancelled" || item.status === "concluded";

  async function leave() {
    if (await controller.leave()) onClose();
  }

  async function cancel() {
    if (await controller.cancel()) onClose();
  }

  async function share() {
    if (!item) return;
    const area = item.approximate_lat == null || item.approximate_lng == null
      ? "Approximate area available in the app"
      : `${item.approximate_lat.toFixed(3)}, ${item.approximate_lng.toFixed(3)}`;
    try {
      await Share.share({
        message: `Join the ${item.prayer_name} Jama'ah on ${new Date(item.starts_at).toLocaleString()}. Approximate area: ${area}. jnd://jamaahs/${item.id}`,
        title: `${item.prayer_name} Jama'ah`,
      });
    } catch {
      Alert.alert("Unable to share", "The Jama'ah invitation could not be opened.");
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(jamaahId)}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Close Jama'ah details" onPress={onClose} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {controller.isLoading ? <Text style={styles.value}>Loading Jama'ah...</Text> : null}
          {!controller.isLoading && !item ? <Text style={styles.error}>{controller.error?.message ?? "Jama'ah not found."}</Text> : null}
          {item ? (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>{item.prayer_name} Jama'ah</Text>
              <Text style={styles.countdown}>{closed ? "ENDED" : formatCountdown(item.starts_at)}</Text>
              <View style={styles.card}>
                <Text style={styles.label}>Starts</Text>
                <Text style={styles.value}>{new Date(item.starts_at).toLocaleString()}</Text>
                <Text style={styles.label}>Approximate area</Text>
                <Text style={styles.value}>{item.approximate_lat?.toFixed(3) ?? "-"}, {item.approximate_lng?.toFixed(3) ?? "-"}</Text>
                <Text style={styles.label}>Participants</Text>
                <Text style={styles.value}>{item.participant_count}</Text>
                {item.exact_address ? (
                  <><Text style={styles.label}>Exact location</Text><Text style={styles.value}>{item.exact_address}</Text></>
                ) : (
                  <Text style={styles.private}>Join with an approved selfie to reveal the exact location.</Text>
                )}
                {item.exact_photo_url ? <Image source={{ uri: item.exact_photo_url }} style={styles.image} /> : null}
              </View>
              {controller.actionError ? <Text style={styles.error}>{controller.actionError}</Text> : null}
              {!closed && !item.is_participant ? <Action label="Join Jama'ah" disabled={controller.acting} onPress={controller.join} /> : null}
              {!closed && item.is_host ? <Action label="Cancel Jama'ah" disabled={controller.acting} onPress={cancel} danger /> : null}
              {!closed && item.is_participant ? <Action label="Leave Jama'ah" disabled={controller.acting} onPress={leave} secondary /> : null}
              {!closed ? <Action label="Share Jama'ah" disabled={controller.acting} onPress={share} secondary /> : null}
              <Action label="Close" disabled={false} onPress={onClose} secondary />
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function Action({ label, disabled, onPress, secondary = false, danger = false }: { label: string; disabled: boolean; onPress: () => void; secondary?: boolean; danger?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.action, secondary && styles.secondary, danger && styles.danger, disabled && styles.disabled]}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(3, 22, 27, 0.62)" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { maxHeight: "88%", minHeight: 240, backgroundColor: colors.surfaceDark, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, borderWidth: 1, borderColor: colors.border, paddingTop: spacing.sm, ...shadows.glow },
  handle: { width: 54, height: 5, borderRadius: radii.pill, backgroundColor: colors.muted, alignSelf: "center", marginBottom: spacing.sm },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  countdown: { color: colors.gold, fontSize: 34, fontWeight: "900", marginVertical: spacing.md },
  card: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  label: { color: colors.muted, marginTop: spacing.sm, textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 16, lineHeight: 22, paddingHorizontal: spacing.lg },
  private: { color: colors.gold, marginTop: spacing.lg },
  image: { width: "100%", height: 220, borderRadius: radii.md, marginTop: spacing.md },
  error: { color: "#ECA1A6", margin: spacing.lg },
  action: { backgroundColor: colors.gold, borderRadius: radii.md, alignItems: "center", padding: spacing.md, marginTop: spacing.md },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.5 },
  actionLabel: { color: colors.text, fontWeight: "800" },
});
