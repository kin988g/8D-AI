import type { EightDCase } from "./case-schema";
import { isHumanCause, isPlannedOnlyWording, isWeakAction } from "./forbidden";

export type FindingSeverity = "red" | "yellow";

export type Finding = {
  id: string;
  severity: FindingSeverity;
  code: string;
  message: string;
  fieldHint: string;
};

export function collectGaps(c: EightDCase): Finding[] {
  const gaps: Finding[] = [];
  const required: Array<[string, string, string]> = [
    ["customer", c.customer.value, "客户名称"],
    ["part", c.partNumber.value || c.partName.value, "零件号或零件名"],
    ["defect", c.defect.value || c.problem.what.value, "缺陷现象"],
    ["where", c.problem.where.value, "发现位置"],
    ["when", c.problem.when.value, "发现时间"],
    ["howMany", c.problem.howMany.value, "不良数量/比例"],
  ];
  for (const [id, value, label] of required) {
    if (!value.trim()) {
      gaps.push({
        id: `gap-${id}`,
        severity: "yellow",
        code: "MISSING_FACT",
        message: `还缺「${label}」。不要编造，去现场或系统里查。`,
        fieldHint: label,
      });
    }
  }
  return gaps;
}

export function reviewCase(c: EightDCase): Finding[] {
  const findings: Finding[] = [...collectGaps(c)];

  const executed = c.containment.filter((x) => !x.plannedOnly && x.completedOn.trim());
  if (c.containment.length === 0) {
    findings.push({
      id: "d3-missing",
      severity: "red",
      code: "D3_MISSING",
      message: "还没有临时遏制。先保护客户，再分析根因。",
      fieldHint: "D3",
    });
  } else if (executed.length === 0) {
    findings.push({
      id: "d3-planned",
      severity: "red",
      code: "D3_PLANNED_ONLY",
      message: "遏制写成「将于/计划中」且没有完成日。客户要的是已执行。",
      fieldHint: "D3",
    });
  }

  for (const item of c.containment) {
    if (
      (item.plannedOnly || isPlannedOnlyWording(item.action)) &&
      !item.completedOn.trim()
    ) {
      findings.push({
        id: `d3-wording-${item.id}`,
        severity: "red",
        code: "D3_PLANNED_ONLY",
        message: `遏制「${item.action || item.location}」没有完成日期。`,
        fieldHint: "D3",
      });
    }
  }

  if (isHumanCause(c.occurrenceRca.statement)) {
    findings.push({
      id: "human-occurrence",
      severity: "red",
      code: "HUMAN_CAUSE",
      message: "发生原因指向「人」。问：为什么系统允许这个错误发生？",
      fieldHint: "D4 发生原因",
    });
  }

  if (isHumanCause(c.escapeRca.statement)) {
    findings.push({
      id: "human-escape",
      severity: "red",
      code: "HUMAN_CAUSE",
      message: "流出原因指向「人」（如漏检）。问：检测标准、工装、抽样为什么拦不住？",
      fieldHint: "D4 流出原因",
    });
  }

  if (c.occurrenceRca.statement.trim() && !c.escapeRca.statement.trim()) {
    findings.push({
      id: "no-escape",
      severity: "red",
      code: "NO_ESCAPE_CAUSE",
      message: "只写了发生原因。客户会问：为什么检验系统没拦住？",
      fieldHint: "D4 流出原因",
    });
  }

  if (c.pca.length > 0) {
    const allWeak = c.pca.every(
      (p) =>
        p.strength === "training" ||
        p.strength === "inspection" ||
        isWeakAction(p.action),
    );
    if (allWeak) {
      findings.push({
        id: "weak-pca",
        severity: "red",
        code: "WEAK_PCA",
        message: "永久对策只剩培训或加检。这是遏制，不是根治。",
        fieldHint: "D5",
      });
    }
  }

  const hasNumericValidation =
    Boolean(c.validation.after.trim()) && /\d/.test(c.validation.after);
  if (
    (c.status === "ready_final" || c.status === "closed") &&
    !hasNumericValidation
  ) {
    findings.push({
      id: "d6-no-data",
      severity: "red",
      code: "D6_NO_DATA",
      message: "D6 没有量化结果。「效果良好」不能过关。",
      fieldHint: "D6",
    });
  }

  return uniqueFindings(findings);
}

function uniqueFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.code}:${f.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function redCount(findings: Finding[]): number {
  return findings.filter((f) => f.severity === "red").length;
}

export function yellowCount(findings: Finding[]): number {
  return findings.filter((f) => f.severity === "yellow").length;
}
