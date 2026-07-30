import { Image, Pressable, Text, View } from "react-native";
import { type CreateJamaahFormValues, formatStartDelay } from "../create-jamaah-model";
import type { CreateJamaahState } from "../use-create-jamaah-controller";
import { styles } from "./create-jamaah-styles";

type Props = {
  errorMessage: string | null;
  onConfirm: () => Promise<void>;
  onEdit: () => void;
  state: CreateJamaahState;
  summary: CreateJamaahFormValues;
};

export function JamaahReviewSummary({ errorMessage, onConfirm, onEdit, state, summary }: Props) {
  const submitting = state === "submitting";
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Review Jama'ah</Text>
      <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Prayer</Text><Text style={styles.summaryValue}>{summary.prayer}</Text></View>
      <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Starts</Text><Text style={styles.summaryValue}>{formatStartDelay(summary)}</Text></View>
      <View style={styles.summaryBlock}><Text style={styles.summaryLabel}>Prayer location</Text><Text style={styles.summaryValue}>{summary.location}</Text></View>
      <View style={styles.summaryBlock}><Text style={styles.summaryLabel}>Location image</Text><Image source={{ uri: summary.locationImageUri }} style={styles.summaryImage} /></View>
      {errorMessage ? <Text style={styles.errorBox}>{errorMessage}</Text> : null}
      <View style={styles.actionRow}>
        <Pressable disabled={submitting} onPress={onEdit} style={styles.secondaryAction}><Text style={styles.secondaryButtonLabel}>Edit</Text></Pressable>
        <Pressable disabled={submitting} onPress={onConfirm} style={[styles.button, styles.primaryAction, submitting && styles.disabledButton]}>
          <Text style={styles.buttonLabel}>{submitting ? "Publishing..." : "Confirm Jama'ah"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
