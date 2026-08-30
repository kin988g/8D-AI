import { NextResponse } from "next/server";
import { resolveSettings, settingsPublic, writeFileSettings } from "@/server/settings";

export async function GET() {
  return NextResponse.json(settingsPublic());
}

export async function PUT(req: Request) {
  const body = (await req.json()) as {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
  const current = resolveSettings();
  writeFileSettings({
    apiKey: body.apiKey?.trim() || current.apiKey,
    baseUrl: body.baseUrl?.trim() || current.baseUrl,
    model: body.model?.trim() || current.model,
  });
  return NextResponse.json(settingsPublic());
}
