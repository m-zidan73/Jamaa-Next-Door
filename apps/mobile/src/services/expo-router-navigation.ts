import { router } from "expo-router";
import type { AppNavigation } from "../ports/app-navigation";

export const expoRouterNavigation: AppNavigation = {
  openJamaahHome(jamaahId) {
    router.replace({ pathname: "/(tabs)/jamaahs", params: jamaahId ? { jamaahId } : {} });
  },
};
