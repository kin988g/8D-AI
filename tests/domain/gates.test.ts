import { describe, expect, it } from "vitest";
import { buildCollectionCard } from "@/domain/collection-card";
import { unsourcedTokens } from "@/domain/extract-guard";
import {
  applyRequestedStatus,
  canClose,
  canExportFinal,
  canExportInterim,
} from "@/domain/gates";
import { reviewCase } from "@/domain/review";
import {
  closableCase,
  humanCauseCase,
  missingHowManyCase,
  noEscapeCase,
  plannedContainmentCase,
} from "./fixtures";

describe("假闭环金样：人因 + 培训对策", () => {
  it("预审打出人因和弱对策红灯", () => {
    const findings = reviewCase(humanCauseCase());
    const codes = findings.map((f) => f.code);
    expect(codes).toContain("HUMAN_CAUSE");
    expect(codes).toContain("WEAK_PCA");
  });

  it("不能标 ready_final 或 closed", () => {
    const c = humanCauseCase();
    expect(canExportFinal(c).allowed).toBe(false);
    expect(canClose(c).allowed).toBe(false);
    expect(applyRequestedStatus(c, "closed").case.status).toBe("draft_d3");
    expect(applyRequestedStatus(c, "ready_final").case.status).toBe("draft_d3");
  });
});

describe("假闭环金样：只有发生没有流出", () => {
  it("预审要求补流出原因", () => {
    const codes = reviewCase(noEscapeCase()).map((f) => f.code);
    expect(codes).toContain("NO_ESCAPE_CAUSE");
  });

  it("不能出终版", () => {
    expect(canExportFinal(noEscapeCase()).allowed).toBe(false);
  });
});

describe("假闭环金样：遏制计划中", () => {
  it("D3 计划中为红灯且不能导出中间版", () => {
    const c = plannedContainmentCase();
    expect(reviewCase(c).some((f) => f.code === "D3_PLANNED_ONLY")).toBe(true);
    expect(canExportInterim(c).allowed).toBe(false);
  });
});

describe("缺口与采集卡", () => {
  it("缺少 How many 时给出黄灯和采集问题", () => {
    const c = missingHowManyCase();
    expect(reviewCase(c).some((f) => f.message.includes("不良数量"))).toBe(true);
    const card = buildCollectionCard(c);
    expect(card.some((i) => i.count.includes("批次"))).toBe(true);
  });
});

describe("合格案件", () => {
  it("可导出中间版、终版并关闭", () => {
    const c = closableCase();
    expect(canExportInterim(c).allowed).toBe(true);
    expect(canExportFinal(c).allowed).toBe(true);
    expect(canClose(c).allowed).toBe(true);
    expect(applyRequestedStatus(c, "closed").case.status).toBe("closed");
  });
});

describe("抽取护栏", () => {
  it("原文没有的批次号必须丢弃", () => {
    const source = "客户投诉支架弯曲，数量不详。";
    expect(unsourcedTokens("批次 LOT-99881 不良 18 件", source)).toContain(
      "LOT-99881",
    );
  });

  it("原文里出现的数字予以保留", () => {
    const source = "4月1日发现18件不良，共240件。";
    expect(unsourcedTokens("18件/240件", source)).toEqual([]);
  });
});
