import { Picker } from "@react-native-picker/picker";
import { Controller, type Control } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import {
  type CreateJamaahFormValues,
  PRAYER_OPTIONS,
  START_DELAY_OPTIONS,
} from "../create-jamaah-model";
import { colors } from "../../../theme/tokens";
import { styles } from "./create-jamaah-styles";

type PrayerTimingFieldsProps = {
  control: Control<CreateJamaahFormValues>;
};

export function PrayerTimingFields({ control }: PrayerTimingFieldsProps) {
  return (
    <>
      <Text style={styles.label}>Prayer</Text>
      <Controller
        control={control}
        name="prayer"
        render={({ field }) => (
          <View style={styles.pickerWrap}>
            <Picker
              dropdownIconColor={colors.text}
              onValueChange={field.onChange}
              selectedValue={field.value}
              style={{ color: colors.text }}
            >
              {PRAYER_OPTIONS.map((prayer) => (
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
                {START_DELAY_OPTIONS.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
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
    </>
  );
}
