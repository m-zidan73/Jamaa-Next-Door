import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, radii, shadows, spacing } from "../../src/theme/tokens";
import { useLoginController } from "../../src/features/auth/use-login-controller";
import { routes } from "../../src/navigation/routes";
import { useAuthSession } from "../../src/providers/auth-session-provider";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { email, loading, message, sendMagicLink, setEmail } = useLoginController();
  const { callbackError } = useAuthSession();

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("loginTitle")}</Text>
        <Text style={styles.body}>{t("loginBody")}</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="name@example.com"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />
        <Pressable onPress={sendMagicLink} style={styles.button}>
          {loading ? <ActivityIndicator color={colors.surfaceDark} /> : <Text style={styles.buttonLabel}>{t("sendLink")}</Text>}
        </Pressable>
        {callbackError || message ? <Text style={styles.message}>{callbackError ?? message}</Text> : null}
        <Link href={routes.profileSetup} style={styles.secondaryLink}>
          Continue to profile setup
        </Link>
        <Link href={routes.jamaahs} style={styles.secondaryLink}>
          Open prototype shell
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: radii.lg,
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glow,
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
    marginBottom: spacing.lg,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  buttonLabel: {
    color: colors.surfaceDark,
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    color: colors.text,
    marginTop: spacing.md,
  },
  secondaryLink: {
    color: colors.sage,
    marginTop: spacing.md,
  },
});
