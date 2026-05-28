import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, customersTable, paymentsTable } from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const allBookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);

  const activeOrders = allBookings.filter(b =>
    ["scheduled", "received", "in_progress", "ready"].includes(b.status),
  ).length;

  const expectedDropoffs = allBookings.filter(b =>
    b.status === "scheduled" &&
    b.scheduledDate >= today &&
    b.scheduledDate < tomorrow,
  ).length;

  const [totalCustomersResult] = await db.select({ count: count() }).from(customersTable);
  const [totalBookingsResult] = await db.select({ count: count() }).from(bookingsTable);

  const todayPayments = await db.select({ amount: paymentsTable.amount })
    .from(paymentsTable).where(gte(paymentsTable.createdAt, today));
  const dailyRevenue = todayPayments.reduce((s, p) => s + p.amount, 0);

  const recentBookings = allBookings.slice(-5).reverse();

  const enriched = await Promise.all(recentBookings.map(async (b) => {
    const [cust] = await db.select({ fullName: customersTable.fullName })
      .from(customersTable).where(eq(customersTable.id, b.customerId)).limit(1);
    return {
      id: b.id,
      customerId: b.customerId,
      customerName: cust?.fullName ?? null,
      serviceId: b.serviceId,
      serviceName: null,
      scheduledDate: b.scheduledDate,
      weightKg: b.weightKg,
      notes: b.notes,
      status: b.status,
      totalAmount: b.totalAmount,
      createdAt: b.createdAt,
    };
  }));

  return res.json({
    activeOrders,
    dailyRevenue,
    expectedDropoffs,
    totalCustomers: totalCustomersResult?.count ?? 0,
    totalBookings: totalBookingsResult?.count ?? 0,
    recentBookings: enriched,
  });
});

export default router;
