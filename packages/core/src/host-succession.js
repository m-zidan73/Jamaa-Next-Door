export function selectNextHost(participants) {
    const active = participants
        .filter((participant) => participant.isActive)
        .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    const preferredSecondary = active.find((participant) => participant.wasSecondaryHost);
    return preferredSecondary ?? active[0] ?? null;
}
export function transferHostOnLeave(jamaah, participants) {
    const nextHost = selectNextHost(participants);
    return {
        nextHostProfileId: nextHost?.profileId ?? null,
        shouldNotify: Boolean(nextHost),
        nextStatus: jamaah.status,
    };
}
