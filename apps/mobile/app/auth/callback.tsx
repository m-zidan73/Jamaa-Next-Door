import { Link, Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { routes } from "../../src/navigation/routes";
import { useAuthSession } from "../../src/providers/auth-session-provider";
import { colors, spacing } from "../../src/theme/tokens";

export default function AuthCallbackScreen() {
  const { callbackError, status } = useAuthSession();

  if (status === "signedIn") {
    return <Redirect href={routes.profileSetup} />;
  }

  if (status === "loading") {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color={colors.gold} />
        <Text style={styles.body}>Completing sign in...</Text>
      </View>
    );
  }

  if (!callbackError) {
    return <Redirect href={routes.login} />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Unable to sign in</Text>
      <Text style={styles.body}>{callbackError}</Text>
      <Link href={routes.login} style={styles.link}>
        Request a new magic link
      </Link>
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
  title: { color: colors.text, fontSize: 24, fontWeight: "700", marginBottom: spacing.sm },
  body: { color: colors.muted, marginTop: spacing.md, textAlign: "center" },
  link: { color: colors.sage, marginTop: spacing.lg },
});
