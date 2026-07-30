import { useEffect, useState } from "react";
import type { AuthSessionStatus } from "../../providers/auth-session-provider";
import { routes } from "../../navigation/routes";
import { useAppDependencies } from "../../providers/dependencies-provider";

export function useProfileEntryRoute(authStatus: AuthSessionStatus) {
  const { profileRepository } = useAppDependencies();
  const [isCheckingProfile, setIsCheckingProfile] = useState(authStatus === "signedIn");
  const [hasSubmittedProfile, setHasSubmittedProfile] = useState(false);

  useEffect(() => {
    if (authStatus !== "signedIn") {
      setIsCheckingProfile(false);
      setHasSubmittedProfile(false);
      return;
    }

    let active = true;
    setIsCheckingProfile(true);

    void profileRepository.hasSubmittedProfile().then((isSubmitted) => {
      if (active) {
        setHasSubmittedProfile(isSubmitted);
        setIsCheckingProfile(false);
      }
    });

    return () => {
      active = false;
    };
  }, [authStatus, profileRepository]);

  if (authStatus === "loading" || (authStatus === "signedIn" && isCheckingProfile)) {
    return null;
  }

  if (authStatus === "signedOut") {
    return routes.login;
  }

  return hasSubmittedProfile ? routes.jamaahs : routes.profileSetup;
}
