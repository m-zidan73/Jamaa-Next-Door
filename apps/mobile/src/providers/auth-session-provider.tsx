import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Linking from "expo-linking";
import { parseAuthCallback } from "../features/auth/auth-callback";
import { useAppDependencies } from "./dependencies-provider";

export type AuthSessionStatus = "loading" | "signedIn" | "signedOut";

type AuthSessionContextValue = {
  callbackError: string | null;
  status: AuthSessionStatus;
};

const AuthSessionContext = createContext<AuthSessionContextValue>({
  callbackError: null,
  status: "signedOut",
});

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const { authRepository } = useAppDependencies();
  const [status, setStatus] = useState<AuthSessionStatus>("loading");
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const processedUrls = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    let bootstrapComplete = false;

    const unsubscribeFromSession = authRepository.subscribeToSession((isAuthenticated) => {
      if (active && bootstrapComplete) {
        setStatus(isAuthenticated ? "signedIn" : "signedOut");
      }
    });

    async function processUrl(url: string) {
      if (processedUrls.current.has(url)) {
        return { handled: true, isAuthenticated: false, errorMessage: null };
      }
      processedUrls.current.add(url);

      if (parseAuthCallback(url).type !== "none") {
        setCallbackError(null);
        setStatus("loading");
      }

      const result = await authRepository.completeSignInFromUrl(url);
      if (!active || !result.handled) {
        return result;
      }

      setCallbackError(result.errorMessage);
      if (result.errorMessage) {
        setStatus((current) => (current === "loading" ? "signedOut" : current));
      } else {
        setStatus(result.isAuthenticated ? "signedIn" : "signedOut");
      }
      return result;
    }

    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      void processUrl(url);
    });

    void (async () => {
      const initialUrl = await Linking.getInitialURL();
      const callbackResult = initialUrl ? await processUrl(initialUrl) : null;

      if (!active) {
        return;
      }

      if (!callbackResult?.handled) {
        const restored = await authRepository.restoreSession();
        if (!active) {
          return;
        }
        setCallbackError(restored.errorMessage);
        setStatus(restored.isAuthenticated ? "signedIn" : "signedOut");
      }
      bootstrapComplete = true;
    })();

    return () => {
      active = false;
      linkSubscription.remove();
      unsubscribeFromSession();
    };
  }, [authRepository]);

  return (
    <AuthSessionContext.Provider value={{ callbackError, status }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
