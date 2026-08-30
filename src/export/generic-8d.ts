import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
} from "docx";
import type { EightDCase } from "@/domain/case-schema";
import { LOCATION_LABELS, STRENGTH_LABELS } from "@/domain/case-schema";

export type ExportKind = "interim" | "final";

function cell(text: string, width = 4680) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
  });
}

function kv(label: string, value: string) {
  return new TableRow({ children: [cell(label, 2400), cell(value || "（待补充）", 6960)] });
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true })],
  });
}

export async function buildEightDDocx(c: EightDCase, kind: ExportKind): Promise<Buffer> {
  const watermark =
    kind === "interim"
      ? "中间版 / INTERIM — 含待验证字段，不得视为结案"
      : "终版 / FINAL";

  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: "8D 报告 / 8D Report", bold: true })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: watermark,
          bold: true,
          color: kind === "interim" ? "B42318" : "157347",
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `案件 ${c.id}  ·  状态 ${c.status}  ·  D3时效 ${c.slaHoursD3}h`,
          italics: true,
        }),
      ],
    }),
    heading("D0–D2 问题 / Problem"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        kv("客户 Customer", c.customer.value),
        kv("零件 Part", `${c.partNumber.value} ${c.partName.value}`.trim()),
        kv("缺陷 Defect", c.defect.value || c.problem.what.value),
        kv("Where", c.problem.where.value),
        kv("When", c.problem.when.value),
        kv("How many", c.problem.howMany.value),
        kv("问题陈述 ZH", c.problem.statementZh),
        kv("Problem statement EN", c.problem.statementEn),
      ],
    }),
    heading("D1 团队 / Team"),
    new Paragraph({ text: c.team.filter(Boolean).join("、") || "（待补充）" }),
    heading("D3 临时遏制 / Interim containment"),
    ...c.containment.map(
      (x) =>
        new Paragraph({
          text: `[${LOCATION_LABELS[x.location]}] ${x.action} · 完成日 ${x.completedOn || "未完成"} · 数量 ${x.quantity || "—"} · 验证 ${x.verification || "—"}`,
        }),
    ),
    ...(c.containment.length === 0
      ? [new Paragraph({ text: "（尚无遏制记录）" })]
      : []),
    heading("D4 发生原因 / Occurrence"),
    new Paragraph({ text: c.occurrenceRca.statement || "（中间版可暂缺，终版必填）" }),
    new Paragraph({
      text: `已验证: ${c.occurrenceRca.verified ? "是" : "否"}  证据: ${c.occurrenceRca.evidence || "—"}`,
    }),
    heading("D4 流出原因 / Escape"),
    new Paragraph({ text: c.escapeRca.statement || "（中间版可暂缺，终版必填）" }),
    new Paragraph({
      text: `已验证: ${c.escapeRca.verified ? "是" : "否"}  证据: ${c.escapeRca.evidence || "—"}`,
    }),
    heading("D5 永久对策 / PCA"),
    ...c.pca.map(
      (p) =>
        new Paragraph({
          text: `[${p.target}] ${STRENGTH_LABELS[p.strength]} · ${p.action} · ${p.owner} · ${p.dueOn}`,
        }),
    ),
    ...(c.pca.length === 0 ? [new Paragraph({ text: "（待制定）" })] : []),
    heading("D6 验证 / Validation"),
    new Paragraph({
      text: `${c.validation.metric || "指标未定"}  改善前 ${c.validation.before || "—"}  改善后 ${c.validation.after || "—"}  周期 ${c.validation.period || "—"}`,
    }),
    heading("D7 预防 / Prevention"),
    ...c.prevention.map(
      (p) => new Paragraph({ text: `${p.done ? "[已完成]" : "[未完成]"} ${p.artifact}` }),
    ),
    ...(c.prevention.length === 0
      ? [new Paragraph({ text: "（待更新 FMEA / 控制计划 / SOP）" })]
      : []),
    heading("客诉原文"),
    new Paragraph({ text: c.complaintText || "—" }),
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
