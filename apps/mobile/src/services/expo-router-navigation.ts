import { router } from "expo-router";
import type { AppNavigation } from "../ports/app-navigation";

export const expoRouterNavigation: AppNavigation = {
  openJamaahDetails(jamaahId) {
    router.replace(`/jamaahs/${jamaahId}`);
  },
};
