export function formatCountdown(startsAt: string, now = Date.now()) {
  const seconds = Math.max(0, Math.ceil((new Date(startsAt).getTime() - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${remainder}s`;
}
