import { NextResponse } from "next/server";
import { caseSchema } from "@/domain/case-schema";
import { applyRequestedStatus } from "@/domain/gates";
import { getCase, saveCase } from "@/server/cases-repo";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const found = getCase(id);
  if (!found) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(found);
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = getCase(id);
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const body = await req.json();
  const parsed = caseSchema.parse({ ...existing, ...body, id });
  return NextResponse.json(saveCase(parsed));
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = getCase(id);
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const body = (await req.json()) as { status?: string };
  if (!body.status) return NextResponse.json({ error: "NO_STATUS" }, { status: 400 });
  const { case: next, decision } = applyRequestedStatus(
    existing,
    body.status as typeof existing.status,
  );
  if (!decision.allowed) {
    return NextResponse.json({ error: "GATE_BLOCKED", reasons: decision.reasons, case: existing }, { status: 409 });
  }
  return NextResponse.json(saveCase(next));
}
