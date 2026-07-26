import { Pressable, ScrollView, Text } from "react-native";
import { LocationFields } from "../../src/features/jamaahs/components/location-fields";
import { JamaahReviewSummary } from "../../src/features/jamaahs/components/jamaah-review-summary";
import { PrayerTimingFields } from "../../src/features/jamaahs/components/prayer-timing-fields";
import { styles } from "../../src/features/jamaahs/components/create-jamaah-styles";
import { useCreateJamaahController } from "../../src/features/jamaahs/use-create-jamaah-controller";

export default function CreateJamaahScreen() {
  const {
    control,
    locationImageUri,
    pickLocationImage,
    reviewSummary,
    summary,
  } = useCreateJamaahController();

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Create Jama'ah</Text>
      <Text style={styles.note}>GPS point, map selection, and full-address search should all validate Germany-only creation server-side.</Text>
      <PrayerTimingFields control={control} />
      <LocationFields
        control={control}
        locationImageUri={locationImageUri}
        onPickImage={pickLocationImage}
      />
      <Pressable onPress={reviewSummary} style={styles.button}>
        <Text style={styles.buttonLabel}>Review summary</Text>
      </Pressable>
      <JamaahReviewSummary summary={summary} />
    </ScrollView>
  );
}
