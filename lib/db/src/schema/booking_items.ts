import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bookingsTable } from "./bookings";

export const bookingItemsTable = pgTable("booking_items", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookingsTable.id),
  clothingType: text("clothing_type").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
});

export const insertBookingItemSchema = createInsertSchema(bookingItemsTable).omit({ id: true });
export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;
export type BookingItemRow = typeof bookingItemsTable.$inferSelect;
