import { Pressable, ScrollView, Text } from "react-native";
import { LocationFields } from "../../src/features/jamaahs/components/location-fields";
import { JamaahReviewSummary } from "../../src/features/jamaahs/components/jamaah-review-summary";
import { PrayerTimingFields } from "../../src/features/jamaahs/components/prayer-timing-fields";
import { styles } from "../../src/features/jamaahs/components/create-jamaah-styles";
import { useCreateJamaahController } from "../../src/features/jamaahs/use-create-jamaah-controller";

export default function CreateJamaahScreen() {
  const controller = useCreateJamaahController();
  const reviewing = controller.state !== "editing" && controller.summary;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Create Jama'ah</Text>
      {reviewing ? (
        <JamaahReviewSummary
          errorMessage={controller.errorMessage}
          onConfirm={controller.confirm}
          onEdit={controller.edit}
          state={controller.state}
          summary={controller.summary!}
        />
      ) : (
        <>
          <Text style={styles.note}>Choose a future prayer time and provide the exact meeting point. Only approved participants can reveal it.</Text>
          <PrayerTimingFields control={controller.control} />
          <LocationFields control={controller.control} locationImageUri={controller.locationImageUri} onPickImage={controller.pickLocationImage} />
          {controller.errorMessage ? <Text style={styles.errorBox}>{controller.errorMessage}</Text> : null}
          <Pressable onPress={controller.reviewSummary} style={styles.button}><Text style={styles.buttonLabel}>Review Jama'ah</Text></Pressable>
        </>
      )}
    </ScrollView>
  );
}
