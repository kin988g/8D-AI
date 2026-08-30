import { eq, desc } from "drizzle-orm";
import { caseSchema, createEmptyCase, type EightDCase } from "@/domain/case-schema";
import { getDb } from "./db";
import { casesTable } from "./db/schema";

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return `8d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listCases(): EightDCase[] {
  const rows = getDb()
    .select()
    .from(casesTable)
    .orderBy(desc(casesTable.updatedAt))
    .all();
  return rows.map((r) => caseSchema.parse(JSON.parse(r.body)));
}

export function getCase(id: string): EightDCase | null {
  const rows = getDb().select().from(casesTable).where(eq(casesTable.id, id)).all();
  if (!rows[0]) return null;
  return caseSchema.parse(JSON.parse(rows[0].body));
}

export function createCase(complaintText = ""): EightDCase {
  const created = createEmptyCase(newId(), nowIso());
  created.complaintText = complaintText;
  persist(created);
  return created;
}

export function saveCase(input: EightDCase): EightDCase {
  const parsed = caseSchema.parse({
    ...input,
    updatedAt: nowIso(),
  });
  persist(parsed);
  return parsed;
}

function persist(c: EightDCase) {
  const db = getDb();
  const existing = db.select().from(casesTable).where(eq(casesTable.id, c.id)).all();
  const body = JSON.stringify(c);
  if (existing[0]) {
    db.update(casesTable)
      .set({ body, updatedAt: c.updatedAt })
      .where(eq(casesTable.id, c.id))
      .run();
  } else {
    db.insert(casesTable)
      .values({
        id: c.id,
        body,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })
      .run();
  }
}
