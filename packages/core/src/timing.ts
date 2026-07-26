const ACTIVE_WINDOW_MINUTES = 5;

export function getJamaahPhase(startsAtIso: string, nowIso: string) {
  const startsAt = new Date(startsAtIso).getTime();
  const now = new Date(nowIso).getTime();
  const diffMs = startsAt - now;

  if (diffMs > 0) {
    return {
      phase: "scheduled" as const,
      minutesDelta: Math.ceil(diffMs / 60000),
    };
  }

  const elapsedMinutes = Math.floor(Math.abs(diffMs) / 60000);

  if (elapsedMinutes < ACTIVE_WINDOW_MINUTES) {
    return {
      phase: "active" as const,
      minutesDelta: elapsedMinutes,
    };
  }

  return {
    phase: "concluded" as const,
    minutesDelta: elapsedMinutes,
  };
}

export function shouldConclude(startsAtIso: string, nowIso: string) {
  return getJamaahPhase(startsAtIso, nowIso).phase === "concluded";
}
