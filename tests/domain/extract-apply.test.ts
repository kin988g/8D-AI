import { describe, expect, it } from "vitest";
import { createEmptyCase, userField } from "@/domain/case-schema";
import { dropUnsourcedValue } from "@/domain/extract-guard";
import { applyExtractedFacts } from "@/server/llm";

describe("applyExtractedFacts", () => {
  it("不覆盖用户已确认字段，丢弃原文没有的批次", () => {
    const c = createEmptyCase("x", "2026-01-01T00:00:00.000Z");
    c.complaintText = "客户B投诉外观划伤，数量不详。";
    c.customer = userField("客户B");
    const next = applyExtractedFacts(c, {
      customer: "客户X",
      partNumber: "LOT-99881",
      partName: "",
      defect: "外观划伤",
      what: "外观划伤",
      where: "",
      when: "",
      who: "",
      how: "",
      howMany: "18",
    });
    expect(next.customer.value).toBe("客户B");
    expect(next.defect.value).toBe("外观划伤");
    expect(dropUnsourcedValue("LOT-99881", c.complaintText)).toBe("");
    expect(dropUnsourcedValue("18", c.complaintText)).toBe("");
  });
});
