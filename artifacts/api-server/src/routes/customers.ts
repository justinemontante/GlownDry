import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";

const router: IRouter = Router();

function safeCustomer(c: typeof customersTable.$inferSelect) {
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    totalOrders: c.totalOrders,
    profileImage: c.profileImage,
    createdAt: c.createdAt,
  };
}

router.get("/customers", async (req, res) => {
  const { search } = req.query as { search?: string };

  const rows = search
    ? await db.select().from(customersTable).where(
        or(
          ilike(customersTable.fullName, `%${search}%`),
          ilike(customersTable.email, `%${search}%`),
        ),
      )
    : await db.select().from(customersTable).orderBy(customersTable.createdAt);

  return res.json(rows.map(safeCustomer));
});

router.get("/customers/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [c] = await db.select().from(customersTable)
    .where(eq(customersTable.id, id)).limit(1);
  if (!c) return res.status(404).json({ error: "Not found" });
  return res.json(safeCustomer(c));
});

router.patch("/customers/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { fullName, phone, profileImage } = req.body as { fullName?: string; phone?: string; profileImage?: string | null };

  const updates: Partial<typeof customersTable.$inferInsert> = {};
  if (fullName) updates.fullName = fullName;
  if (phone) updates.phone = phone;
  if (profileImage !== undefined) updates.profileImage = profileImage;

  const [c] = await db.update(customersTable).set(updates)
    .where(eq(customersTable.id, id)).returning();
  if (!c) return res.status(404).json({ error: "Not found" });
  return res.json(safeCustomer(c));
});

export default router;
