import { NextResponse } from "next/server";
import { createCase, listCases } from "@/server/cases-repo";

export async function GET() {
  return NextResponse.json({ cases: listCases() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { complaintText?: string };
  const created = createCase(body.complaintText ?? "");
  return NextResponse.json(created);
}
