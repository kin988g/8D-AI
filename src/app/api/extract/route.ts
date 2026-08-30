import { NextResponse } from "next/server";
import { getCase, saveCase } from "@/server/cases-repo";
import { applyExtractedFacts, extractFacts, llmConfigured } from "@/server/llm";

export async function POST(req: Request) {
  if (!llmConfigured()) {
    return NextResponse.json({ error: "LLM_NOT_CONFIGURED" }, { status: 400 });
  }
  const body = (await req.json()) as { id?: string; complaintText?: string };
  const existing = body.id ? getCase(body.id) : null;
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const text = body.complaintText ?? existing.complaintText;
  const facts = await extractFacts(text);
  const next = applyExtractedFacts(
    { ...existing, complaintText: text },
    facts,
  );
  return NextResponse.json({ case: saveCase(next), facts });
}
