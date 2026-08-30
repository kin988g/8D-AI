import OpenAI from "openai";
import { z } from "zod";
import { dropUnsourcedValue, unsourcedTokens } from "@/domain/extract-guard";
import type { EightDCase } from "@/domain/case-schema";
import type { Finding } from "@/domain/review";
import { resolveSettings } from "./settings";

const extractSchema = z.object({
  customer: z.string().optional().default(""),
  partNumber: z.string().optional().default(""),
  partName: z.string().optional().default(""),
  defect: z.string().optional().default(""),
  what: z.string().optional().default(""),
  where: z.string().optional().default(""),
  when: z.string().optional().default(""),
  who: z.string().optional().default(""),
  how: z.string().optional().default(""),
  howMany: z.string().optional().default(""),
});

export type ExtractedFacts = z.infer<typeof extractSchema>;

export function llmConfigured() {
  return Boolean(resolveSettings().apiKey);
}

function client() {
  const s = resolveSettings();
  if (!s.apiKey) throw new Error("LLM_NOT_CONFIGURED");
  return {
    openai: new OpenAI({ apiKey: s.apiKey, baseURL: s.baseUrl }),
    model: s.model,
  };
}

function guardFacts(facts: ExtractedFacts, source: string): ExtractedFacts {
  const next = { ...facts };
  for (const key of Object.keys(next) as (keyof ExtractedFacts)[]) {
    next[key] = dropUnsourcedValue(next[key] ?? "", source);
  }
  return next;
}

export async function extractFacts(complaintText: string): Promise<ExtractedFacts> {
  const { openai, model } = client();
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "从客诉原文抽取 8D D2 事实。只使用原文中明确出现的信息。原文没有的字段必须返回空字符串，禁止猜测批次、数量、日期、根因。输出 JSON：customer, partNumber, partName, defect, what, where, when, who, how, howMany。",
      },
      { role: "user", content: complaintText },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = extractSchema.parse(JSON.parse(raw));
  return guardFacts(parsed, complaintText);
}

export async function rewriteStatements(c: EightDCase): Promise<{
  zh: string;
  en: string;
}> {
  const { openai, model } = client();
  const facts = {
    customer: c.customer.value,
    part: c.partName.value || c.partNumber.value,
    what: c.problem.what.value || c.defect.value,
    where: c.problem.where.value,
    when: c.problem.when.value,
    howMany: c.problem.howMany.value,
  };
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "把已确认的 8D 事实改写成一句中文问题陈述和一句英文问题陈述。禁止添加、修改任何数字、日期、批次。不要写道歉，不要写根因。JSON：{zh, en}",
      },
      { role: "user", content: JSON.stringify(facts) },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = z.object({ zh: z.string(), en: z.string() }).parse(JSON.parse(raw));
  const source = Object.values(facts).join(" ");
  const zhTokens = unsourcedFromRewrite(parsed.zh, source);
  const enTokens = unsourcedFromRewrite(parsed.en, source);
  if (zhTokens.length || enTokens.length) {
    const fallback = [facts.when, facts.where, facts.part, facts.what, facts.howMany]
      .filter(Boolean)
      .join("，");
    return { zh: fallback, en: fallback };
  }
  return parsed;
}

function unsourcedFromRewrite(text: string, source: string) {
  return unsourcedTokens(text, source).filter((t) => /[A-Za-z]/.test(t) || t.length >= 3);
}

export async function explainFindings(findings: Finding[]): Promise<string> {
  const { openai, model } = client();
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "你是客户 SQE。用大白话解释这些红黄灯为什么会被退件，以及今晚该去现场问什么、拍什么、数什么。不要编造数据，不要给出发根因结论。用中文，分条。",
      },
      { role: "user", content: JSON.stringify(findings) },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

export function applyExtractedFacts(c: EightDCase, facts: ExtractedFacts): EightDCase {
  const next = structuredClone(c);
  const assign = (
    current: { value: string; source: "user" | "extracted" | "unknown" },
    incoming: string,
  ) => {
    if (!incoming.trim()) return current;
    if (current.source === "user" && current.value.trim()) return current;
    return { value: incoming, source: "extracted" as const };
  };
  next.customer = assign(next.customer, facts.customer);
  next.partNumber = assign(next.partNumber, facts.partNumber);
  next.partName = assign(next.partName, facts.partName);
  next.defect = assign(next.defect, facts.defect);
  next.problem.what = assign(next.problem.what, facts.what || facts.defect);
  next.problem.where = assign(next.problem.where, facts.where);
  next.problem.when = assign(next.problem.when, facts.when);
  next.problem.who = assign(next.problem.who, facts.who);
  next.problem.how = assign(next.problem.how, facts.how);
  next.problem.howMany = assign(next.problem.howMany, facts.howMany);
  return next;
}
