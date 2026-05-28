import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { inventoryTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/inventory", async (req, res) => {
  const search = (req.query.search as string) || "";
  const rows = search.trim()
    ? await db.select().from(inventoryTable)
        .where(ilike(inventoryTable.item, `%${search.trim()}%`))
        .orderBy(inventoryTable.item)
    : await db.select().from(inventoryTable).orderBy(inventoryTable.item);
  return res.json(rows);
});

router.post("/inventory", async (req, res) => {
  const { item, stock, unit, threshold } = req.body as {
    item?: string; stock?: number; unit?: string; threshold?: number;
  };
  if (!item || !unit || stock == null || threshold == null) {
    return res.status(400).json({ error: "item, stock, unit, threshold are required" });
  }
  const [inv] = await db.insert(inventoryTable).values({ item, stock, unit, threshold }).returning();
  return res.status(201).json(inv);
});

router.patch("/inventory/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { item, stock, unit, threshold } = req.body as {
    item?: string; stock?: number; unit?: string; threshold?: number;
  };
  const updates: Partial<typeof inventoryTable.$inferInsert> = {};
  if (item) updates.item = item;
  if (stock != null) updates.stock = stock;
  if (unit) updates.unit = unit;
  if (threshold != null) updates.threshold = threshold;

  const [inv] = await db.update(inventoryTable).set(updates)
    .where(eq(inventoryTable.id, id)).returning();
  if (!inv) return res.status(404).json({ error: "Not found" });
  return res.json(inv);
});

router.delete("/inventory/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(inventoryTable).where(eq(inventoryTable.id, id));
  return res.status(204).send();
});

export default router;
