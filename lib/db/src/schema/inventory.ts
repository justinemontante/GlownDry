import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  item: text("item").notNull(),
  stock: integer("stock").notNull().default(0),
  unit: text("unit").notNull(),
  threshold: integer("threshold").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryRow = typeof inventoryTable.$inferSelect;
