import type { DiscoverableJamaah } from "../../ports/jamaah-repository";

export function selectUpcomingJamaahs(items: DiscoverableJamaah[], now: number) {
  return items
    .filter((item) => new Date(item.starts_at).getTime() > now)
    .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime());
}
