import { pgTable, text, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { servicesTable } from "./services";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
  weightKg: doublePrecision("weight_kg"),
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"),
  totalAmount: doublePrecision("total_amount").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookingRow = typeof bookingsTable.$inferSelect;
