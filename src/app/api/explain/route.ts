import { NextResponse } from "next/server";
import { getCase } from "@/server/cases-repo";
import { reviewCase } from "@/domain/review";
import { explainFindings, llmConfigured } from "@/server/llm";

export async function POST(req: Request) {
  if (!llmConfigured()) {
    return NextResponse.json({ error: "LLM_NOT_CONFIGURED" }, { status: 400 });
  }
  const { id } = (await req.json()) as { id?: string };
  const existing = id ? getCase(id) : null;
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const text = await explainFindings(reviewCase(existing));
  return NextResponse.json({ explanation: text });
}
