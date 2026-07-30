import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDependencies } from "../../providers/dependencies-provider";

const KEY = ["jamaahs", "discoverable"];

export function useJamaahDiscovery() {
  const { jamaahRepository } = useAppDependencies();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const result = await jamaahRepository.fetchDiscoverableJamaahs();
      if (result.errorMessage) throw new Error(result.errorMessage);
      return result.data ?? [];
    },
  });

  useEffect(() => jamaahRepository.subscribeToChanges(() => {
    void queryClient.invalidateQueries({ queryKey: KEY });
  }), [jamaahRepository, queryClient]);

  return { ...query, refresh: query.refetch };
}
