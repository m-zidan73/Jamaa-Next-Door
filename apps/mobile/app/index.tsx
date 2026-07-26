import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { routes } from "../src/navigation/routes";
import { useAuthSession } from "../src/providers/auth-session-provider";
import { colors } from "../src/theme/tokens";

export default function Index() {
  const { status } = useAuthSession();

  if (status === "loading") {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return <Redirect href={status === "signedIn" ? routes.profileSetup : routes.login} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
