import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.patch("/items/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { clothingType, quantity, notes } = req.body as {
    clothingType?: string; quantity?: number; notes?: string;
  };
  const updates: Partial<typeof bookingItemsTable.$inferInsert> = {};
  if (clothingType) updates.clothingType = clothingType;
  if (quantity != null) updates.quantity = quantity;
  if (notes !== undefined) updates.notes = notes;

  const [item] = await db.update(bookingItemsTable).set(updates)
    .where(eq(bookingItemsTable.id, id)).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

router.delete("/items/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(bookingItemsTable).where(eq(bookingItemsTable.id, id));
  return res.status(204).send();
});

export default router;
