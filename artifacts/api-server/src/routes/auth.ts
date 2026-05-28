import { Router, type IRouter } from "express";
import { pbkdf2Sync, randomBytes } from "crypto";
import { db, adminsTable, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterCustomerBody, LoginCustomerBody, LoginAdminBody } from "@workspace/api-zod";

const router: IRouter = Router();

export const adminTokens = new Set<string>();

async function seedDefaultAdmin() {
  const existing = await db.select({ id: adminsTable.id })
    .from(adminsTable).where(eq(adminsTable.email, "justinemontante04@gmail.com")).limit(1);
  if (existing.length === 0) {
    await db.insert(adminsTable).values({
      fullName: "Justin Montante",
      email: "justinemontante04@gmail.com",
      password: "Justine15",
    });
    console.log("Seeded default admin account");
  }
}
seedDefaultAdmin().catch(err => console.error("Failed to seed admin:", err));

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return derived === hash;
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: String(parsed.error) });
  }
  const { fullName, email, phone, password } = parsed.data;

  const existing = await db.select({ id: customersTable.id })
    .from(customersTable).where(eq(customersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const { hash, salt } = hashPassword(password);
  const token = generateToken();

  const [customer] = await db.insert(customersTable).values({
    fullName, email, phone,
    passwordHash: hash,
    passwordSalt: salt,
    authToken: token,
  }).returning();

  return res.status(201).json({
    token,
    customer: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.totalOrders,
      createdAt: customer.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: String(parsed.error) });
  }
  const { email, password } = parsed.data;

  const [customer] = await db.select().from(customersTable)
    .where(eq(customersTable.email, email)).limit(1);

  if (!customer || !verifyPassword(password, customer.passwordHash, customer.passwordSalt)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken();
  await db.update(customersTable).set({ authToken: token }).where(eq(customersTable.id, customer.id));

  return res.json({
    token,
    customer: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.totalOrders,
      createdAt: customer.createdAt,
    },
  });
});

router.post("/auth/admin/login", async (req, res) => {
  const parsed = LoginAdminBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: String(parsed.error) });
  }
  const { email, password } = parsed.data;

  const [admin] = await db.select().from(adminsTable)
    .where(eq(adminsTable.email, email)).limit(1);

  if (!admin || password !== admin.password) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  const token = generateToken();
  adminTokens.add(token);
  await db.update(adminsTable).set({ authToken: token }).where(eq(adminsTable.id, admin.id));

  return res.json({
    token,
    admin: {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      createdAt: admin.createdAt,
    },
  });
});

export default router;
