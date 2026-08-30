import type { EightDCase, CaseStatus } from "./case-schema";
import { isWeakAction } from "./forbidden";
import { reviewCase, type Finding } from "./review";

export type GateDecision = {
  allowed: boolean;
  reasons: Finding[];
};

export function canExportInterim(c: EightDCase): GateDecision {
  const executed = c.containment.filter((x) => !x.plannedOnly && x.completedOn.trim());
  if (executed.length === 0) {
    return {
      allowed: false,
      reasons: [
        {
          id: "interim-d3",
          severity: "red",
          code: "D3_MISSING",
          message: "中间版至少要有一条已执行的遏制（完成日期不能空）。",
          fieldHint: "D3",
        },
      ],
    };
  }
  return { allowed: true, reasons: [] };
}

export function blockingRedsForFinal(c: EightDCase): Finding[] {
  return reviewCase(c).filter((f) => f.severity === "red");
}

export function canExportFinal(c: EightDCase): GateDecision {
  const reds = blockingRedsForFinal(c);
  const bothRca =
    c.occurrenceRca.statement.trim() &&
    c.escapeRca.statement.trim() &&
    c.occurrenceRca.verified &&
    c.escapeRca.verified;
  if (!bothRca) {
    reds.push({
      id: "final-rca",
      severity: "red",
      code: "RCA_NOT_VERIFIED",
      message: "终版要求发生原因和流出原因都已填写且已验证。",
      fieldHint: "D4",
    });
  }
  const strongPca = c.pca.some(
    (p) =>
      p.strength !== "training" &&
      p.strength !== "inspection" &&
      !isWeakAction(p.action),
  );
  if (!strongPca) {
    reds.push({
      id: "final-pca",
      severity: "red",
      code: "WEAK_PCA",
      message: "终版至少要有一条非培训、非纯加检的永久对策。",
      fieldHint: "D5",
    });
  }
  const hasNumericValidation =
    Boolean(c.validation.after.trim()) && /\d/.test(c.validation.after);
  if (!hasNumericValidation) {
    reds.push({
      id: "final-d6",
      severity: "red",
      code: "D6_NO_DATA",
      message: "终版 D6 必须有量化验证数据。",
      fieldHint: "D6",
    });
  }
  const unique = dedupe(reds);
  return { allowed: unique.length === 0, reasons: unique };
}

export function canClose(c: EightDCase): GateDecision {
  const final = canExportFinal(c);
  const reasons = [...final.reasons];
  if (c.containment.some((x) => !x.plannedOnly && x.completedOn && !c.validation.after)) {
    // already covered by D6
  }
  const preventionDone = c.prevention.some((p) => p.done && p.artifact.trim());
  if (!preventionDone) {
    reasons.push({
      id: "close-d7",
      severity: "red",
      code: "D7_MISSING",
      message: "关闭前至少勾一项已完成的体系更新（FMEA/控制计划/SOP 等）。",
      fieldHint: "D7",
    });
  }
  const unique = dedupe(reasons);
  return { allowed: unique.length === 0, reasons: unique };
}

export function allowedStatuses(c: EightDCase): CaseStatus[] {
  const statuses: CaseStatus[] = ["draft_d3", "in_progress"];
  if (canExportFinal(c).allowed) statuses.push("ready_final");
  if (canClose(c).allowed) statuses.push("closed");
  return statuses;
}

export function applyRequestedStatus(
  c: EightDCase,
  requested: CaseStatus,
): { case: EightDCase; decision: GateDecision } {
  if (requested === "closed") {
    const decision = canClose(c);
    return {
      case: decision.allowed ? { ...c, status: "closed" } : c,
      decision,
    };
  }
  if (requested === "ready_final") {
    const decision = canExportFinal(c);
    return {
      case: decision.allowed ? { ...c, status: "ready_final" } : c,
      decision,
    };
  }
  return { case: { ...c, status: requested }, decision: { allowed: true, reasons: [] } };
}

function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}
