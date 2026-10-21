import "server-only";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requestsByKey = new Map<string, RateLimitEntry>();

export function isRateLimited(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number,
) {
  const forwardedFor =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const key = `${namespace}:${ip}`;
  const now = Date.now();
  const entry = requestsByKey.get(key);

  if (!entry || entry.resetAt <= now) {
    requestsByKey.set(key, { count: 1, resetAt: now + windowMs });
  } else if (entry.count >= limit) {
    return true;
  } else {
    entry.count += 1;
  }

  if (requestsByKey.size > 5_000) {
    for (const [entryKey, value] of requestsByKey) {
      if (value.resetAt <= now) requestsByKey.delete(entryKey);
    }
  }

  return false;
}
