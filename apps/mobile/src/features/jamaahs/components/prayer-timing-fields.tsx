import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Controller, type Control } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { type CreateJamaahFormValues, PRAYER_OPTIONS, START_DELAY_OPTIONS } from "../create-jamaah-model";
import { colors } from "../../../theme/tokens";
import { styles } from "./create-jamaah-styles";

export function PrayerTimingFields({ control }: { control: Control<CreateJamaahFormValues> }) {
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  return (
    <>
      <Text style={styles.label}>Prayer</Text>
      <Controller control={control} name="prayer" render={({ field }) => (
        <View style={styles.pickerWrap}><Picker dropdownIconColor={colors.text} onValueChange={field.onChange} selectedValue={field.value} style={{ color: colors.text }}>
          {PRAYER_OPTIONS.map((prayer) => <Picker.Item key={prayer} label={prayer} value={prayer} />)}
        </Picker></View>
      )} />
      <Text style={styles.label}>Starts in</Text>
      <Controller control={control} name="startDelay" render={({ field }) => (
        <View style={styles.pickerWrap}><Picker dropdownIconColor={colors.text} onValueChange={field.onChange} selectedValue={field.value} style={{ color: colors.text }}>
          {START_DELAY_OPTIONS.map((option) => <Picker.Item key={option.value} label={option.label} value={option.value} />)}
        </Picker></View>
      )} />
      <Controller control={control} name="customDelay" render={({ field, fieldState }) => (
        <Controller control={control} name="startDelay" render={({ field: delay }) => delay.value === "custom" ? (
          <>
            <Text style={styles.label}>Custom time (minutes)</Text>
            <TextInput keyboardType="number-pad" onChangeText={field.onChange} placeholder="Enter minutes" placeholderTextColor={colors.muted} style={[styles.input, fieldState.error && styles.inputError]} value={field.value} />
            {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
          </>
        ) : <></>} />
      )} />
      <Controller control={control} name="scheduledAt" render={({ field, fieldState }) => {
        const selected = field.value ? new Date(field.value) : new Date(Date.now() + 60 * 60_000);
        function update(event: DateTimePickerEvent, value?: Date) {
          setPickerMode(null);
          if (event.type === "set" && value) field.onChange(value.toISOString());
        }
        return <Controller control={control} name="startDelay" render={({ field: delay }) => delay.value === "scheduled" ? (
          <>
            <View style={styles.dateActions}>
              <Pressable style={styles.secondaryButtonCompact} onPress={() => setPickerMode("date")}><Text style={styles.secondaryButtonLabel}>Choose date</Text></Pressable>
              <Pressable style={styles.secondaryButtonCompact} onPress={() => setPickerMode("time")}><Text style={styles.secondaryButtonLabel}>Choose time</Text></Pressable>
            </View>
            <Text style={styles.helper}>{field.value ? selected.toLocaleString() : "No date and time selected."}</Text>
            {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
            {pickerMode ? <DateTimePicker mode={pickerMode} minimumDate={new Date()} value={selected} onChange={update} /> : null}
          </>
        ) : <></>} />;
      }} />
    </>
  );
}
