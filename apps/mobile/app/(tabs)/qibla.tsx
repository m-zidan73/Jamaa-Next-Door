import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../src/theme/tokens";

export default function QiblaScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>{t("comingSoon")}</Text>
    </View>
  );
}
