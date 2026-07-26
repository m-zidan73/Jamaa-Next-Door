import type { JamaahParticipant, JamaahRecord } from "./types";

export function selectNextHost(participants: JamaahParticipant[]) {
  const active = participants
    .filter((participant) => participant.isActive)
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

  const preferredSecondary = active.find((participant) => participant.wasSecondaryHost);
  return preferredSecondary ?? active[0] ?? null;
}

export function transferHostOnLeave(jamaah: JamaahRecord, participants: JamaahParticipant[]) {
  const nextHost = selectNextHost(participants);

  return {
    nextHostProfileId: nextHost?.profileId ?? null,
    shouldNotify: Boolean(nextHost),
    nextStatus: jamaah.status,
  };
}
