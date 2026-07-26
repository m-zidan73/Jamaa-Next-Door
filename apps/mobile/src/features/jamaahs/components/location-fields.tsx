import { Controller, type Control } from "react-hook-form";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import type { CreateJamaahFormValues } from "../create-jamaah-model";
import { colors } from "../../../theme/tokens";
import { styles } from "./create-jamaah-styles";

type LocationFieldsProps = {
  control: Control<CreateJamaahFormValues>;
  locationImageUri?: string;
  onPickImage: () => Promise<void>;
};

export function LocationFields({ control, locationImageUri, onPickImage }: LocationFieldsProps) {
  return (
    <>
      <Text style={styles.label}>Prayer location</Text>
      <Controller
        control={control}
        name="location"
        render={({ field, fieldState }) => (
          <>
            <TextInput
              multiline
              onChangeText={field.onChange}
              placeholder="Prayer location"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textarea, fieldState.error && styles.inputError]}
              value={field.value}
            />
            {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
          </>
        )}
      />
      <Text style={styles.label}>Location image</Text>
      <Pressable onPress={onPickImage} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonLabel}>{locationImageUri ? "Change image" : "Upload image"}</Text>
      </Pressable>
      {locationImageUri ? (
        <View style={styles.previewCard}>
          <Image source={{ uri: locationImageUri }} style={styles.previewImage} />
          <Text style={styles.previewCaption}>Selected image will be included in the review.</Text>
        </View>
      ) : (
        <Text style={styles.helper}>Add a photo so people can recognize the exact prayer spot.</Text>
      )}
    </>
  );
}
