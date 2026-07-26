import type { PublishJamaahInput } from "../ports/jamaah-repository";
import { appDependencies } from "../services/app-dependencies";

export type { DiscoverableJamaah } from "../ports/jamaah-repository";

export function getLatestVerificationStatus() {
  return appDependencies.jamaahRepository.getLatestVerificationStatus();
}

export function fetchDiscoverableJamaahs() {
  return appDependencies.jamaahRepository.fetchDiscoverableJamaahs();
}

export function publishJamaah(input: PublishJamaahInput) {
  return appDependencies.jamaahRepository.publishJamaah(input);
}

export function joinJamaah(jamaahId: string) {
  return appDependencies.jamaahRepository.joinJamaah(jamaahId);
}
