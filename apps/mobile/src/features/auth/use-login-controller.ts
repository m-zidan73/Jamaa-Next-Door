import { useState } from "react";
import { useAppDependencies } from "../../providers/dependencies-provider";

const CONFIGURATION_MESSAGE = "Configure Supabase credentials in .env before testing authentication.";
const SUCCESS_MESSAGE = "Magic link sent. Continue with profile setup after signing in.";

export function useLoginController() {
  const { authRepository } = useAppDependencies();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendMagicLink() {
    if (!authRepository.isConfigured) {
      setMessage(CONFIGURATION_MESSAGE);
      return;
    }

    setLoading(true);
    const result = await authRepository.sendMagicLink(email);
    setLoading(false);
    setMessage(result.errorMessage ?? SUCCESS_MESSAGE);
  }

  return {
    email,
    loading,
    message,
    sendMagicLink,
    setEmail,
  };
}
