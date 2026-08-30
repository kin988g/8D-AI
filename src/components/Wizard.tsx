"use client";

import { useMemo, useState } from "react";
import type { EightDCase, ContainmentLocation } from "@/domain/case-schema";
import { LOCATION_LABELS } from "@/domain/case-schema";
import { buildCollectionCard } from "@/domain/collection-card";
import { collectGaps } from "@/domain/review";
import { FieldInput } from "./FieldInput";

const LOCATIONS: ContainmentLocation[] = [
  "customer",
  "in_transit",
  "finished_goods",
  "line_side",
];

export function Wizard({
  c,
  onChange,
}: {
  c: EightDCase;
  onChange: (next: EightDCase) => void;
}) {
  const [step, setStep] = useState(0);
  const gaps = collectGaps(c);
  const card = useMemo(() => buildCollectionCard(c), [c]);

  const steps = [
    {
      title: "客诉原文",
      body: (
        <label className="block text-sm">
          原样粘贴，缺什么后面再问。
          <textarea
            className="mt-2 min-h-40 w-full rounded-md border border-stone-300 p-3"
            value={c.complaintText}
            onChange={(e) => onChange({ ...c, complaintText: e.target.value })}
          />
        </label>
      ),
    },
    {
      title: "确认已知事实",
      body: (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldInput label="客户" field={c.customer} onChange={(customer) => onChange({ ...c, customer })} />
          <FieldInput label="料号" field={c.partNumber} onChange={(partNumber) => onChange({ ...c, partNumber })} />
          <FieldInput label="零件名" field={c.partName} onChange={(partName) => onChange({ ...c, partName })} />
          <FieldInput label="缺陷" field={c.defect} onChange={(defect) => onChange({ ...c, defect })} />
        </div>
      ),
    },
    {
      title: "补上 5W2H 缺口",
      body: (
        <div className="space-y-3">
          {gaps.length > 0 && (
            <p className="text-sm text-amber-800">
              还缺：{gaps.map((g) => g.fieldHint).join("、")}。不知道就留空，不要编。
            </p>
          )}
          <FieldInput label="Where 在哪发现" field={c.problem.where} onChange={(where) => onChange({ ...c, problem: { ...c.problem, where } })} />
          <FieldInput label="When 何时发现" field={c.problem.when} onChange={(when) => onChange({ ...c, problem: { ...c.problem, when } })} />
          <FieldInput label="How many 多少件/批次" field={c.problem.howMany} hint="没有就空着" onChange={(howMany) => onChange({ ...c, problem: { ...c.problem, howMany } })} />
          <FieldInput label="What 可测量描述" field={c.problem.what} onChange={(what) => onChange({ ...c, problem: { ...c.problem, what } })} />
        </div>
      ),
    },
    {
      title: "D3 先保护客户",
      body: (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            四个位置都要有说法。已做的写完成日；没查的不要填假数。
          </p>
          {LOCATIONS.map((loc) => {
            const item = c.containment.find((x) => x.location === loc);
            return (
              <div key={loc} className="rounded-lg border border-stone-200 p-3">
                <div className="text-sm font-medium">{LOCATION_LABELS[loc]}</div>
                <input
                  className="mt-2 w-full rounded-md border px-2 py-2 text-sm"
                  placeholder="做了什么"
                  value={item?.action ?? ""}
                  onChange={(e) => upsertContainment(c, onChange, loc, { action: e.target.value })}
                />
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <input
                    className="rounded-md border px-2 py-2 text-sm"
                    placeholder="完成日"
                    value={item?.completedOn ?? ""}
                    onChange={(e) =>
                      upsertContainment(c, onChange, loc, {
                        completedOn: e.target.value,
                        plannedOnly: !e.target.value,
                      })
                    }
                  />
                  <input
                    className="rounded-md border px-2 py-2 text-sm"
                    placeholder="数量"
                    value={item?.quantity ?? ""}
                    onChange={(e) => upsertContainment(c, onChange, loc, { quantity: e.target.value })}
                  />
                  <input
                    className="rounded-md border px-2 py-2 text-sm"
                    placeholder="验证"
                    value={item?.verification ?? ""}
                    onChange={(e) =>
                      upsertContainment(c, onChange, loc, { verification: e.target.value })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "今晚现场采集卡",
      body: (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">打印或转发这一页。这是向导的主交付，不是漂亮报告。</p>
          <ol className="space-y-3">
            {card.map((item, i) => (
              <li key={i} className="rounded-lg border border-stone-200 bg-white p-3 text-sm">
                <div>
                  <span className="font-medium">问：</span>
                  {item.ask}
                </div>
                <div className="mt-1">
                  <span className="font-medium">拍：</span>
                  {item.shoot}
                </div>
                <div className="mt-1">
                  <span className="font-medium">数：</span>
                  {item.count}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="space-y-4">
      <div className="text-xs text-stone-500">
        向导 {step + 1}/{steps.length} · 一次只问这一步
      </div>
      <h2 className="text-lg font-medium">{current.title}</h2>
      {current.body}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={step === 0}
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => setStep((s) => s - 1)}
        >
          上一步
        </button>
        <button
          type="button"
          disabled={step === steps.length - 1}
          className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          onClick={() => setStep((s) => s + 1)}
        >
          下一步
        </button>
      </div>
    </div>
  );
}

function upsertContainment(
  c: EightDCase,
  onChange: (n: EightDCase) => void,
  location: ContainmentLocation,
  patch: Partial<EightDCase["containment"][number]>,
) {
  const existing = c.containment.find((x) => x.location === location);
  if (existing) {
    onChange({
      ...c,
      containment: c.containment.map((x) => (x.location === location ? { ...x, ...patch } : x)),
    });
    return;
  }
  onChange({
    ...c,
    containment: [
      ...c.containment,
      {
        id: Math.random().toString(36).slice(2, 8),
        location,
        action: "",
        plannedOnly: true,
        completedOn: "",
        quantity: "",
        verification: "",
        ...patch,
      },
    ],
  });
}
