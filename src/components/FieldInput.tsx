"use client";

import type { Field } from "@/domain/case-schema";

export function FieldInput({
  label,
  field,
  onChange,
  hint,
}: {
  label: string;
  field: Field;
  onChange: (next: Field) => void;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-stone-600">
        {label}
        {field.source === "extracted" && (
          <span className="ml-2 text-xs text-amber-700">来自抽取，请确认</span>
        )}
        {field.source === "unknown" && !field.value && (
          <span className="ml-2 text-xs text-stone-400">待补充</span>
        )}
      </span>
      <input
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
        value={field.value}
        placeholder={hint}
        onChange={(e) =>
          onChange({
            value: e.target.value,
            source: e.target.value.trim() ? "user" : "unknown",
          })
        }
      />
    </label>
  );
}
