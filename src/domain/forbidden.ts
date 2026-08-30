/** Phrases that mean the writer blamed a person instead of the system. */
export const HUMAN_CAUSE_PATTERNS = [
  /操作工/,
  /作业员/,
  /员工疏忽/,
  /质量意识/,
  /人为失误/,
  /人为疏忽/,
  /漏检/,
  /检验员/,
  /不认真/,
  /未按sop/i,
  /未按作业/,
  /operator\s+(error|mistake|negligence)/i,
  /human\s+error/i,
  /lack of quality awareness/i,
];

export const WEAK_ACTION_PATTERNS = [
  /加强培训/,
  /加强巡检/,
  /加强检验/,
  /提高.*意识/,
  /100%\s*全检/,
  /百分之百全检/,
  /re-?train/i,
  /additional (visual )?inspect/i,
  /100%\s*sort/i,
];

export const PLANNED_ONLY_PATTERNS = [
  /将于/,
  /计划中/,
  /预计/,
  /will (be )?(complete|execute|perform)/i,
];

export function matchesAny(text: string, patterns: RegExp[]): boolean {
  const t = text.trim();
  if (!t) return false;
  return patterns.some((p) => p.test(t));
}

export function isHumanCause(text: string): boolean {
  return matchesAny(text, HUMAN_CAUSE_PATTERNS);
}

export function isWeakAction(text: string): boolean {
  return matchesAny(text, WEAK_ACTION_PATTERNS);
}

export function isPlannedOnlyWording(text: string): boolean {
  return matchesAny(text, PLANNED_ONLY_PATTERNS);
}
