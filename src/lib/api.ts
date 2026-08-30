import type { EightDCase } from "@/domain/case-schema";
import type { Finding } from "@/domain/review";

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || res.statusText);
    (err as Error & { payload?: unknown }).payload = data;
    throw err;
  }
  return data as T;
}

export async function listCases() {
  const data = await parse<{ cases: EightDCase[] }>(await fetch("/api/cases", { cache: "no-store" }));
  return data.cases;
}

export async function createCase(complaintText = "") {
  return parse<EightDCase>(
    await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintText }),
    }),
  );
}

export async function loadCase(id: string) {
  return parse<EightDCase>(await fetch(`/api/cases/${id}`, { cache: "no-store" }));
}

export async function saveCase(c: EightDCase) {
  return parse<EightDCase>(
    await fetch(`/api/cases/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    }),
  );
}

export async function extractCase(id: string, complaintText?: string) {
  return parse<{ case: EightDCase }>(
    await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, complaintText }),
    }),
  );
}

export async function rewriteCase(id: string) {
  return parse<EightDCase>(
    await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  );
}

export async function explainCase(id: string) {
  return parse<{ explanation: string }>(
    await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  );
}

export type GateError = { error: string; reasons?: Finding[] };

export function exportUrl(id: string, kind: "interim" | "final") {
  return `/api/export/${id}?kind=${kind}`;
}
