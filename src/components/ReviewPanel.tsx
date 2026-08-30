"use client";

import type { EightDCase } from "@/domain/case-schema";
import { canExportFinal, canExportInterim } from "@/domain/gates";
import { redCount, reviewCase, yellowCount } from "@/domain/review";
import { exportUrl } from "@/lib/api";

export function ReviewPanel({
  c,
  explanation,
  onExplain,
  busy,
}: {
  c: EightDCase;
  explanation: string;
  onExplain: () => void;
  busy?: boolean;
}) {
  const findings = reviewCase(c);
  const reds = redCount(findings);
  const yellows = yellowCount(findings);
  const interim = canExportInterim(c);
  const final = canExportFinal(c);

  return (
    <aside className="space-y-3 rounded-xl border border-stone-300 bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">预审</h2>
        <div className="text-sm">
          <span className="text-[var(--red)]">{reds} 红</span>
          <span className="mx-1 text-stone-400">/</span>
          <span className="text-[var(--yellow)]">{yellows} 黄</span>
        </div>
      </div>
      <ul className="max-h-64 space-y-2 overflow-auto text-sm">
        {findings.length === 0 && <li className="text-stone-500">暂无红黄灯。仍须人确认现场事实。</li>}
        {findings.map((f) => (
          <li
            key={f.id}
            className={f.severity === "red" ? "text-[var(--red)]" : "text-[var(--yellow)]"}
          >
            <span className="font-medium">{f.fieldHint} · </span>
            {f.message}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {interim.allowed ? (
          <a
            className="rounded-md bg-stone-800 px-3 py-1.5 text-sm text-white"
            href={exportUrl(c.id, "interim")}
          >
            导出中间版
          </a>
        ) : (
          <span className="rounded-md bg-stone-200 px-3 py-1.5 text-sm text-stone-500">
            中间版未解锁（需要已执行遏制）
          </span>
        )}
        {final.allowed ? (
          <a
            className="rounded-md bg-[var(--green)] px-3 py-1.5 text-sm text-white"
            href={exportUrl(c.id, "final")}
          >
            导出终版
          </a>
        ) : (
          <span className="rounded-md bg-stone-200 px-3 py-1.5 text-sm text-stone-500">
            终版被门禁拦住
          </span>
        )}
        <button
          type="button"
          onClick={onExplain}
          disabled={busy}
          className="rounded-md border border-stone-400 px-3 py-1.5 text-sm"
        >
          {busy ? "解释中…" : "用大白话解释红灯"}
        </button>
      </div>
      {explanation && (
        <pre className="whitespace-pre-wrap rounded-md bg-stone-100 p-3 text-sm text-stone-700">
          {explanation}
        </pre>
      )}
    </aside>
  );
}
