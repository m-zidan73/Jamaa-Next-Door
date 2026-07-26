import { useForm, Controller } from "react-hook-form";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors, radii, spacing } from "../../src/theme/tokens";
import { useTranslation } from "react-i18next";

const schema = z.object({
  displayName: z.string().min(2),
  phone: z.string().optional(),
  isAdult: z.boolean().refine((value) => value, "Adult consent is required."),
});

export default function ProfileSetupScreen() {
  const { t } = useTranslation();
  const { control } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      phone: "",
      isAdult: false,
    },
  });

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t("profileSetup")}</Text>
      <Text style={styles.body}>{t("selfieNotice")}</Text>
      <Controller
        control={control}
        name="displayName"
        render={({ field }) => (
          <TextInput
            onChangeText={field.onChange}
            placeholder="Display name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <TextInput
            onChangeText={field.onChange}
            placeholder="Optional phone"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={field.value}
          />
        )}
      />
      <View style={styles.row}>
        <Text style={styles.body}>{t("adultConsent")}</Text>
        <Controller
          control={control}
          name="isAdult"
          render={({ field }) => <Switch onValueChange={field.onChange} value={field.value} />}
        />
      </View>
      <Text style={styles.note}>Selfie capture, EXIF stripping, and upload should be wired through Expo Camera plus a private Supabase bucket.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    flex: 1,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  note: {
    color: colors.sage,
    marginTop: spacing.lg,
  },
});
