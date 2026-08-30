import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const casesTable = sqliteTable("cases", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
