const processed = new Map<string, number>();
const COOLDOWN_MS = 15000;

export function isRateLimited(id: string): boolean {
  const now = Date.now();
  const last = processed.get(id) || 0;

  if (now - last < COOLDOWN_MS) {
    return true;
  }

  processed.set(id, now);
  return false;
}