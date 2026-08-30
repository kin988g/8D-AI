"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ReviewPanel } from "@/components/ReviewPanel";
import { Wizard } from "@/components/Wizard";
import { Workbench } from "@/components/Workbench";
import type { EightDCase } from "@/domain/case-schema";
import { explainCase, extractCase, loadCase, rewriteCase, saveCase } from "@/lib/api";

export default function CasePage() {
  const params = useParams<{ id: string }>();
  const [c, setC] = useState<EightDCase | null>(null);
  const [mode, setMode] = useState<"wizard" | "workbench">("wizard");
  const [msg, setMsg] = useState("");
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadCase(params.id).then(setC).catch((e) => setMsg(String(e)));
  }, [params.id]);

  const persist = useCallback(async (next: EightDCase) => {
    setC(next);
    try {
      const saved = await saveCase(next);
      setC(saved);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "保存失败");
    }
  }, []);

  if (!c) return <p className="text-sm text-stone-500">加载中…</p>;

  async function onExtract() {
    if (!c) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await extractCase(c.id, c.complaintText);
      setC(res.case);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "抽取失败（可先手工填，无需 Key）");
    } finally {
      setBusy(false);
    }
  }

  async function onRewrite() {
    if (!c) return;
    setBusy(true);
    try {
      setC(await rewriteCase(c.id));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "改写失败");
    } finally {
      setBusy(false);
    }
  }

  async function onExplain() {
    if (!c) return;
    setBusy(true);
    try {
      const res = await explainCase(c.id);
      setExplanation(res.explanation);
    } catch (e) {
      setExplanation("未配置模型时，请直接看左侧红黄灯。设置页可填写 OpenAI 兼容 Key。");
      setMsg(e instanceof Error ? e.message : "解释失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/" className="text-sm text-stone-500 underline">
            返回列表
          </Link>
          <h1 className="text-lg font-semibold">
            {c.customer.value || "未命名案件"} · {c.id}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${mode === "wizard" ? "bg-stone-900 text-white" : "border"}`}
            onClick={() => setMode("wizard")}
          >
            向导
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${mode === "workbench" ? "bg-stone-900 text-white" : "border"}`}
            onClick={() => setMode("workbench")}
          >
            工作台
          </button>
          <button type="button" className="rounded-md border px-3 py-1.5" onClick={onExtract} disabled={busy}>
            抽取事实
          </button>
          <button type="button" className="rounded-md border px-3 py-1.5" onClick={onRewrite} disabled={busy}>
            改写陈述
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-[var(--red)]">{msg}</p>}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-stone-300 bg-[var(--card)] p-5">
          {mode === "wizard" ? (
            <Wizard c={c} onChange={persist} />
          ) : (
            <Workbench c={c} onChange={persist} />
          )}
        </div>
        <ReviewPanel c={c} explanation={explanation} onExplain={onExplain} busy={busy} />
      </div>
    </div>
  );
}
