import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, radii, shadows, spacing } from "../../src/theme/tokens";
import { supabase } from "../../src/lib/supabase";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendMagicLink() {
    if (!supabase) {
      setMessage("Configure Supabase credentials in .env before testing authentication.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "jnd://",
      },
    });
    setLoading(false);
    setMessage(error ? error.message : "Magic link sent. Continue with profile setup after signing in.");
  }

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
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Link href="/(auth)/profile-setup" style={styles.secondaryLink}>
          Continue to profile setup
        </Link>
        <Link href="/(tabs)/jamaahs" style={styles.secondaryLink}>
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
