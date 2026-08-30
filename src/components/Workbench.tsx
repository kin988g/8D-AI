"use client";

import type { EightDCase, Containment, Pca } from "@/domain/case-schema";
import { LOCATION_LABELS, STRENGTH_LABELS } from "@/domain/case-schema";
import { FieldInput } from "./FieldInput";

function nid() {
  return Math.random().toString(36).slice(2, 8);
}

export function Workbench({
  c,
  onChange,
}: {
  c: EightDCase;
  onChange: (next: EightDCase) => void;
}) {
  const set = (patch: Partial<EightDCase>) => onChange({ ...c, ...patch });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-medium">抬头 / D0–D2</h2>
        <textarea
          className="min-h-24 w-full rounded-md border border-stone-300 p-3 text-sm"
          value={c.complaintText}
          placeholder="客诉原文"
          onChange={(e) => set({ complaintText: e.target.value })}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <FieldInput label="客户" field={c.customer} onChange={(customer) => set({ customer })} />
          <FieldInput label="料号" field={c.partNumber} onChange={(partNumber) => set({ partNumber })} />
          <FieldInput label="零件名" field={c.partName} onChange={(partName) => set({ partName })} />
          <FieldInput label="缺陷" field={c.defect} onChange={(defect) => set({ defect })} />
          <FieldInput label="What" field={c.problem.what} onChange={(what) => set({ problem: { ...c.problem, what } })} />
          <FieldInput label="Where" field={c.problem.where} onChange={(where) => set({ problem: { ...c.problem, where } })} />
          <FieldInput label="When" field={c.problem.when} onChange={(when) => set({ problem: { ...c.problem, when } })} />
          <FieldInput label="How many（不要估）" field={c.problem.howMany} onChange={(howMany) => set({ problem: { ...c.problem, howMany } })} />
        </div>
        <label className="block text-sm text-stone-600">
          团队（逗号分隔）
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
            value={c.team.join("，")}
            onChange={(e) =>
              set({
                team: e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </label>
        <label className="block text-sm">
          中文问题陈述
          <textarea
            className="mt-1 min-h-16 w-full rounded-md border border-stone-300 p-2"
            value={c.problem.statementZh}
            onChange={(e) => set({ problem: { ...c.problem, statementZh: e.target.value } })}
          />
        </label>
        <label className="block text-sm">
          English problem statement
          <textarea
            className="mt-1 min-h-16 w-full rounded-md border border-stone-300 p-2"
            value={c.problem.statementEn}
            onChange={(e) => set({ problem: { ...c.problem, statementEn: e.target.value } })}
          />
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">D3 临时遏制（必须已执行）</h2>
          <button
            type="button"
            className="text-sm underline"
            onClick={() =>
              set({
                containment: [
                  ...c.containment,
                  {
                    id: nid(),
                    location: "finished_goods",
                    action: "",
                    plannedOnly: false,
                    completedOn: "",
                    quantity: "",
                    verification: "",
                  },
                ],
              })
            }
          >
            添加一条
          </button>
        </div>
        {c.containment.map((item, idx) => (
          <ContainmentRow
            key={item.id}
            item={item}
            onChange={(next) => {
              const containment = [...c.containment];
              containment[idx] = next;
              set({ containment });
            }}
            onRemove={() => set({ containment: c.containment.filter((x) => x.id !== item.id) })}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <RcaBox
          title="D4 发生原因（为什么做出不良）"
          statement={c.occurrenceRca.statement}
          verified={c.occurrenceRca.verified}
          evidence={c.occurrenceRca.evidence}
          onChange={(occurrenceRca) => set({ occurrenceRca: { ...c.occurrenceRca, ...occurrenceRca } })}
        />
        <RcaBox
          title="D4 流出原因（为什么没拦住）"
          statement={c.escapeRca.statement}
          verified={c.escapeRca.verified}
          evidence={c.escapeRca.evidence}
          onChange={(escapeRca) => set({ escapeRca: { ...c.escapeRca, ...escapeRca } })}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">D5 永久对策（不要只写培训/加检）</h2>
          <button
            type="button"
            className="text-sm underline"
            onClick={() =>
              set({
                pca: [
                  ...c.pca,
                  {
                    id: nid(),
                    target: "occurrence",
                    action: "",
                    strength: "process",
                    owner: "",
                    dueOn: "",
                  },
                ],
              })
            }
          >
            添加一条
          </button>
        </div>
        {c.pca.map((item, idx) => (
          <PcaRow
            key={item.id}
            item={item}
            onChange={(next) => {
              const pca = [...c.pca];
              pca[idx] = next;
              set({ pca });
            }}
            onRemove={() => set({ pca: c.pca.filter((x) => x.id !== item.id) })}
          />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <h2 className="font-medium md:col-span-2">D6 验证（必须有数字）</h2>
        {(["metric", "before", "after", "period"] as const).map((k) => (
          <label key={k} className="text-sm">
            {k === "metric" ? "指标" : k === "before" ? "改善前" : k === "after" ? "改善后" : "周期"}
            <input
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
              value={c.validation[k]}
              onChange={(e) => set({ validation: { ...c.validation, [k]: e.target.value } })}
            />
          </label>
        ))}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">D7 体系更新</h2>
          <button
            type="button"
            className="text-sm underline"
            onClick={() =>
              set({
                prevention: [...c.prevention, { id: nid(), artifact: "", done: false }],
              })
            }
          >
            添加一项
          </button>
        </div>
        {c.prevention.map((p, idx) => (
          <div key={p.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={p.done}
              onChange={(e) => {
                const prevention = [...c.prevention];
                prevention[idx] = { ...p, done: e.target.checked };
                set({ prevention });
              }}
            />
            <input
              className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm"
              placeholder="如 PFMEA REV C / 控制计划第3行"
              value={p.artifact}
              onChange={(e) => {
                const prevention = [...c.prevention];
                prevention[idx] = { ...p, artifact: e.target.value };
                set({ prevention });
              }}
            />
          </div>
        ))}
      </section>
    </div>
  );
}

function ContainmentRow({
  item,
  onChange,
  onRemove,
}: {
  item: Containment;
  onChange: (n: Containment) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg border border-stone-200 p-3 md:grid-cols-2">
      <select
        className="rounded-md border border-stone-300 px-2 py-2 text-sm"
        value={item.location}
        onChange={(e) => onChange({ ...item, location: e.target.value as Containment["location"] })}
      >
        {Object.entries(LOCATION_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <input
        className="rounded-md border border-stone-300 px-2 py-2 text-sm"
        placeholder="动作"
        value={item.action}
        onChange={(e) => onChange({ ...item, action: e.target.value })}
      />
      <input
        className="rounded-md border border-stone-300 px-2 py-2 text-sm"
        placeholder="完成日期 YYYY-MM-DD"
        value={item.completedOn}
        onChange={(e) =>
          onChange({ ...item, completedOn: e.target.value, plannedOnly: !e.target.value })
        }
      />
      <input
        className="rounded-md border border-stone-300 px-2 py-2 text-sm"
        placeholder="数量"
        value={item.quantity}
        onChange={(e) => onChange({ ...item, quantity: e.target.value })}
      />
      <input
        className="rounded-md border border-stone-300 px-2 py-2 text-sm md:col-span-2"
        placeholder="验证结果"
        value={item.verification}
        onChange={(e) => onChange({ ...item, verification: e.target.value })}
      />
      <button type="button" className="text-left text-xs text-stone-500 underline" onClick={onRemove}>
        删除
      </button>
    </div>
  );
}

function RcaBox({
  title,
  statement,
  verified,
  evidence,
  onChange,
}: {
  title: string;
  statement: string;
  verified: boolean;
  evidence: string;
  onChange: (p: { statement: string; verified: boolean; evidence: string }) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-stone-200 p-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <textarea
        className="min-h-20 w-full rounded-md border border-stone-300 p-2 text-sm"
        value={statement}
        placeholder="系统层原因，不要写操作工/意识"
        onChange={(e) => onChange({ statement: e.target.value, verified, evidence })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => onChange({ statement, verified: e.target.checked, evidence })}
        />
        已用数据/实验验证
      </label>
      <input
        className="w-full rounded-md border border-stone-300 px-2 py-2 text-sm"
        placeholder="验证证据"
        value={evidence}
        onChange={(e) => onChange({ statement, verified, evidence: e.target.value })}
      />
    </div>
  );
}

function PcaRow({
  item,
  onChange,
  onRemove,
}: {
  item: Pca;
  onChange: (n: Pca) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg border border-stone-200 p-3 md:grid-cols-2">
      <select
        className="rounded-md border px-2 py-2 text-sm"
        value={item.target}
        onChange={(e) => onChange({ ...item, target: e.target.value as Pca["target"] })}
      >
        <option value="occurrence">针对发生</option>
        <option value="escape">针对流出</option>
      </select>
      <select
        className="rounded-md border px-2 py-2 text-sm"
        value={item.strength}
        onChange={(e) => onChange({ ...item, strength: e.target.value as Pca["strength"] })}
      >
        {Object.entries(STRENGTH_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <input
        className="rounded-md border px-2 py-2 text-sm md:col-span-2"
        placeholder="对策内容"
        value={item.action}
        onChange={(e) => onChange({ ...item, action: e.target.value })}
      />
      <input
        className="rounded-md border px-2 py-2 text-sm"
        placeholder="责任人"
        value={item.owner}
        onChange={(e) => onChange({ ...item, owner: e.target.value })}
      />
      <input
        className="rounded-md border px-2 py-2 text-sm"
        placeholder="完成日"
        value={item.dueOn}
        onChange={(e) => onChange({ ...item, dueOn: e.target.value })}
      />
      <button type="button" className="text-left text-xs underline" onClick={onRemove}>
        删除
      </button>
    </div>
  );
}
