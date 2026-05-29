import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { count } from "drizzle-orm";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", router);

async function seedDefaultServices() {
  const [{ count: existing }] = await db.select({ count: count() }).from(servicesTable);
  if (Number(existing) === 0) {
    await db.insert(servicesTable).values([
      { name: "Regular Wash", description: "Standard wash and fold service for everyday clothes", pricePerKg: 50, imageUrl: "https://images.unsplash.com/photo-1545173168-9f5f5e4c6d1f?w=400&h=300&fit=crop" },
      { name: "Dry Clean", description: "Professional dry cleaning for delicate and formal garments", pricePerKg: 120, imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585db81b1?w=400&h=300&fit=crop" },
      { name: "Express Wash", description: "Same-day wash and fold — ready in 4 hours", pricePerKg: 80, imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=300&fit=crop" },
      { name: "Delicate Care", description: "Gentle hand wash for delicate fabrics and undergarments", pricePerKg: 90, imageUrl: "https://images.unsplash.com/photo-1489659639091-8b687bc4386e?w=400&h=300&fit=crop" },
    ]);
    logger.info("Seeded default services");
  }
}

seedDefaultServices().catch(err => logger.error({ err }, "Failed to seed services"));

export default app;
