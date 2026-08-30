import { NextResponse } from "next/server";
import { canExportFinal, canExportInterim } from "@/domain/gates";
import { buildEightDDocx, type ExportKind } from "@/export/generic-8d";
import { getCase } from "@/server/cases-repo";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const found = getCase(id);
  if (!found) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const kind = (new URL(req.url).searchParams.get("kind") ?? "interim") as ExportKind;
  if (kind === "interim") {
    const gate = canExportInterim(found);
    if (!gate.allowed) {
      return NextResponse.json({ error: "GATE_BLOCKED", reasons: gate.reasons }, { status: 409 });
    }
  } else {
    const gate = canExportFinal(found);
    if (!gate.allowed) {
      return NextResponse.json({ error: "GATE_BLOCKED", reasons: gate.reasons }, { status: 409 });
    }
  }
  const buf = await buildEightDDocx(found, kind);
  const filename = `${found.id}-${kind}.docx`;
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
