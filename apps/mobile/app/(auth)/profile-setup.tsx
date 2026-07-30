import { Controller } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useProfileSetupController } from "../../src/features/profile/use-profile-setup-controller";
import { colors, radii, spacing } from "../../src/theme/tokens";

export default function ProfileSetupScreen() {
  const { t } = useTranslation();
  const {
    captureSelfie,
    control,
    errors,
    isSubmitting,
    selfieError,
    selfieUri,
    submissionError,
    submitProfile,
  } = useProfileSetupController();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>ONE LAST STEP</Text>
        <Text style={styles.title}>{t("profileSetup")}</Text>
        <Text style={styles.intro}>{t("selfieNotice")}</Text>

        <View style={styles.selfieCard}>
          {selfieUri ? (
            <Image accessibilityLabel="Verification selfie preview" source={{ uri: selfieUri }} style={styles.selfie} />
          ) : (
            <View accessibilityLabel="No verification selfie" style={styles.selfiePlaceholder}>
              <Text style={styles.selfieMark}>JND</Text>
            </View>
          )}
          <View style={styles.selfieCopy}>
            <Text style={styles.cardTitle}>{selfieUri ? "Selfie ready" : "Verification selfie"}</Text>
            <Text style={styles.cardBody}>
              Your photo is stored privately and is only available to authorized reviewers.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={captureSelfie}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>{selfieUri ? "Retake selfie" : "Take selfie"}</Text>
            </Pressable>
          </View>
        </View>
        {selfieError ? <Text style={styles.error}>{selfieError}</Text> : null}

        <Text style={styles.label}>Display name</Text>
        <Controller
          control={control}
          name="displayName"
          render={({ field }) => (
            <TextInput
              accessibilityLabel="Display name"
              autoCapitalize="words"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="How should people know you?"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={field.value}
            />
          )}
        />
        {errors.displayName ? <Text style={styles.error}>{errors.displayName.message}</Text> : null}

        <Text style={styles.label}>Phone number (optional)</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <TextInput
              accessibilityLabel="Phone number"
              keyboardType="phone-pad"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Optional phone"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={field.value}
            />
          )}
        />

        <View style={styles.consentCard}>
          <View style={styles.consentCopy}>
            <Text style={styles.cardTitle}>{t("adultConsent")}</Text>
            <Text style={styles.cardBody}>You must be at least 18 years old to use Jamaa Next Door.</Text>
          </View>
          <Controller
            control={control}
            name="isAdult"
            render={({ field }) => (
              <Switch
                accessibilityLabel="Confirm age 18 or older"
                onValueChange={field.onChange}
                thumbColor={field.value ? colors.gold : colors.muted}
                trackColor={{ false: colors.surfaceDark, true: colors.sage }}
                value={field.value}
              />
            )}
          />
        </View>
        {errors.isAdult ? <Text style={styles.error}>{errors.isAdult.message}</Text> : null}
        {submissionError ? <Text style={styles.errorBanner}>{submissionError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={submitProfile}
          style={({ pressed }) => [
            styles.submitButton,
            isSubmitting && styles.disabled,
            pressed && !isSubmitting && styles.pressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.surfaceDark} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Profile</Text>
          )}
        </Pressable>
        <Text style={styles.privacyNote}>Your exact profile data is not shown on the public discovery map.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  intro: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  selfieCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  selfie: {
    borderRadius: radii.md,
    height: 104,
    width: 104,
  },
  selfiePlaceholder: {
    alignItems: "center",
    backgroundColor: colors.surfaceDark,
    borderColor: colors.sage,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 104,
    justifyContent: "center",
    width: 104,
  },
  selfieMark: {
    color: colors.sage,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  selfieCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderColor: colors.gold,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  consentCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  consentCopy: {
    flex: 1,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: "rgba(200,118,107,0.16)",
    borderColor: colors.danger,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    lineHeight: 19,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: radii.pill,
    justifyContent: "center",
    marginTop: spacing.lg,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  submitButtonText: {
    color: colors.surfaceDark,
    fontSize: 16,
    fontWeight: "800",
  },
  privacyNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.55,
  },
});
