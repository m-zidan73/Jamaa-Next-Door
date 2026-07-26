import { Image, Text, View } from "react-native";
import { type CreateJamaahFormValues, formatStartDelay } from "../create-jamaah-model";
import { styles } from "./create-jamaah-styles";

type JamaahReviewSummaryProps = {
  summary: CreateJamaahFormValues | null;
};

export function JamaahReviewSummary({ summary }: JamaahReviewSummaryProps) {
  if (!summary) {
    return null;
  }

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Review summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Prayer</Text>
        <Text style={styles.summaryValue}>{summary.prayer}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Starts in</Text>
        <Text style={styles.summaryValue}>{formatStartDelay(summary)}</Text>
      </View>
      <View style={styles.summaryBlock}>
        <Text style={styles.summaryLabel}>Prayer location</Text>
        <Text style={styles.summaryValue}>{summary.location}</Text>
      </View>
      <View style={styles.summaryBlock}>
        <Text style={styles.summaryLabel}>Location image</Text>
        {summary.locationImageUri ? (
          <Image source={{ uri: summary.locationImageUri }} style={styles.summaryImage} />
        ) : (
          <Text style={styles.summaryEmpty}>No image selected yet.</Text>
        )}
      </View>
    </View>
  );
}
