import type { AppNavigation } from "../ports/app-navigation";
import type { AuthRepository } from "../ports/auth-repository";
import type { ImageLibrary } from "../ports/image-library";
import type { JamaahImageStorage } from "../ports/jamaah-image-storage";
import type { JamaahRepository } from "../ports/jamaah-repository";
import type { NotificationRegistration } from "../ports/notification-registration";
import type { ProfileRepository } from "../ports/profile-repository";
import { expoImageLibrary } from "./expo-image-library";
import { expoNotificationRegistration } from "./expo-notification-registration";
import { expoRouterNavigation } from "./expo-router-navigation";
import { supabaseAuthRepository } from "./supabase-auth-repository";
import { supabaseJamaahImageStorage } from "./supabase-jamaah-image-storage";
import { supabaseJamaahRepository } from "./supabase-jamaah-repository";
import { supabaseProfileRepository } from "./supabase-profile-repository";

export type AppDependencies = {
  authRepository: AuthRepository;
  imageLibrary: ImageLibrary;
  jamaahImageStorage: JamaahImageStorage;
  jamaahRepository: JamaahRepository;
  navigation: AppNavigation;
  notificationRegistration: NotificationRegistration;
  profileRepository: ProfileRepository;
};

export const appDependencies: AppDependencies = {
  authRepository: supabaseAuthRepository,
  imageLibrary: expoImageLibrary,
  jamaahImageStorage: supabaseJamaahImageStorage,
  jamaahRepository: supabaseJamaahRepository,
  navigation: expoRouterNavigation,
  notificationRegistration: expoNotificationRegistration,
  profileRepository: supabaseProfileRepository,
};
