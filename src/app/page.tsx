"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EightDCase } from "@/domain/case-schema";
import { createCase, listCases } from "@/lib/api";

export default function HomePage() {
  const [cases, setCases] = useState<EightDCase[]>([]);
  const [complaint, setComplaint] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setCases(await listCases());
  }

  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
  }, []);

  async function onCreate() {
    setBusy(true);
    setError("");
    try {
      const created = await createCase(complaint);
      window.location.href = `/cases/${created.id}?mode=wizard`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-stone-300 bg-[var(--card)] p-5">
        <h1 className="text-xl font-semibold">新建 8D 案件</h1>
        <p className="mt-1 text-sm text-stone-600">
          粘贴客户投诉。没有的数字不要编。工具先领你补缺口、做遏制，再谈根因。
        </p>
        <textarea
          className="mt-3 min-h-32 w-full rounded-md border border-stone-300 p-3 text-sm"
          placeholder="例如：4月1日客户A来料检发现左外侧支架焊缘内弯，数量待确认……"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
        />
        <button
          type="button"
          onClick={onCreate}
          disabled={busy}
          className="mt-3 rounded-md bg-stone-900 px-4 py-2 text-sm text-white"
        >
          {busy ? "创建中…" : "开始（默认向导）"}
        </button>
        {error && <p className="mt-2 text-sm text-[var(--red)]">{error}</p>}
      </section>

      <section>
        <h2 className="mb-3 font-medium">案件列表</h2>
        <div className="divide-y divide-stone-200 rounded-xl border border-stone-300 bg-[var(--card)]">
          {cases.length === 0 && (
            <p className="p-4 text-sm text-stone-500">还没有案件。</p>
          )}
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex items-center justify-between p-4 hover:bg-stone-50"
            >
              <div>
                <div className="font-medium">
                  {c.customer.value || "未填客户"} · {c.defect.value || c.problem.what.value || "未填缺陷"}
                </div>
                <div className="text-xs text-stone-500">{c.id}</div>
              </div>
              <span className="text-sm text-stone-500">{c.status}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
