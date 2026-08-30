"use client";

import { useEffect, useState } from "react";

type PublicSettings = {
  configured: boolean;
  baseUrl: string;
  model: string;
  apiKeyMasked: string;
};

export default function SettingsPage() {
  const [s, setS] = useState<PublicSettings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: PublicSettings) => {
        setS(data);
        setBaseUrl(data.baseUrl);
        setModel(data.model);
      });
  }, []);

  async function onSave() {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, baseUrl, model }),
    });
    const data = await res.json();
    setS(data);
    setApiKey("");
    setMsg("已保存到本机 data/llm-settings.json，不会进 Git。");
  }

  return (
    <div className="max-w-xl space-y-4 rounded-xl border border-stone-300 bg-[var(--card)] p-5">
      <h1 className="text-xl font-semibold">模型设置</h1>
      <p className="text-sm text-stone-600">
        兼容 OpenAI 的 API。不填也能用向导、工作台、门禁和导出。模型只负责抽取、改写和解释红灯，不会发明数字。
      </p>
      <p className="text-sm">
        当前：{s?.configured ? `已配置 ${s.apiKeyMasked}` : "未配置 Key"}
      </p>
      <label className="block text-sm">
        API Key
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          type="password"
          value={apiKey}
          placeholder="留空则保持原值"
          onChange={(e) => setApiKey(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Base URL
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        模型名
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </label>
      <button type="button" className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white" onClick={onSave}>
        保存
      </button>
      {msg && <p className="text-sm text-green-800">{msg}</p>}
    </div>
  );
}
