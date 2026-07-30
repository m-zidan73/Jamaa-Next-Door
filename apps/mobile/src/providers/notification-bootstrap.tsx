import { type PropsWithChildren, useEffect } from "react";
import { useAuthSession } from "./auth-session-provider";
import { useAppDependencies } from "./dependencies-provider";

export function NotificationBootstrap({ children }: PropsWithChildren) {
  const { status } = useAuthSession();
  const { notificationRegistration } = useAppDependencies();

  useEffect(() => {
    if (status === "signedIn") {
      void notificationRegistration.registerAfterProfile();
    }
  }, [notificationRegistration, status]);

  return children;
}
