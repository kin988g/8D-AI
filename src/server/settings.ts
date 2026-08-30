import fs from "node:fs";
import path from "node:path";

export type LlmSettings = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

const SETTINGS_PATH = path.join(process.cwd(), "data", "llm-settings.json");

export function readFileSettings(): Partial<LlmSettings> {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf8");
    return JSON.parse(raw) as Partial<LlmSettings>;
  } catch {
    return {};
  }
}

export function writeFileSettings(input: LlmSettings) {
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(input, null, 2), "utf8");
}

export function resolveSettings(): LlmSettings {
  const file = readFileSettings();
  return {
    apiKey: file.apiKey || process.env.OPENAI_API_KEY || "",
    baseUrl: file.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: file.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
  };
}

export function settingsPublic() {
  const s = resolveSettings();
  return {
    configured: Boolean(s.apiKey),
    baseUrl: s.baseUrl,
    model: s.model,
    apiKeyMasked: s.apiKey ? `${s.apiKey.slice(0, 3)}…${s.apiKey.slice(-4)}` : "",
  };
}
