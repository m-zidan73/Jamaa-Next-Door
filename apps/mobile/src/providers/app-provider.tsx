import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { i18n } from "../lib/i18n";
import { DependenciesProvider } from "./dependencies-provider";

const queryClient = new QueryClient();

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <DependenciesProvider>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </DependenciesProvider>
  );
}
