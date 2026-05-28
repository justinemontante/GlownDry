import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/notifications", async (req, res) => {
  const { customerId } = req.query as { customerId?: string };
  if (!customerId) return res.status(400).json({ error: "customerId required" });

  const rows = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.customerId, parseInt(customerId, 10)))
    .orderBy(notificationsTable.createdAt);
  return res.json(rows);
});

router.post("/notifications", async (req, res) => {
  const { customerId, title, message } = req.body as {
    customerId?: number; title?: string; message?: string;
  };
  if (!customerId || !title || !message) {
    return res.status(400).json({ error: "customerId, title, message required" });
  }
  const [n] = await db.insert(notificationsTable).values({
    customerId, title, message, isRead: false,
  }).returning();
  return res.status(201).json(n);
});

router.patch("/notifications/:id/read", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [n] = await db.update(notificationsTable).set({ isRead: true })
    .where(eq(notificationsTable.id, id)).returning();
  if (!n) return res.status(404).json({ error: "Not found" });
  return res.json(n);
});

export default router;
