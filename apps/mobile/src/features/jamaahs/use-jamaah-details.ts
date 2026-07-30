import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDependencies } from "../../providers/dependencies-provider";

export function useJamaahDetails(jamaahId: string) {
  const { jamaahRepository } = useAppDependencies();
  const queryClient = useQueryClient();
  const key = ["jamaahs", "details", jamaahId];
  const [actionError, setActionError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const query = useQuery({
    enabled: Boolean(jamaahId),
    queryKey: key,
    queryFn: async () => {
      const result = await jamaahRepository.fetchJamaahDetails(jamaahId);
      if (result.errorMessage) throw new Error(result.errorMessage);
      return result.data;
    },
  });

  useEffect(() => jamaahRepository.subscribeToChanges(() => {
    void queryClient.invalidateQueries({ queryKey: ["jamaahs", "details", jamaahId] });
  }), [jamaahRepository, queryClient, jamaahId]);

  async function run(action: () => Promise<{ data: true | null; errorMessage: string | null }>) {
    if (acting) return;
    setActing(true);
    setActionError(null);
    const result = await action();
    setActing(false);
    if (result.errorMessage) setActionError(result.errorMessage);
    else {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        queryClient.invalidateQueries({ queryKey: ["jamaahs", "discoverable"] }),
      ]);
    }
  }

  return {
    ...query,
    acting,
    actionError,
    join: () => run(() => jamaahRepository.joinJamaah(jamaahId)),
    cancel: () => run(() => jamaahRepository.cancelJamaah(jamaahId)),
    conclude: () => run(() => jamaahRepository.concludeJamaah(jamaahId)),
  };
}
