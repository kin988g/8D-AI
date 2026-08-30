import { z } from "zod";

export const fieldSourceSchema = z.enum(["user", "extracted", "unknown"]);
export type FieldSource = z.infer<typeof fieldSourceSchema>;

export const fieldSchema = z.object({
  value: z.string(),
  source: fieldSourceSchema,
});
export type Field = z.infer<typeof fieldSchema>;

export function emptyField(): Field {
  return { value: "", source: "unknown" };
}

export function userField(value: string): Field {
  return { value, source: "user" };
}

export const severitySchema = z.enum(["low", "medium", "high", "safety"]);
export type Severity = z.infer<typeof severitySchema>;

export const caseStatusSchema = z.enum([
  "draft_d3",
  "in_progress",
  "ready_final",
  "closed",
]);
export type CaseStatus = z.infer<typeof caseStatusSchema>;

export const containmentLocationSchema = z.enum([
  "customer",
  "in_transit",
  "finished_goods",
  "line_side",
]);
export type ContainmentLocation = z.infer<typeof containmentLocationSchema>;

export const pcaTargetSchema = z.enum(["occurrence", "escape"]);
export type PcaTarget = z.infer<typeof pcaTargetSchema>;

export const pcaStrengthSchema = z.enum([
  "poka_yoke",
  "process",
  "system",
  "training",
  "inspection",
]);
export type PcaStrength = z.infer<typeof pcaStrengthSchema>;

export const whyStepSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type WhyStep = z.infer<typeof whyStepSchema>;

export const rcaSchema = z.object({
  statement: z.string(),
  whys: z.array(whyStepSchema),
  verified: z.boolean(),
  evidence: z.string(),
});
export type Rca = z.infer<typeof rcaSchema>;

export const containmentSchema = z.object({
  id: z.string(),
  location: containmentLocationSchema,
  action: z.string(),
  plannedOnly: z.boolean(),
  completedOn: z.string(),
  quantity: z.string(),
  verification: z.string(),
});
export type Containment = z.infer<typeof containmentSchema>;

export const pcaSchema = z.object({
  id: z.string(),
  target: pcaTargetSchema,
  action: z.string(),
  strength: pcaStrengthSchema,
  owner: z.string(),
  dueOn: z.string(),
});
export type Pca = z.infer<typeof pcaSchema>;

export const preventionSchema = z.object({
  id: z.string(),
  artifact: z.string(),
  done: z.boolean(),
});
export type Prevention = z.infer<typeof preventionSchema>;

export const isIsNotRowSchema = z.object({
  dimension: z.string(),
  is: z.string(),
  isNot: z.string(),
});
export type IsIsNotRow = z.infer<typeof isIsNotRowSchema>;

export const problemSchema = z.object({
  what: fieldSchema,
  where: fieldSchema,
  when: fieldSchema,
  who: fieldSchema,
  how: fieldSchema,
  howMany: fieldSchema,
  whyHypothesis: fieldSchema,
  isIsNot: z.array(isIsNotRowSchema),
  statementZh: z.string(),
  statementEn: z.string(),
});
export type Problem = z.infer<typeof problemSchema>;

export const validationSchema = z.object({
  metric: z.string(),
  before: z.string(),
  after: z.string(),
  period: z.string(),
});
export type Validation = z.infer<typeof validationSchema>;

export const caseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  complaintText: z.string(),
  customer: fieldSchema,
  partNumber: fieldSchema,
  partName: fieldSchema,
  defect: fieldSchema,
  severity: severitySchema,
  slaHoursD3: z.number().int().positive(),
  team: z.array(z.string()),
  problem: problemSchema,
  containment: z.array(containmentSchema),
  occurrenceRca: rcaSchema,
  escapeRca: rcaSchema,
  pca: z.array(pcaSchema),
  validation: validationSchema,
  prevention: z.array(preventionSchema),
  status: caseStatusSchema,
});
export type EightDCase = z.infer<typeof caseSchema>;

export function emptyRca(): Rca {
  return { statement: "", whys: [], verified: false, evidence: "" };
}

export function emptyProblem(): Problem {
  return {
    what: emptyField(),
    where: emptyField(),
    when: emptyField(),
    who: emptyField(),
    how: emptyField(),
    howMany: emptyField(),
    whyHypothesis: emptyField(),
    isIsNot: [
      { dimension: "What", is: "", isNot: "" },
      { dimension: "Where", is: "", isNot: "" },
      { dimension: "When", is: "", isNot: "" },
      { dimension: "How many", is: "", isNot: "" },
    ],
    statementZh: "",
    statementEn: "",
  };
}

export function emptyValidation(): Validation {
  return { metric: "", before: "", after: "", period: "" };
}

export function createEmptyCase(id: string, now: string): EightDCase {
  return {
    id,
    createdAt: now,
    updatedAt: now,
    complaintText: "",
    customer: emptyField(),
    partNumber: emptyField(),
    partName: emptyField(),
    defect: emptyField(),
    severity: "medium",
    slaHoursD3: 24,
    team: [],
    problem: emptyProblem(),
    containment: [],
    occurrenceRca: emptyRca(),
    escapeRca: emptyRca(),
    pca: [],
    validation: emptyValidation(),
    prevention: [],
    status: "draft_d3",
  };
}

export const LOCATION_LABELS: Record<ContainmentLocation, string> = {
  customer: "客户现场",
  in_transit: "在途",
  finished_goods: "成品仓",
  line_side: "线边/在制",
};

export const STRENGTH_LABELS: Record<PcaStrength, string> = {
  poka_yoke: "防错/工程控制",
  process: "工艺/材料变更",
  system: "制度/标准",
  training: "培训",
  inspection: "加检/全检",
};
