import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { paymentsTable, bookingsTable, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function enrichPayment(p: typeof paymentsTable.$inferSelect) {
  const [booking] = await db.select({ customerId: bookingsTable.customerId })
    .from(bookingsTable).where(eq(bookingsTable.id, p.bookingId)).limit(1);
  let customerName: string | null = null;
  if (booking) {
    const [c] = await db.select({ fullName: customersTable.fullName })
      .from(customersTable).where(eq(customersTable.id, booking.customerId)).limit(1);
    customerName = c?.fullName ?? null;
  }
  return { ...p, customerName };
}

router.get("/payments", async (_req, res) => {
  const rows = await db.select().from(paymentsTable).orderBy(paymentsTable.createdAt);
  const enriched = await Promise.all(rows.map(enrichPayment));
  return res.json(enriched);
});

router.post("/payments", async (req, res) => {
  const { bookingId, amount, cashReceived, method, status } = req.body as {
    bookingId?: number; amount?: number; cashReceived?: number; method?: string; status?: string;
  };
  if (!bookingId || amount == null || cashReceived == null) {
    return res.status(400).json({ error: "bookingId, amount, cashReceived required" });
  }
  const change = cashReceived - amount;
  const [payment] = await db.insert(paymentsTable).values({
    bookingId, amount, cashReceived, change,
    method: method || "cash",
    status: status || "success",
  }).returning();
  await db.update(bookingsTable).set({ status: "claimed" }).where(eq(bookingsTable.id, bookingId));
  return res.status(201).json(await enrichPayment(payment));
});

router.get("/payments/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [p] = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.id, id)).limit(1);
  if (!p) return res.status(404).json({ error: "Not found" });
  return res.json(await enrichPayment(p));
});

export default router;
