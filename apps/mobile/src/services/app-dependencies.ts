import type { AuthRepository } from "../ports/auth-repository";
import type { ImageLibrary } from "../ports/image-library";
import type { JamaahRepository } from "../ports/jamaah-repository";
import { expoImageLibrary } from "./expo-image-library";
import { supabaseAuthRepository } from "./supabase-auth-repository";
import { supabaseJamaahRepository } from "./supabase-jamaah-repository";

export type AppDependencies = {
  authRepository: AuthRepository;
  imageLibrary: ImageLibrary;
  jamaahRepository: JamaahRepository;
};

export const appDependencies: AppDependencies = {
  authRepository: supabaseAuthRepository,
  imageLibrary: expoImageLibrary,
  jamaahRepository: supabaseJamaahRepository,
};
