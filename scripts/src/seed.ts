import { db } from "@workspace/db";
import {
  adminsTable,
  customersTable,
  servicesTable,
  bookingsTable,
  bookingItemsTable,
  paymentsTable,
  notificationsTable,
  inventoryTable,
} from "@workspace/db";
import { pbkdf2Sync, randomBytes } from "crypto";
import { eq, count } from "drizzle-orm";

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { hash, salt };
}

async function seed() {
  console.log("🌱 Seeding database...\n");

  // --- Admins ---
  const [adminCount] = await db.select({ c: count() }).from(adminsTable);
  if (Number(adminCount.c) === 0) {
    await db.insert(adminsTable).values({
      fullName: "Justin Montante",
      email: "justinemontante04@gmail.com",
      password: "Justine15",
    });
    console.log("  ✓ Admin seeded");
  } else {
    console.log("  ~ Admins already exist, skipped");
  }

  // --- Services ---
  const [svcCount] = await db.select({ c: count() }).from(servicesTable);
  let serviceIds: number[] = [];
  if (Number(svcCount.c) === 0) {
    const svcs = await db.insert(servicesTable).values([
      { name: "Regular Wash", description: "Standard laundry wash and fold service", pricePerKg: 50 },
      { name: "Dry Clean", description: "Professional dry cleaning for delicate fabrics", pricePerKg: 120 },
      { name: "Express Wash", description: "Same-day express laundry service", pricePerKg: 80 },
      { name: "Delicate Care", description: "Hand wash and special care for delicate items", pricePerKg: 90 },
    ]).returning({ id: servicesTable.id });
    serviceIds = svcs.map(s => s.id);
    console.log("  ✓ Services seeded");
  } else {
    const existing = await db.select({ id: servicesTable.id }).from(servicesTable);
    serviceIds = existing.map(s => s.id);
    console.log("  ~ Services already exist, skipped");
  }

  // --- Customers ---
  const [custCount] = await db.select({ c: count() }).from(customersTable);
  let customerIds: number[] = [];
  if (Number(custCount.c) === 0) {
    const customerData = [
      { fullName: "Maria Santos", email: "maria.santos@email.com", phone: "09171234567" },
      { fullName: "Juan dela Cruz", email: "juan.delacruz@email.com", phone: "09181234567" },
      { fullName: "Ana Gonzales", email: "ana.gonzales@email.com", phone: "09191234567" },
      { fullName: "Pedro Reyes", email: "pedro.reyes@email.com", phone: "09201234567" },
      { fullName: "Luisa Tan", email: "luisa.tan@email.com", phone: "09211234567" },
      { fullName: "Carlos Villanueva", email: "carlos.villanueva@email.com", phone: "09221234567" },
      { fullName: "Sofia Lopez", email: "sofia.lopez@email.com", phone: "09231234567" },
      { fullName: "Miguel Fernandez", email: "miguel.fernandez@email.com", phone: "09241234567" },
    ];

    for (const c of customerData) {
      const { hash, salt } = hashPassword("test123");
      const [inserted] = await db.insert(customersTable).values({
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        passwordHash: hash,
        passwordSalt: salt,
        authToken: null,
      }).returning({ id: customersTable.id });
      customerIds.push(inserted.id);
    }
    console.log(`  ✓ ${customerIds.length} customers seeded (password: test123)`);
  } else {
    const existing = await db.select({ id: customersTable.id }).from(customersTable);
    customerIds = existing.map(c => c.id);
    console.log("  ~ Customers already exist, skipped");
  }

  // --- Bookings ---
  const [bookCount] = await db.select({ c: count() }).from(bookingsTable);
  let bookingIds: number[] = [];
  if (Number(bookCount.c) === 0) {
    const statuses = ["scheduled", "received", "in_progress", "ready", "claimed"];
    const pastDates = [-14, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3, 5, 7, 10, 14];

    const bookingData = pastDates.map((daysOffset, i) => {
      const custIdx = i % customerIds.length;
      const svcIdx = i % serviceIds.length;
      const weight = 2 + Math.round(Math.random() * 10);
      const servicePrice = [50, 120, 80, 90][svcIdx] || 50;
      const total = weight * servicePrice;
      const status = statuses[Math.min(i, statuses.length - 1)];

      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      d.setHours(9 + (i % 8), 0, 0, 0);

      return {
        customerId: customerIds[custIdx],
        serviceId: serviceIds[svcIdx],
        scheduledDate: d,
        weightKg: weight,
        notes: i % 3 === 0 ? `Please fold neatly` : null,
        status,
        totalAmount: total,
      };
    });

    const inserted = await db.insert(bookingsTable).values(bookingData).returning({ id: bookingsTable.id });
    bookingIds = inserted.map(b => b.id);
    console.log(`  ✓ ${bookingIds.length} bookings seeded`);

    // --- Booking Items ---
    const clothingTypes = ["Shirt", "Pants", "Dress", "Skirt", "Jacket", "Towel", "Bed Sheet", "Polo"];
    const itemsData = bookingIds.flatMap(bid => {
      const count = 1 + Math.floor(Math.random() * 4);
      return Array.from({ length: count }, (_, i) => ({
        bookingId: bid,
        clothingType: clothingTypes[(bid + i) % clothingTypes.length],
        quantity: 1 + Math.floor(Math.random() * 5),
        notes: null as string | null,
      }));
    });
    await db.insert(bookingItemsTable).values(itemsData);
    console.log(`  ✓ ${itemsData.length} booking items seeded`);

    // --- Payments (for claimed/ready bookings) ---
    const readyBookings = bookingData.filter((b, i) =>
      b.status === "claimed" || b.status === "ready"
    );
    if (readyBookings.length > 0) {
      const paymentsData = readyBookings.map((b, i) => {
        const amount = b.totalAmount;
        const cashReceived = amount + Math.round(Math.random() * 50) + 10;
        const change = cashReceived - amount;
        return {
          bookingId: bookingIds[bookingData.indexOf(b)],
          amount,
          cashReceived,
          change,
        };
      });
      await db.insert(paymentsTable).values(paymentsData);
      console.log(`  ✓ ${paymentsData.length} payments seeded`);
    }

    // --- Notifications ---
    const notificationData = bookingIds.slice(0, 6).map((bid, i) => ({
      customerId: customerIds[i % customerIds.length],
      title: "Order Status Update",
      message: `Your order #ORD-${String(bid).padStart(4, "0")} is now ${["ready for pickup", "being processed", "received", "scheduled", "in progress", "claimed"][i]}.`,
      isRead: i < 3,
    }));
    await db.insert(notificationsTable).values(notificationData);
    console.log(`  ✓ ${notificationData.length} notifications seeded`);
  } else {
    console.log("  ~ Bookings already exist, skipped");
  }

  // --- Inventory ---
  const [invCount] = await db.select({ c: count() }).from(inventoryTable);
  if (Number(invCount.c) === 0) {
    await db.insert(inventoryTable).values([
      { item: "Premium Detergent (Liquid)", stock: 45, unit: "Liters", threshold: 20 },
      { item: "Fabric Softener", stock: 12, unit: "Liters", threshold: 15 },
      { item: "Dry Cleaning Solvent", stock: 8, unit: "Gallons", threshold: 10 },
      { item: "Packaging Bags (Large)", stock: 500, unit: "Units", threshold: 200 },
      { item: "Hangers", stock: 1200, unit: "Units", threshold: 300 },
    ]);
    console.log("  ✓ Inventory seeded");
  } else {
    console.log("  ~ Inventory already exists, skipped");
  }

  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
