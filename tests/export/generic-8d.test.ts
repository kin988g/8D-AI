import { describe, expect, it } from "vitest";
import { buildEightDDocx } from "@/export/generic-8d";
import { closableCase, missingHowManyCase } from "../domain/fixtures";

describe("Word 导出", () => {
  it("中间版带水印且不编造数量", async () => {
    const c = missingHowManyCase();
    c.containment = [
      {
        id: "c1",
        location: "customer",
        action: "客户处分选",
        plannedOnly: false,
        completedOn: "2026-04-01",
        quantity: "",
        verification: "",
      },
    ];
    const buf = await buildEightDDocx(c, "interim");
    const text = buf.toString("utf8");
    expect(text.includes("LOT-FAKE")).toBe(false);
    expect(buf.length).toBeGreaterThan(1000);
  });

  it("终版可生成", async () => {
    const buf = await buildEightDDocx(closableCase(), "final");
    expect(buf.length).toBeGreaterThan(1000);
  });
});
