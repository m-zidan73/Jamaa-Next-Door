import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useProfileEntryRoute } from "../src/features/profile/use-profile-entry-route";
import { useAuthSession } from "../src/providers/auth-session-provider";
import { colors } from "../src/theme/tokens";

export default function Index() {
  const { status } = useAuthSession();
  const entryRoute = useProfileEntryRoute(status);

  if (!entryRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return <Redirect href={entryRoute} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
