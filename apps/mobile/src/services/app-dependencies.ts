import type { AuthRepository } from "../ports/auth-repository";
import type { ImageLibrary } from "../ports/image-library";
import type { JamaahRepository } from "../ports/jamaah-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import { expoImageLibrary } from "./expo-image-library";
import { supabaseAuthRepository } from "./supabase-auth-repository";
import { supabaseJamaahRepository } from "./supabase-jamaah-repository";
import { supabaseProfileRepository } from "./supabase-profile-repository";

export type AppDependencies = {
  authRepository: AuthRepository;
  imageLibrary: ImageLibrary;
  jamaahRepository: JamaahRepository;
  profileRepository: ProfileRepository;
};

export const appDependencies: AppDependencies = {
  authRepository: supabaseAuthRepository,
  imageLibrary: expoImageLibrary,
  jamaahRepository: supabaseJamaahRepository,
  profileRepository: supabaseProfileRepository,
};
