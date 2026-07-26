const ACTIVE_WINDOW_MINUTES = 5;
export function getJamaahPhase(startsAtIso, nowIso) {
    const startsAt = new Date(startsAtIso).getTime();
    const now = new Date(nowIso).getTime();
    const diffMs = startsAt - now;
    if (diffMs > 0) {
        return {
            phase: "scheduled",
            minutesDelta: Math.ceil(diffMs / 60000),
        };
    }
    const elapsedMinutes = Math.floor(Math.abs(diffMs) / 60000);
    if (elapsedMinutes < ACTIVE_WINDOW_MINUTES) {
        return {
            phase: "active",
            minutesDelta: elapsedMinutes,
        };
    }
    return {
        phase: "concluded",
        minutesDelta: elapsedMinutes,
    };
}
export function shouldConclude(startsAtIso, nowIso) {
    return getJamaahPhase(startsAtIso, nowIso).phase === "concluded";
}
