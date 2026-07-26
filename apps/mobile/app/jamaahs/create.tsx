import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Picker } from "@react-native-picker/picker";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../../src/theme/tokens";

const schema = z.object({
  prayer: z.enum(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]),
  startDelay: z.enum(["5", "8", "10", "15", "custom"]),
  customDelay: z.string().optional(),
  location: z.string().min(5),
  locationImageUri: z.string().optional(),
}).superRefine((values, context) => {
  if (
    values.startDelay === "custom" &&
    (!values.customDelay || !/^\d+$/.test(values.customDelay) || Number(values.customDelay) < 1)
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid number of minutes.",
      path: ["customDelay"],
    });
  }
});

export default function CreateJamaahScreen() {
  const [summary, setSummary] = useState<z.infer<typeof schema> | null>(null);
  const { control, handleSubmit, setValue, watch } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      prayer: "Fajr",
      startDelay: "5",
      customDelay: "",
      location: "",
      locationImageUri: "",
    },
  });
  const locationImageUri = watch("locationImageUri");

  async function pickLocationImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to upload a location image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setValue("locationImageUri", result.assets[0].uri, { shouldDirty: true, shouldValidate: true });
    }
  }

  function formatStartDelay(values: z.infer<typeof schema>) {
    if (values.startDelay === "custom") {
      return `${values.customDelay} minutes`;
    }

    return `${values.startDelay} minutes`;
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Create Jama'ah</Text>
      <Text style={styles.note}>GPS point, map selection, and full-address search should all validate Germany-only creation server-side.</Text>
      <Text style={styles.label}>Prayer</Text>
      <Controller
        control={control}
        name="prayer"
        render={({ field }) => (
          <View style={styles.pickerWrap}>
            <Picker dropdownIconColor={colors.text} onValueChange={field.onChange} selectedValue={field.value} style={{ color: colors.text }}>
              {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer) => (
                <Picker.Item key={prayer} label={prayer} value={prayer} />
              ))}
            </Picker>
          </View>
        )}
      />
      <Text style={styles.label}>Starts in</Text>
      <Controller
        control={control}
        name="startDelay"
        render={({ field }) => (
          <>
            <View style={styles.pickerWrap}>
              <Picker
                dropdownIconColor={colors.text}
                onValueChange={field.onChange}
                selectedValue={field.value}
                style={{ color: colors.text }}
              >
                <Picker.Item label="5 minutes" value="5" />
                <Picker.Item label="8 minutes" value="8" />
                <Picker.Item label="10 minutes" value="10" />
                <Picker.Item label="15 minutes" value="15" />
                <Picker.Item label="Custom" value="custom" />
              </Picker>
            </View>
            {field.value === "custom" ? (
              <Controller
                control={control}
                name="customDelay"
                render={({ field: customField, fieldState }) => (
                  <>
                    <Text style={styles.label}>Custom time (minutes)</Text>
                    <TextInput
                      keyboardType="number-pad"
                      onChangeText={customField.onChange}
                      placeholder="Enter minutes"
                      placeholderTextColor={colors.muted}
                      style={[styles.input, fieldState.error && styles.inputError]}
                      value={customField.value}
                    />
                    {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
                  </>
                )}
              />
            ) : null}
          </>
        )}
      />
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
      <Pressable onPress={pickLocationImage} style={styles.secondaryButton}>
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
      <Pressable onPress={handleSubmit((values) => setSummary(values))} style={styles.button}>
        <Text style={styles.buttonLabel}>Review summary</Text>
      </Pressable>
      {summary ? (
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
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    minHeight: "100%",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  note: {
    color: colors.muted,
    marginVertical: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inputError: {
    borderColor: "#E06C75",
  },
  error: {
    color: "#ECA1A6",
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  helper: {
    color: colors.muted,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  buttonLabel: {
    color: colors.surfaceDark,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  secondaryButtonLabel: {
    color: colors.text,
    fontWeight: "700",
  },
  previewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  previewCaption: {
    color: colors.muted,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  summaryBlock: {
    gap: spacing.xs,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  summaryImage: {
    width: "100%",
    height: 200,
    borderRadius: radii.sm,
  },
  summaryEmpty: {
    color: colors.muted,
    fontSize: 15,
  },
});
