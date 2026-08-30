/**
 * Reject model-invented numbers, dates, and lot-like tokens
 * that do not appear in the source complaint text.
 */

const TOKEN_RE =
  /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|[A-Za-z]+[-_][A-Za-z0-9-]*\d[A-Za-z0-9-]*|\d+(?:\.\d+)?%?/g;

export function tokensThatNeedSource(text: string): string[] {
  const found = text.match(TOKEN_RE) ?? [];
  return [...new Set(found.map((t) => t.trim()).filter(Boolean))];
}

export function normalizeForMatch(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

export function tokenInSource(token: string, source: string): boolean {
  const src = normalizeForMatch(source);
  const tok = normalizeForMatch(token);
  if (!tok) return true;
  return src.includes(tok);
}

export function unsourcedTokens(candidate: string, source: string): string[] {
  if (!candidate.trim()) return [];
  return tokensThatNeedSource(candidate).filter((t) => !tokenInSource(t, source));
}

export function dropUnsourcedValue(value: string, source: string): string {
  if (!value.trim()) return "";
  if (unsourcedTokens(value, source).length > 0) return "";
  return value;
}
