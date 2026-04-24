export function getIntSearchParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: number
) {
  const rawValue = searchParams.get(key);

  if (rawValue == null || rawValue.trim() === "") {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}