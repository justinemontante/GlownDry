import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { broadcast } from "../lib/events";

const router: IRouter = Router();

router.get("/services", async (_req, res) => {
  const rows = await db.select().from(servicesTable).orderBy(servicesTable.createdAt);
  return res.json(rows);
});

router.post("/services", async (req, res) => {
  const { name, description, pricePerKg, serviceImage } = req.body as {
    name?: string; description?: string; pricePerKg?: number; serviceImage?: string;
  };
  if (!name || !description || pricePerKg == null) {
    return res.status(400).json({ error: "name, description, pricePerKg are required" });
  }
  const [svc] = await db.insert(servicesTable).values({ name, description, pricePerKg, serviceImage }).returning();
  broadcast("service-update");
  return res.status(201).json(svc);
});

router.patch("/services/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, description, pricePerKg, serviceImage } = req.body as {
    name?: string; description?: string; pricePerKg?: number; serviceImage?: string;
  };
  const updates: Partial<typeof servicesTable.$inferInsert> = {};
  if (name) updates.name = name;
  if (description) updates.description = description;
  if (pricePerKg != null) updates.pricePerKg = pricePerKg;
  if (serviceImage !== undefined) updates.serviceImage = serviceImage;

  const [svc] = await db.update(servicesTable).set(updates)
    .where(eq(servicesTable.id, id)).returning();
  if (!svc) return res.status(404).json({ error: "Not found" });
  broadcast("service-update");
  return res.json(svc);
});

router.delete("/services/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(servicesTable).where(eq(servicesTable.id, id));
  broadcast("service-update");
  return res.status(204).send();
});

export default router;
