import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, bookingItemsTable, customersTable, servicesTable, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

async function enrichBooking(b: typeof bookingsTable.$inferSelect) {
  const [customer] = await db.select({ fullName: customersTable.fullName })
    .from(customersTable).where(eq(customersTable.id, b.customerId)).limit(1);
  const [service] = await db.select({ name: servicesTable.name })
    .from(servicesTable).where(eq(servicesTable.id, b.serviceId)).limit(1);
  return {
    id: b.id,
    customerId: b.customerId,
    customerName: customer?.fullName ?? null,
    serviceId: b.serviceId,
    serviceName: service?.name ?? null,
    scheduledDate: b.scheduledDate,
    weightKg: b.weightKg,
    notes: b.notes,
    status: b.status,
    totalAmount: b.totalAmount,
    createdAt: b.createdAt,
  };
}

router.get("/bookings", async (req, res) => {
  const { customerId, status } = req.query as { customerId?: string; status?: string };

  let rows = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);

  if (customerId) {
    rows = rows.filter(b => b.customerId === parseInt(customerId, 10));
  }
  if (status) {
    rows = rows.filter(b => b.status === status);
  }

  const enriched = await Promise.all(rows.map(enrichBooking));
  return res.json(enriched);
});

router.post("/bookings", async (req, res) => {
  const { customerId, serviceId, scheduledDate, weightKg, notes } = req.body as {
    customerId?: number; serviceId?: number; scheduledDate?: string;
    weightKg?: number; notes?: string;
  };
  if (!customerId || !serviceId || !scheduledDate) {
    return res.status(400).json({ error: "customerId, serviceId, scheduledDate required" });
  }

  const [svc] = await db.select().from(servicesTable)
    .where(eq(servicesTable.id, serviceId)).limit(1);
  const totalAmount = svc ? (weightKg ?? 0) * svc.pricePerKg : 0;

  const [booking] = await db.insert(bookingsTable).values({
    customerId,
    serviceId,
    scheduledDate: new Date(scheduledDate),
    weightKg: weightKg ?? null,
    notes: notes ?? null,
    status: "scheduled",
    totalAmount,
  }).returning();

  await db.update(customersTable)
    .set({ totalOrders: sql`${customersTable.totalOrders} + 1` })
    .where(eq(customersTable.id, customerId));

  await db.insert(notificationsTable).values({
    customerId,
    title: "Booking Confirmed",
    message: `Your laundry booking #${booking.id} is confirmed for ${new Date(scheduledDate).toLocaleDateString()}.`,
    isRead: false,
  });

  return res.status(201).json(await enrichBooking(booking));
});

router.get("/bookings/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [b] = await db.select().from(bookingsTable)
    .where(eq(bookingsTable.id, id)).limit(1);
  if (!b) return res.status(404).json({ error: "Not found" });

  const items = await db.select().from(bookingItemsTable)
    .where(eq(bookingItemsTable.bookingId, id));
  const enriched = await enrichBooking(b);
  return res.json({ ...enriched, items });
});

router.patch("/bookings/:id/status", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, weightKg, totalAmount } = req.body as {
    status?: string; weightKg?: number; totalAmount?: number;
  };
  if (!status) return res.status(400).json({ error: "status required" });

  const updates: Partial<typeof bookingsTable.$inferInsert> = { status };
  if (weightKg != null) updates.weightKg = weightKg;
  if (totalAmount != null) updates.totalAmount = totalAmount;

  const [b] = await db.update(bookingsTable).set(updates)
    .where(eq(bookingsTable.id, id)).returning();
  if (!b) return res.status(404).json({ error: "Not found" });

  const statusLabels: Record<string, string> = {
    received: "Order Received",
    in_progress: "In Progress",
    ready: "Ready for Pickup",
    claimed: "Order Claimed",
  };
  if (statusLabels[status]) {
    await db.insert(notificationsTable).values({
      customerId: b.customerId,
      title: statusLabels[status],
      message: `Your order #${id} is now: ${statusLabels[status]}.`,
      isRead: false,
    });
  }

  return res.json(await enrichBooking(b));
});

router.get("/bookings/:id/items", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = await db.select().from(bookingItemsTable)
    .where(eq(bookingItemsTable.bookingId, id));
  return res.json(items);
});

router.post("/bookings/:id/items", async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  const { clothingType, quantity, notes } = req.body as {
    clothingType?: string; quantity?: number; notes?: string;
  };
  if (!clothingType || quantity == null) {
    return res.status(400).json({ error: "clothingType and quantity required" });
  }
  const [item] = await db.insert(bookingItemsTable).values({
    bookingId, clothingType, quantity, notes: notes ?? null,
  }).returning();
  return res.status(201).json(item);
});

export default router;
