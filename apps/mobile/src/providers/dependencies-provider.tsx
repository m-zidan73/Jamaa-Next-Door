import { createContext, type PropsWithChildren, useContext } from "react";
import { appDependencies, type AppDependencies } from "../services/app-dependencies";

const DependenciesContext = createContext<AppDependencies>(appDependencies);

type DependenciesProviderProps = PropsWithChildren<{
  value?: AppDependencies;
}>;

export function DependenciesProvider({ children, value = appDependencies }: DependenciesProviderProps) {
  return <DependenciesContext.Provider value={value}>{children}</DependenciesContext.Provider>;
}

export function useAppDependencies() {
  return useContext(DependenciesContext);
}
