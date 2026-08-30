import { NextResponse } from "next/server";
import { getCase, saveCase } from "@/server/cases-repo";
import { llmConfigured, rewriteStatements } from "@/server/llm";

export async function POST(req: Request) {
  if (!llmConfigured()) {
    return NextResponse.json({ error: "LLM_NOT_CONFIGURED" }, { status: 400 });
  }
  const { id } = (await req.json()) as { id?: string };
  const existing = id ? getCase(id) : null;
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const rewritten = await rewriteStatements(existing);
  existing.problem.statementZh = rewritten.zh;
  existing.problem.statementEn = rewritten.en;
  return NextResponse.json(saveCase(existing));
}
