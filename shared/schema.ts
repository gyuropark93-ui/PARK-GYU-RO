import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const site_visits = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertVisitSchema = createInsertSchema(site_visits).omit({ id: true });

export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof site_visits.$inferSelect;
