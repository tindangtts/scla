import { db } from "@workspace/db";
import {
  usersTable,
  announcementsTable,
  promotionsTable,
  invoicesTable,
  facilitiesTable,
  infoCategoriesTable,
  infoArticlesTable,
  notificationsTable,
  staffUsersTable,
  ticketsTable,
  upgradeRequestsTable,
  faqsTable,
  bookingsTable,
  walletTransactionsTable,
  ticketMessagesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

async function hashPasswordBcrypt(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Deterministic seed IDs so downstream inserts reference fixed UUIDs every run
const SEED_IDS = {
  guestUser: "00000000-0000-4000-8000-000000000001",
  residentUser: "00000000-0000-4000-8000-000000000002",
  guestUser2: "00000000-0000-4000-8000-000000000003",
  guestUser3: "00000000-0000-4000-8000-000000000004",
  // Additional residents for richer demo data
  residentUser2: "00000000-0000-4000-8000-000000000005",
  residentUser3: "00000000-0000-4000-8000-000000000006",
  adminStaff: "00000000-0000-4000-8000-000000000101",
  contentStaff: "00000000-0000-4000-8000-000000000102",
  supportStaff: "00000000-0000-4000-8000-000000000103",
} as const;

async function seedAuthUsers() {
  console.log("Seeding Supabase Auth users...");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const authUsers = [
    // Resident/guest users
    {
      id: SEED_IDS.guestUser,
      email: "demo@starcity.com",
      password: "password123",
      user_metadata: { name: "Ko Zin Min", phone: "09-999-111-222", user_type: "guest" },
    },
    {
      id: SEED_IDS.residentUser,
      email: "resident@starcity.com",
      password: "password123",
      user_metadata: { name: "Ma Aye Aye", phone: "09-888-333-444", user_type: "resident" },
    },
    {
      id: SEED_IDS.guestUser2,
      email: "aung.kyaw@gmail.com",
      password: "password123",
      user_metadata: { name: "Ko Aung Kyaw", phone: "09-777-222-333", user_type: "guest" },
    },
    {
      id: SEED_IDS.guestUser3,
      email: "thida.nwe@outlook.com",
      password: "password123",
      user_metadata: { name: "Ma Thida Nwe", phone: "09-666-444-555", user_type: "guest" },
    },
    {
      id: SEED_IDS.residentUser2,
      email: "hla.win@gmail.com",
      password: "password123",
      user_metadata: { name: "U Hla Win", phone: "09-555-777-888", user_type: "resident" },
    },
    {
      id: SEED_IDS.residentUser3,
      email: "nwe.nwe@gmail.com",
      password: "password123",
      user_metadata: { name: "Ma Nwe Nwe Oo", phone: "09-444-666-999", user_type: "resident" },
    },
    // Staff users
    {
      id: SEED_IDS.adminStaff,
      email: "admin@starcity.com",
      password: "admin123",
      user_metadata: { name: "U Kyaw Zin", role: "admin" },
    },
    {
      id: SEED_IDS.contentStaff,
      email: "content@starcity.com",
      password: "content123",
      user_metadata: { name: "Ma Su Su", role: "content_manager" },
    },
    {
      id: SEED_IDS.supportStaff,
      email: "support@starcity.com",
      password: "support123",
      user_metadata: { name: "Ko Nay Lin", role: "ticket_handler" },
    },
  ];

  for (const u of authUsers) {
    // Try to create; if user exists, update instead
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: u.user_metadata,
    });
    if (error) {
      if (error.message?.includes("already been registered") || error.status === 422) {
        console.log(`  Auth user ${u.email} already exists, updating...`);
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const users = listData?.users ?? [];
        const existing = users.find((eu: { email?: string }) => eu.email === u.email);
        if (existing) {
          await supabaseAdmin.auth.admin.updateUserById((existing as { id: string }).id, {
            password: u.password,
            user_metadata: u.user_metadata,
            email_confirm: true,
          });
          console.log(`  Updated auth user: ${u.email}`);
        }
      } else {
        console.error(`  Failed to create auth user ${u.email}:`, error.message);
      }
    } else {
      console.log(`  Created auth user: ${u.email} (${data.user.id})`);
    }
  }
  console.log("Supabase Auth users seeded.");
}

async function seedUsers() {
  console.log("Seeding users...");
  // onConflictDoNothing targets the unique email constraint — safe to re-run
  await db
    .insert(usersTable)
    .values([
      {
        id: SEED_IDS.guestUser,
        name: "Ko Zin Min",
        email: "demo@starcity.com",
        phone: "09-999-111-222",
        passwordHash: await hashPasswordBcrypt("password123"),
        userType: "guest",
        upgradeStatus: "none",
      },
      {
        id: SEED_IDS.residentUser,
        name: "Ma Aye Aye",
        email: "resident@starcity.com",
        phone: "09-888-333-444",
        passwordHash: await hashPasswordBcrypt("password123"),
        userType: "resident",
        unitNumber: "A-12-03",
        residentId: "SC-2023-00142",
        developmentName: "City Loft",
        upgradeStatus: "approved",
      },
      {
        id: SEED_IDS.guestUser2,
        name: "Ko Aung Kyaw",
        email: "aung.kyaw@gmail.com",
        phone: "09-777-222-333",
        passwordHash: await hashPasswordBcrypt("password123"),
        userType: "guest",
        upgradeStatus: "pending",
      },
      {
        id: SEED_IDS.guestUser3,
        name: "Ma Thida Nwe",
        email: "thida.nwe@outlook.com",
        phone: "09-666-444-555",
        passwordHash: await hashPasswordBcrypt("password123"),
        userType: "guest",
        upgradeStatus: "none",
      },
      {
        id: SEED_IDS.residentUser2,
        name: "U Hla Win",
        email: "hla.win@gmail.com",
        phone: "09-555-777-888",
        passwordHash: await hashPasswordBcrypt("password123"),
        userType: "resident",
        unitNumber: "B-05-12",
        residentId: "SC-2024-00256",
        developmentName: "Estella",
        upgradeStatus: "approved",
      },
      {
        id: SEED_IDS.residentUser3,
        name: "Ma Nwe Nwe Oo",
        email: "nwe.nwe@gmail.com",
        phone: "09-444-666-999",
        passwordHash: await hashPasswordBcrypt("password123"),
        userType: "resident",
        unitNumber: "C-08-07",
        residentId: "SC-2025-00401",
        developmentName: "ARA",
        upgradeStatus: "approved",
      },
    ])
    .onConflictDoNothing({ target: usersTable.email });
  console.log("Users seeded.");
}

async function seedStaffUsers() {
  console.log("Seeding staff users...");
  // onConflictDoNothing targets the unique email constraint — safe to re-run
  await db
    .insert(staffUsersTable)
    .values([
      {
        id: SEED_IDS.adminStaff,
        name: "U Kyaw Zin",
        email: "admin@starcity.com",
        passwordHash: await hashPasswordBcrypt("admin123"),
        role: "admin" as const,
        isActive: true,
      },
      {
        id: SEED_IDS.contentStaff,
        name: "Ma Su Su",
        email: "content@starcity.com",
        passwordHash: await hashPasswordBcrypt("content123"),
        role: "content_manager" as const,
        isActive: true,
      },
      {
        id: SEED_IDS.supportStaff,
        name: "Ko Nay Lin",
        email: "support@starcity.com",
        passwordHash: await hashPasswordBcrypt("support123"),
        role: "ticket_handler" as const,
        isActive: true,
      },
    ])
    .onConflictDoNothing({ target: staffUsersTable.email });
  console.log("Staff users seeded.");
}

async function seedUpgradeRequests() {
  const existing = await db.select().from(upgradeRequestsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding upgrade requests...");
  await db.insert(upgradeRequestsTable).values({
    userId: SEED_IDS.guestUser2,
    userName: "Ko Aung Kyaw",
    userEmail: "aung.kyaw@gmail.com",
    unitNumber: "B-05-12",
    residentId: "SC-2024-00389",
    developmentName: "Estella",
    status: "pending",
  });
  console.log("Upgrade requests seeded.");
}

async function seedAnnouncements() {
  const existing = await db.select().from(announcementsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding announcements...");
  await db.insert(announcementsTable).values([
    {
      title: "Scheduled Water Supply Interruption — 12 April 2026",
      content:
        "Dear StarCity Residents,\n\nPlease be informed that there will be a scheduled water supply interruption on Saturday, 12 April 2026, from 8:00 AM to 12:00 PM for maintenance work on the main water supply line.\n\nAffected zones: City Loft Blocks A, B, C and Estella Tower 1.\n\nWe apologise for any inconvenience caused. Please store sufficient water prior to the maintenance window. For urgent assistance, please contact our 24-hour hotline at 09-123-456-789.\n\nThank you for your understanding.\n\nStarCity Estate Management",
      summary:
        "Water supply will be interrupted on 12 April from 8AM to 12PM for maintenance in City Loft and Estella Tower 1.",
      type: "announcement" as const,
      isPinned: true,
      isDraft: false,
      targetAudience: "all" as const,
      tags: ["maintenance", "water"],
      publishedAt: new Date("2026-04-08T09:00:00Z"),
    },
    {
      title: "StarCity Sports Centre — April Pool Cleaning Schedule",
      content:
        "Dear Residents,\n\nThe main swimming pool at StarCity Sports Centre (SCSC) will undergo its monthly deep cleaning on:\n\n• Thursday, 10 April 2026 — 7:00 AM to 3:00 PM\n\nDuring this time, the main pool will be closed. The leisure pool will remain open. We apologise for the inconvenience and thank you for your patience.\n\nSCSC Operations Team",
      summary:
        "Main swimming pool closed for cleaning on 10 April from 7AM to 3PM. Leisure pool remains open.",
      type: "announcement" as const,
      isPinned: false,
      isDraft: false,
      targetAudience: "all" as const,
      tags: ["facilities", "pool"],
      publishedAt: new Date("2026-04-06T10:00:00Z"),
    },
    {
      title: "StarCity Community Newsletter — March 2026",
      content:
        "# StarCity Monthly Newsletter — March 2026\n\n## A Message from the Estate Director\n\nDear StarCity Family,\n\nMarch has been a wonderful month for our community. We welcomed 45 new families across City Loft and ARA, hosted our Thingyan celebration at the Central Plaza, and completed phase 2 of the landscape renovation in Estella.\n\n## Community Highlights\n\n**Thingyan Festival 2026** — Over 500 residents joined our water festival celebration on 13-17 April. A special thank you to our Residents' Committee for organising the event.\n\n**New Facilities** — The upgraded gym at SCSC is now open with 20 new equipment pieces including treadmills, rowing machines, and a dedicated yoga studio.\n\n**Green Initiative** — Our composting programme in City Loft now diverts over 200kg of organic waste per month from landfill.\n\n## Upcoming Events\n\n• 20 April — Children's Art Competition (Central Playground)\n• 25 April — Residents' Forum (Community Hall, 7PM)\n• 3 May — SCSC Annual Fun Run\n\nWarm regards,\nDaw Khin Mar Lwin\nEstate Director, StarCity",
      summary:
        "March community highlights including Thingyan celebrations, new gym equipment, and upcoming events for April and May.",
      type: "newsletter" as const,
      isPinned: false,
      isDraft: false,
      targetAudience: "all" as const,
      tags: ["newsletter", "community"],
      publishedAt: new Date("2026-04-01T08:00:00Z"),
    },
    {
      title: "Important: Resident ID Update — Action Required",
      content:
        "Dear Residents,\n\nPlease ensure your resident ID is updated in the app by 30 April 2026. Visit the Profile section to verify your linked unit information.",
      summary: "Residents must update their Resident ID in the app by 30 April 2026.",
      type: "announcement" as const,
      isPinned: false,
      isDraft: true,
      targetAudience: "residents_only" as const,
      tags: ["resident", "action-required"],
      publishedAt: new Date("2026-04-10T09:00:00Z"),
    },
  ]);
  console.log("Announcements seeded.");
}

async function seedPromotions() {
  const existing = await db.select().from(promotionsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding promotions...");
  await db.insert(promotionsTable).values([
    {
      title: "20% Off All Coffee at The Roost Cafe",
      description:
        "StarCity residents enjoy 20% off all beverages at The Roost Cafe, located at the City Loft Ground Floor Commercial Hub. Simply show your SCLA app or StarCity resident card to redeem. Valid Monday to Friday, 7AM to 5PM.",
      category: "F&B",
      partnerName: "The Roost Cafe",
      validFrom: new Date("2026-04-01T00:00:00Z"),
      validUntil: new Date("2026-06-30T23:59:59Z"),
      isActive: true,
    },
    {
      title: "Complimentary Fitness Assessment at SCSC",
      description:
        "New to the gym? Get a complimentary 45-minute fitness assessment with our certified trainers at StarCity Sports Centre. Available for all residents and sports centre members. Book through the SCLA app.",
      category: "Health & Fitness",
      partnerName: "StarCity Sports Centre",
      validFrom: new Date("2026-04-01T00:00:00Z"),
      validUntil: new Date("2026-04-30T23:59:59Z"),
      isActive: true,
    },
    {
      title: "10% Off Grocery Delivery — FreshMart Partnership",
      description:
        "Enjoy 10% off your first three grocery orders through FreshMart's delivery service. Use promo code STARCITY10 at checkout. Delivery available to all StarCity Estate units within 2 hours.",
      category: "Shopping",
      partnerName: "FreshMart Myanmar",
      validFrom: new Date("2026-03-15T00:00:00Z"),
      validUntil: new Date("2026-05-31T23:59:59Z"),
      isActive: true,
    },
  ]);
  console.log("Promotions seeded.");
}

async function seedInvoices() {
  const existing = await db.select().from(invoicesTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding invoices...");
  // onConflictDoNothing guards against PK collisions (belt-and-suspenders with count check above)
  await db
    .insert(invoicesTable)
    .values([
      {
        invoiceNumber: "INV-2026-04-001",
        userId: SEED_IDS.residentUser,
        unitNumber: "A-12-03",
        category: "Service Charge",
        description: "Monthly Service Charge — April 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-15",
        totalAmount: "285000",
        paidAmount: "0",
        status: "unpaid" as const,
        month: "2026-04",
        lineItems: [
          {
            id: "li1",
            description: "Building Management Fee",
            quantity: 1,
            unitPrice: 150000,
            amount: 150000,
          },
          {
            id: "li2",
            description: "Common Area Maintenance",
            quantity: 1,
            unitPrice: 85000,
            amount: 85000,
          },
          {
            id: "li3",
            description: "Security Services",
            quantity: 1,
            unitPrice: 50000,
            amount: 50000,
          },
        ],
      },
      {
        invoiceNumber: "INV-2026-04-002",
        userId: SEED_IDS.residentUser,
        unitNumber: "A-12-03",
        category: "Utility",
        description: "Electricity Bill — March 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-15",
        totalAmount: "142500",
        paidAmount: "0",
        status: "unpaid" as const,
        month: "2026-04",
        lineItems: [
          {
            id: "li4",
            description: "Electricity Consumption (450 kWh)",
            quantity: 450,
            unitPrice: 250,
            amount: 112500,
          },
          { id: "li5", description: "Meter Rental", quantity: 1, unitPrice: 15000, amount: 15000 },
          {
            id: "li6",
            description: "Administration Fee",
            quantity: 1,
            unitPrice: 15000,
            amount: 15000,
          },
        ],
      },
      {
        invoiceNumber: "INV-2026-03-001",
        userId: SEED_IDS.residentUser,
        unitNumber: "A-12-03",
        category: "Service Charge",
        description: "Monthly Service Charge — March 2026",
        issueDate: "2026-03-01",
        dueDate: "2026-03-15",
        totalAmount: "285000",
        paidAmount: "285000",
        status: "paid" as const,
        month: "2026-03",
        lineItems: [
          {
            id: "li7",
            description: "Building Management Fee",
            quantity: 1,
            unitPrice: 150000,
            amount: 150000,
          },
          {
            id: "li8",
            description: "Common Area Maintenance",
            quantity: 1,
            unitPrice: 85000,
            amount: 85000,
          },
          {
            id: "li9",
            description: "Security Services",
            quantity: 1,
            unitPrice: 50000,
            amount: 50000,
          },
        ],
      },
      {
        invoiceNumber: "INV-2026-03-002",
        userId: SEED_IDS.residentUser,
        unitNumber: "A-12-03",
        category: "Utility",
        description: "Electricity Bill — February 2026",
        issueDate: "2026-03-01",
        dueDate: "2026-03-15",
        totalAmount: "168000",
        paidAmount: "100000",
        status: "partially_paid" as const,
        month: "2026-03",
        lineItems: [
          {
            id: "li10",
            description: "Electricity Consumption (530 kWh)",
            quantity: 530,
            unitPrice: 250,
            amount: 132500,
          },
          { id: "li11", description: "Meter Rental", quantity: 1, unitPrice: 15000, amount: 15000 },
          {
            id: "li12",
            description: "Administration Fee",
            quantity: 1,
            unitPrice: 20500,
            amount: 20500,
          },
        ],
      },
      // Water bill for Ma Aye Aye — overdue
      {
        invoiceNumber: "INV-2026-02-003",
        userId: SEED_IDS.residentUser,
        unitNumber: "A-12-03",
        category: "Utility",
        description: "Water Bill — January 2026",
        issueDate: "2026-02-01",
        dueDate: "2026-02-15",
        totalAmount: "45000",
        paidAmount: "0",
        status: "unpaid" as const,
        month: "2026-02",
        lineItems: [
          { id: "li13", description: "Water Consumption (38 m³)", quantity: 38, unitPrice: 1000, amount: 38000 },
          { id: "li14", description: "Sewage Charge", quantity: 1, unitPrice: 5000, amount: 5000 },
          { id: "li15", description: "Meter Reading Fee", quantity: 1, unitPrice: 2000, amount: 2000 },
        ],
      },
      // Parking fee for Ma Aye Aye
      {
        invoiceNumber: "INV-2026-04-003",
        userId: SEED_IDS.residentUser,
        unitNumber: "A-12-03",
        category: "Parking",
        description: "Monthly Parking Fee — April 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-15",
        totalAmount: "80000",
        paidAmount: "80000",
        status: "paid" as const,
        month: "2026-04",
        lineItems: [
          { id: "li16", description: "Covered Parking Bay P-A-023", quantity: 1, unitPrice: 80000, amount: 80000 },
        ],
      },
      // ——— U Hla Win (Estella B-05-12) invoices ———
      {
        invoiceNumber: "INV-2026-04-004",
        userId: SEED_IDS.residentUser2,
        unitNumber: "B-05-12",
        category: "Service Charge",
        description: "Monthly Service Charge — April 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-15",
        totalAmount: "320000",
        paidAmount: "0",
        status: "unpaid" as const,
        month: "2026-04",
        lineItems: [
          { id: "li17", description: "Building Management Fee", quantity: 1, unitPrice: 170000, amount: 170000 },
          { id: "li18", description: "Common Area Maintenance", quantity: 1, unitPrice: 95000, amount: 95000 },
          { id: "li19", description: "Security Services", quantity: 1, unitPrice: 55000, amount: 55000 },
        ],
      },
      {
        invoiceNumber: "INV-2026-04-005",
        userId: SEED_IDS.residentUser2,
        unitNumber: "B-05-12",
        category: "Utility",
        description: "Electricity Bill — March 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-15",
        totalAmount: "195000",
        paidAmount: "195000",
        status: "paid" as const,
        month: "2026-04",
        lineItems: [
          { id: "li20", description: "Electricity Consumption (680 kWh)", quantity: 680, unitPrice: 250, amount: 170000 },
          { id: "li21", description: "Meter Rental", quantity: 1, unitPrice: 15000, amount: 15000 },
          { id: "li22", description: "Administration Fee", quantity: 1, unitPrice: 10000, amount: 10000 },
        ],
      },
      {
        invoiceNumber: "INV-2026-03-003",
        userId: SEED_IDS.residentUser2,
        unitNumber: "B-05-12",
        category: "Service Charge",
        description: "Monthly Service Charge — March 2026",
        issueDate: "2026-03-01",
        dueDate: "2026-03-15",
        totalAmount: "320000",
        paidAmount: "320000",
        status: "paid" as const,
        month: "2026-03",
        lineItems: [
          { id: "li23", description: "Building Management Fee", quantity: 1, unitPrice: 170000, amount: 170000 },
          { id: "li24", description: "Common Area Maintenance", quantity: 1, unitPrice: 95000, amount: 95000 },
          { id: "li25", description: "Security Services", quantity: 1, unitPrice: 55000, amount: 55000 },
        ],
      },
      // Internet bill for U Hla Win
      {
        invoiceNumber: "INV-2026-04-006",
        userId: SEED_IDS.residentUser2,
        unitNumber: "B-05-12",
        category: "Utility",
        description: "Internet Service — April 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-20",
        totalAmount: "55000",
        paidAmount: "0",
        status: "unpaid" as const,
        month: "2026-04",
        lineItems: [
          { id: "li26", description: "Fibre Broadband 100 Mbps", quantity: 1, unitPrice: 50000, amount: 50000 },
          { id: "li27", description: "Router Rental", quantity: 1, unitPrice: 5000, amount: 5000 },
        ],
      },
      // ——— Ma Nwe Nwe Oo (ARA C-08-07) invoices ———
      {
        invoiceNumber: "INV-2026-04-007",
        userId: SEED_IDS.residentUser3,
        unitNumber: "C-08-07",
        category: "Service Charge",
        description: "Monthly Service Charge — April 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-15",
        totalAmount: "250000",
        paidAmount: "0",
        status: "unpaid" as const,
        month: "2026-04",
        lineItems: [
          { id: "li28", description: "Building Management Fee", quantity: 1, unitPrice: 130000, amount: 130000 },
          { id: "li29", description: "Common Area Maintenance", quantity: 1, unitPrice: 75000, amount: 75000 },
          { id: "li30", description: "Security Services", quantity: 1, unitPrice: 45000, amount: 45000 },
        ],
      },
      {
        invoiceNumber: "INV-2026-04-008",
        userId: SEED_IDS.residentUser3,
        unitNumber: "C-08-07",
        category: "Utility",
        description: "Electricity Bill — March 2026",
        issueDate: "2026-04-01",
        dueDate: "2026-04-15",
        totalAmount: "98500",
        paidAmount: "98500",
        status: "paid" as const,
        month: "2026-04",
        lineItems: [
          { id: "li31", description: "Electricity Consumption (310 kWh)", quantity: 310, unitPrice: 250, amount: 77500 },
          { id: "li32", description: "Meter Rental", quantity: 1, unitPrice: 15000, amount: 15000 },
          { id: "li33", description: "Administration Fee", quantity: 1, unitPrice: 6000, amount: 6000 },
        ],
      },
      // Water bill for Ma Nwe Nwe Oo — partially paid
      {
        invoiceNumber: "INV-2026-03-004",
        userId: SEED_IDS.residentUser3,
        unitNumber: "C-08-07",
        category: "Utility",
        description: "Water Bill — February 2026",
        issueDate: "2026-03-01",
        dueDate: "2026-03-15",
        totalAmount: "52000",
        paidAmount: "30000",
        status: "partially_paid" as const,
        month: "2026-03",
        lineItems: [
          { id: "li34", description: "Water Consumption (42 m³)", quantity: 42, unitPrice: 1000, amount: 42000 },
          { id: "li35", description: "Sewage Charge", quantity: 1, unitPrice: 7000, amount: 7000 },
          { id: "li36", description: "Meter Reading Fee", quantity: 1, unitPrice: 3000, amount: 3000 },
        ],
      },
    ])
    .onConflictDoNothing();
  console.log("Invoices seeded.");
}

async function seedFacilities() {
  const existing = await db.select().from(facilitiesTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding facilities...");
  // onConflictDoNothing guards against PK collisions (belt-and-suspenders with count check above)
  await db
    .insert(facilitiesTable)
    .values([
      {
        name: "Olympic Swimming Pool",
        description:
          "50-metre Olympic-standard swimming pool with 8 lanes, ideal for fitness laps and recreational swimming. Heated and monitored by certified lifeguards.",
        category: "swimming_pool" as const,
        memberRate: "15000",
        nonMemberRate: "25000",
        openingTime: "06:00",
        closingTime: "21:00",
        maxCapacity: 50,
        isAvailable: true,
      },
      {
        name: "Tennis Court A",
        description:
          "International-standard hard court with LED lighting for evening play. Rackets and balls available for rent at the sports desk.",
        category: "tennis_court" as const,
        memberRate: "8000",
        nonMemberRate: "15000",
        openingTime: "06:00",
        closingTime: "22:00",
        maxCapacity: 4,
        isAvailable: true,
      },
      {
        name: "Fully Equipped Gymnasium",
        description:
          "State-of-the-art gym with cardio machines, free weights, resistance machines, yoga studio, and dedicated spin room. Personal training available on request.",
        category: "gym" as const,
        memberRate: "5000",
        nonMemberRate: "12000",
        openingTime: "05:30",
        closingTime: "23:00",
        maxCapacity: 60,
        isAvailable: true,
      },
      {
        name: "Badminton Court 1",
        description:
          "Indoor badminton court with professional lighting and non-slip flooring. Shuttlecocks and rackets available to borrow from the sports desk.",
        category: "badminton_court" as const,
        memberRate: "5000",
        nonMemberRate: "10000",
        openingTime: "07:00",
        closingTime: "22:00",
        maxCapacity: 4,
        isAvailable: true,
      },
      {
        name: "Function Room",
        description:
          "Versatile event space accommodating up to 80 guests. Includes projector, sound system, and catering kitchen. Ideal for community events and private celebrations.",
        category: "function_room" as const,
        memberRate: "80000",
        nonMemberRate: "120000",
        openingTime: "08:00",
        closingTime: "22:00",
        maxCapacity: 80,
        isAvailable: true,
      },
    ])
    .onConflictDoNothing();
  console.log("Facilities seeded.");
}

async function seedTickets() {
  const existing = await db.select().from(ticketsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding tickets...");
  // onConflictDoNothing guards against PK collisions (belt-and-suspenders with count check above)
  await db
    .insert(ticketsTable)
    .values([
      {
        ticketNumber: "SA-0001",
        userId: SEED_IDS.residentUser,
        title: "Air conditioning not working in bedroom",
        category: "air_conditioning" as const,
        serviceType: "Repair",
        status: "in_progress" as const,
        unitNumber: "A-12-03",
        description:
          "The air conditioning unit in the master bedroom stopped working yesterday evening. It powers on but no cold air comes out. Outside temperature is very hot.",
        updates: [
          {
            id: "u1",
            message:
              "We have logged your request and assigned it to our HVAC team. A technician will visit on 10 April between 9AM-12PM.",
            author: "StarCity Support",
            authorType: "staff",
            createdAt: "2026-04-09T10:00:00Z",
          },
        ],
      },
      {
        ticketNumber: "SA-0002",
        userId: SEED_IDS.residentUser,
        title: "Water leak from ceiling in bathroom",
        category: "plumbing" as const,
        serviceType: "Emergency Repair",
        status: "open" as const,
        unitNumber: "A-12-03",
        description:
          "There is water dripping from the ceiling in the bathroom near the shower. The dripping started this morning and seems to be getting worse.",
        updates: [],
      },
      {
        ticketNumber: "SA-0003",
        userId: SEED_IDS.guestUser,
        title: "General inquiry about SCSC membership",
        category: "general_enquiry" as const,
        serviceType: "Information Request",
        status: "completed" as const,
        unitNumber: null,
        description:
          "I would like to know the membership fees for StarCity Sports Centre and what facilities are included.",
        updates: [
          {
            id: "u2",
            message:
              "Thank you for your enquiry. SCSC membership fees are: Individual 150,000 MMK/month, Family 250,000 MMK/month. All facilities included. Please visit the sports centre reception to sign up.",
            author: "StarCity Support",
            authorType: "staff",
            createdAt: "2026-04-07T14:00:00Z",
          },
        ],
      },
      // Electricals ticket — U Hla Win
      {
        ticketNumber: "SA-0004",
        userId: SEED_IDS.residentUser2,
        title: "Flickering lights in living room",
        category: "electricals" as const,
        serviceType: "Repair",
        status: "open" as const,
        unitNumber: "B-05-12",
        description:
          "The ceiling lights in the living room have been flickering intermittently for the past two days. It happens mostly in the evening. I have tried replacing the bulbs but the issue persists — it may be an electrical wiring problem.",
        updates: [],
      },
      // Housekeeping ticket — Ma Aye Aye
      {
        ticketNumber: "SA-0005",
        userId: SEED_IDS.residentUser,
        title: "Request for deep cleaning of corridor",
        category: "housekeeping" as const,
        serviceType: "Cleaning",
        status: "completed" as const,
        unitNumber: "A-12-03",
        description:
          "The corridor outside units A-12-01 to A-12-06 has not been cleaned thoroughly this week. There are stains on the floor and the rubbish area smells. Please arrange a deep cleaning.",
        updates: [
          {
            id: "u3",
            message: "Our housekeeping team has completed the deep cleaning of the 12th floor corridor in Block A. Thank you for reporting.",
            author: "StarCity Support",
            authorType: "staff",
            createdAt: "2026-04-08T16:30:00Z",
          },
        ],
      },
      // Pest control — Ma Nwe Nwe Oo
      {
        ticketNumber: "SA-0006",
        userId: SEED_IDS.residentUser3,
        title: "Cockroach infestation in kitchen",
        category: "pest_control" as const,
        serviceType: "Pest Treatment",
        status: "in_progress" as const,
        unitNumber: "C-08-07",
        description:
          "We have noticed an increasing number of cockroaches in the kitchen area over the past week, particularly near the sink and waste bin. Please arrange pest control treatment as soon as possible.",
        updates: [
          {
            id: "u4",
            message: "We have scheduled a pest control treatment for your unit on 14 April between 2PM-4PM. Please ensure the kitchen area is accessible and all food items are covered or stored.",
            author: "StarCity Support",
            authorType: "staff",
            createdAt: "2026-04-11T09:00:00Z",
          },
        ],
      },
      // Civil works — U Hla Win
      {
        ticketNumber: "SA-0007",
        userId: SEED_IDS.residentUser2,
        title: "Cracked tile in bathroom floor",
        category: "civil_works" as const,
        serviceType: "Repair",
        status: "open" as const,
        unitNumber: "B-05-12",
        description:
          "A floor tile in the master bathroom has developed a large crack. It is near the shower area and I am concerned about water seeping through. The crack is approximately 15cm long.",
        updates: [],
      },
      // Plumbing — Ma Nwe Nwe Oo
      {
        ticketNumber: "SA-0008",
        userId: SEED_IDS.residentUser3,
        title: "Kitchen sink draining slowly",
        category: "plumbing" as const,
        serviceType: "Repair",
        status: "in_progress" as const,
        unitNumber: "C-08-07",
        description:
          "The kitchen sink has been draining very slowly for about a week. Water now takes over 5 minutes to drain completely. I suspect there may be a blockage in the pipe.",
        updates: [
          {
            id: "u5",
            message: "Our plumbing team visited on 10 April and performed an initial inspection. A partial blockage was found. We will return on 12 April with specialised equipment to clear the pipe fully.",
            author: "StarCity Support",
            authorType: "staff",
            createdAt: "2026-04-10T15:00:00Z",
          },
        ],
      },
      // Closed ticket — Ma Aye Aye
      {
        ticketNumber: "SA-0009",
        userId: SEED_IDS.residentUser,
        title: "Replace damaged door handle",
        category: "civil_works" as const,
        serviceType: "Repair",
        status: "closed" as const,
        unitNumber: "A-12-03",
        description:
          "The front door handle of my unit is loose and about to fall off. It has been like this for a few days. Please send someone to fix or replace it.",
        updates: [
          {
            id: "u6",
            message: "A technician visited on 5 April and replaced the door handle with a new one. Please confirm if everything is satisfactory.",
            author: "StarCity Support",
            authorType: "staff",
            createdAt: "2026-04-05T11:00:00Z",
          },
          {
            id: "u7",
            message: "The new handle works perfectly. Thank you for the quick fix!",
            author: "Ma Aye Aye",
            authorType: "resident",
            createdAt: "2026-04-05T18:00:00Z",
          },
        ],
      },
      // Other category — guest user
      {
        ticketNumber: "SA-0010",
        userId: SEED_IDS.guestUser2,
        title: "Noise complaint from unit above",
        category: "other" as const,
        serviceType: "Complaint",
        status: "open" as const,
        unitNumber: null,
        description:
          "There has been loud construction noise from the unit above during quiet hours (after 10PM) for the past three nights. It is very disruptive and affecting our sleep.",
        updates: [],
      },
    ])
    .onConflictDoNothing();
  console.log("Tickets seeded.");
}

async function seedBookings() {
  const existing = await db.select().from(bookingsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding bookings...");

  // Look up facility IDs by name from the seeded facilities
  const [pool] = await db
    .select()
    .from(facilitiesTable)
    .where(eq(facilitiesTable.name, "Olympic Swimming Pool"))
    .limit(1);
  const [tennis] = await db
    .select()
    .from(facilitiesTable)
    .where(eq(facilitiesTable.name, "Tennis Court A"))
    .limit(1);
  const [gym] = await db
    .select()
    .from(facilitiesTable)
    .where(eq(facilitiesTable.name, "Fully Equipped Gymnasium"))
    .limit(1);

  if (!pool || !tennis || !gym) {
    console.warn(
      "Facilities not found — skipping bookings seed. Run seed again after facilities are created.",
    );
    return;
  }

  // onConflictDoNothing guards against PK collisions (belt-and-suspenders with count check above)
  await db
    .insert(bookingsTable)
    .values([
      {
        bookingNumber: "BK-0001",
        userId: SEED_IDS.residentUser,
        facilityId: pool.id,
        facilityName: pool.name,
        facilityCategory: pool.category,
        date: "2026-04-20",
        startTime: "08:00",
        endTime: "09:00",
        totalAmount: "15000",
        status: "upcoming" as const,
        paymentStatus: "paid" as const,
        notes: "Morning lap swim session",
      },
      {
        bookingNumber: "BK-0002",
        userId: SEED_IDS.residentUser,
        facilityId: tennis.id,
        facilityName: tennis.name,
        facilityCategory: tennis.category,
        date: "2026-04-05",
        startTime: "07:00",
        endTime: "08:00",
        totalAmount: "8000",
        status: "completed" as const,
        paymentStatus: "paid" as const,
        notes: null,
      },
      {
        bookingNumber: "BK-0003",
        userId: SEED_IDS.residentUser,
        facilityId: gym.id,
        facilityName: gym.name,
        facilityCategory: gym.category,
        date: "2026-04-12",
        startTime: "06:00",
        endTime: "07:00",
        totalAmount: "5000",
        status: "cancelled" as const,
        paymentStatus: "refunded" as const,
        notes: "Cancelled due to pool maintenance day",
      },
    ])
    .onConflictDoNothing();
  console.log("Bookings seeded.");
}

async function seedWalletTransactions() {
  const existing = await db.select().from(walletTransactionsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding wallet transactions...");
  await db
    .insert(walletTransactionsTable)
    .values([
      // Ma Aye Aye — wallet top-ups and payments
      {
        userId: SEED_IDS.residentUser,
        type: "credit" as const,
        amount: "500000",
        description: "Wallet top-up via KBZPay",
        reference: "KBZ-TXN-20260401-001",
        category: "top_up",
        createdAt: new Date("2026-04-01T10:30:00Z"),
      },
      {
        userId: SEED_IDS.residentUser,
        type: "debit" as const,
        amount: "285000",
        description: "Payment for INV-2026-03-001 — Service Charge March 2026",
        reference: "INV-2026-03-001",
        category: "bill_payment",
        createdAt: new Date("2026-04-02T09:15:00Z"),
      },
      {
        userId: SEED_IDS.residentUser,
        type: "debit" as const,
        amount: "100000",
        description: "Partial payment for INV-2026-03-002 — Electricity Feb 2026",
        reference: "INV-2026-03-002",
        category: "bill_payment",
        createdAt: new Date("2026-04-03T14:00:00Z"),
      },
      {
        userId: SEED_IDS.residentUser,
        type: "debit" as const,
        amount: "80000",
        description: "Payment for INV-2026-04-003 — Parking April 2026",
        reference: "INV-2026-04-003",
        category: "bill_payment",
        createdAt: new Date("2026-04-05T08:00:00Z"),
      },
      {
        userId: SEED_IDS.residentUser,
        type: "debit" as const,
        amount: "15000",
        description: "Facility booking BK-0001 — Olympic Swimming Pool",
        reference: "BK-0001",
        category: "booking",
        createdAt: new Date("2026-04-06T07:30:00Z"),
      },
      {
        userId: SEED_IDS.residentUser,
        type: "credit" as const,
        amount: "5000",
        description: "Refund for cancelled booking BK-0003 — Gymnasium",
        reference: "BK-0003",
        category: "refund",
        createdAt: new Date("2026-04-07T12:00:00Z"),
      },
      {
        userId: SEED_IDS.residentUser,
        type: "credit" as const,
        amount: "200000",
        description: "Wallet top-up via WavePay",
        reference: "WAVE-TXN-20260408-001",
        category: "top_up",
        createdAt: new Date("2026-04-08T16:45:00Z"),
      },
      // U Hla Win — wallet activity
      {
        userId: SEED_IDS.residentUser2,
        type: "credit" as const,
        amount: "600000",
        description: "Wallet top-up via KBZPay",
        reference: "KBZ-TXN-20260328-002",
        category: "top_up",
        createdAt: new Date("2026-03-28T11:00:00Z"),
      },
      {
        userId: SEED_IDS.residentUser2,
        type: "debit" as const,
        amount: "320000",
        description: "Payment for INV-2026-03-003 — Service Charge March 2026",
        reference: "INV-2026-03-003",
        category: "bill_payment",
        createdAt: new Date("2026-03-30T09:00:00Z"),
      },
      {
        userId: SEED_IDS.residentUser2,
        type: "debit" as const,
        amount: "195000",
        description: "Payment for INV-2026-04-005 — Electricity March 2026",
        reference: "INV-2026-04-005",
        category: "bill_payment",
        createdAt: new Date("2026-04-05T10:30:00Z"),
      },
      {
        userId: SEED_IDS.residentUser2,
        type: "credit" as const,
        amount: "400000",
        description: "Wallet top-up via WavePay",
        reference: "WAVE-TXN-20260410-002",
        category: "top_up",
        createdAt: new Date("2026-04-10T14:00:00Z"),
      },
      // Ma Nwe Nwe Oo — wallet activity
      {
        userId: SEED_IDS.residentUser3,
        type: "credit" as const,
        amount: "350000",
        description: "Wallet top-up via KBZPay",
        reference: "KBZ-TXN-20260325-003",
        category: "top_up",
        createdAt: new Date("2026-03-25T09:00:00Z"),
      },
      {
        userId: SEED_IDS.residentUser3,
        type: "debit" as const,
        amount: "98500",
        description: "Payment for INV-2026-04-008 — Electricity March 2026",
        reference: "INV-2026-04-008",
        category: "bill_payment",
        createdAt: new Date("2026-04-04T11:00:00Z"),
      },
      {
        userId: SEED_IDS.residentUser3,
        type: "debit" as const,
        amount: "30000",
        description: "Partial payment for INV-2026-03-004 — Water Feb 2026",
        reference: "INV-2026-03-004",
        category: "bill_payment",
        createdAt: new Date("2026-04-06T15:30:00Z"),
      },
      {
        userId: SEED_IDS.residentUser3,
        type: "credit" as const,
        amount: "300000",
        description: "Wallet top-up via KBZPay",
        reference: "KBZ-TXN-20260412-003",
        category: "top_up",
        createdAt: new Date("2026-04-12T10:00:00Z"),
      },
    ])
    .onConflictDoNothing();
  console.log("Wallet transactions seeded.");
}

async function seedInfoCategories() {
  const existing = await db.select().from(infoCategoriesTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding info categories...");
  await db.insert(infoCategoriesTable).values([
    {
      name: "Estate Rules & Guidelines",
      icon: "file-text",
      description: "Community guidelines, by-laws, and estate regulations for all residents.",
      articleCount: 5,
    },
    {
      name: "Utilities & Services",
      icon: "zap",
      description: "Information about electricity, water, internet, and waste management services.",
      articleCount: 4,
    },
    {
      name: "Emergency Contacts",
      icon: "phone",
      description: "Security, medical, fire, and utilities emergency contact numbers.",
      articleCount: 2,
    },
    {
      name: "Move-In Guide",
      icon: "home",
      description: "Step-by-step guide for new residents moving into StarCity Estate.",
      articleCount: 3,
    },
    {
      name: "Facilities Guide",
      icon: "dumbbell",
      description: "How to use and book StarCity Sports Centre facilities.",
      articleCount: 6,
    },
    {
      name: "Payment & Billing",
      icon: "credit-card",
      description: "Understanding your invoices, payment methods, and billing queries.",
      articleCount: 4,
    },
  ]);
  console.log("Info categories seeded.");
}

async function seedInfoArticles() {
  const existing = await db.select().from(infoArticlesTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding info articles...");
  const [cat1] = await db.select().from(infoCategoriesTable).limit(1);
  if (!cat1) {
    console.warn("Info categories not found — skipping info articles seed.");
    return;
  }
  await db.insert(infoArticlesTable).values([
    {
      title: "Community Rules and Quiet Hours",
      content:
        "# Community Rules and Quiet Hours\n\n## Quiet Hours\n\nQuiet hours at StarCity Estate are strictly observed from **10:00 PM to 7:00 AM** on weekdays and **11:00 PM to 8:00 AM** on weekends and public holidays.\n\nDuring quiet hours, residents are required to:\n- Keep music and television at a reasonable volume\n- Avoid noisy renovation or construction works\n- Minimise noise in corridors and lift lobbies\n\n## Pet Policy\n\nPets are welcome at StarCity Estate. Owners must:\n- Register all pets with the management office\n- Keep pets on a lead in all common areas\n- Clean up after pets immediately\n\n## Visitor Policy\n\nVisitors must register at the security booth and receive a visitor pass. Long-stay visitors (more than 7 nights) must be declared to estate management.",
      summary:
        "Community rules covering quiet hours (10PM-7AM), pet policy, and visitor registration requirements.",
      categoryId: cat1.id,
      categoryName: cat1.name,
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    },
  ]);
  console.log("Info articles seeded.");
}

async function seedFaqs() {
  const existing = await db.select().from(faqsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding FAQs...");
  await db.insert(faqsTable).values([
    {
      question: "How do I pay my monthly service charge?",
      answer:
        "You can pay through the Bill Payment section in the app using WavePay or KBZPay. Navigate to Bills, select the invoice, and choose your preferred payment method.",
      category: "Billing & Payments",
      isPublished: true,
      sortOrder: 1,
    },
    {
      question: "How do I book a facility at SCSC?",
      answer:
        "Go to the Bookings section from the home screen. Select the facility, choose a date and time slot, confirm the booking details, and proceed with payment.",
      category: "Facilities",
      isPublished: true,
      sortOrder: 2,
    },
    {
      question: "How do I upgrade my account to resident status?",
      answer:
        "Visit your Profile and tap 'Upgrade to Resident'. Enter your unit number and Resident ID. Our team will verify and approve your request within 1-2 business days.",
      category: "Account",
      isPublished: true,
      sortOrder: 3,
    },
    {
      question: "What is my Resident ID?",
      answer:
        "Your Resident ID is a unique identifier assigned by the estate management office when you registered as a resident. It is printed on your resident welcome letter. Contact the management office if you have lost it.",
      category: "Account",
      isPublished: true,
      sortOrder: 4,
    },
    {
      question: "How do I raise a maintenance request?",
      answer:
        "Use the Star Assist feature from the home screen. Select a category (e.g. Electricals, Plumbing), describe the issue, and submit. Our team will respond within 24 hours.",
      category: "Star Assist",
      isPublished: true,
      sortOrder: 5,
    },
  ]);
  console.log("FAQs seeded.");
}

async function seedNotifications() {
  const existing = await db.select().from(notificationsTable).limit(1);
  if (existing.length > 0) return;
  console.log("Seeding notifications...");
  await db.insert(notificationsTable).values([
    {
      userId: SEED_IDS.residentUser,
      title: "Invoice Due Soon",
      body: "Your April 2026 service charge invoice (INV-2026-04-001) of 285,000 MMK is due on 15 April.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
    {
      userId: SEED_IDS.residentUser,
      title: "Water Supply Interruption",
      body: "Scheduled water interruption on 12 April from 8AM to 12PM in City Loft Blocks A, B, C.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
    {
      userId: SEED_IDS.residentUser,
      title: "Ticket Update: AC Repair",
      body: "Your ticket SA-0001 has been assigned to our HVAC team. A technician will visit on 10 April.",
      type: "announcement" as const,
      isRead: true,
      relatedId: null,
    },
    {
      userId: SEED_IDS.residentUser,
      title: "Payment Received",
      body: "Your payment of 285,000 MMK for Service Charge March 2026 has been received. Thank you!",
      type: "announcement" as const,
      isRead: true,
      relatedId: null,
    },
    {
      userId: SEED_IDS.residentUser,
      title: "Overdue Invoice Reminder",
      body: "Your Water Bill (INV-2026-02-003) of 45,000 MMK was due on 15 Feb. Please settle promptly.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
    // U Hla Win notifications
    {
      userId: SEED_IDS.residentUser2,
      title: "Invoice Due Soon",
      body: "Your April 2026 service charge invoice (INV-2026-04-004) of 320,000 MMK is due on 15 April.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
    {
      userId: SEED_IDS.residentUser2,
      title: "Ticket Submitted",
      body: "Your ticket SA-0004 for flickering lights has been submitted. Our team will respond within 24 hours.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
    // Ma Nwe Nwe Oo notifications
    {
      userId: SEED_IDS.residentUser3,
      title: "Pest Control Scheduled",
      body: "Pest control for ticket SA-0006 is scheduled for 14 April, 2PM-4PM. Please ensure kitchen access.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
    {
      userId: SEED_IDS.residentUser3,
      title: "Partial Payment Acknowledged",
      body: "Your partial payment of 30,000 MMK for Water Bill (INV-2026-03-004) has been recorded. Balance remaining: 22,000 MMK.",
      type: "announcement" as const,
      isRead: true,
      relatedId: null,
    },
  ]);
  console.log("Notifications seeded.");
}

async function seed() {
  console.log("Seeding database...");

  // Seed Supabase Auth users first (requires env vars)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await seedAuthUsers();
  } else {
    console.log(
      "Skipping Supabase Auth seeding (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set)",
    );
  }

  await seedStaffUsers();
  await seedUsers();
  await seedUpgradeRequests();
  await seedAnnouncements();
  await seedPromotions();
  await seedInvoices();
  await seedFacilities();
  await seedTickets();
  await seedBookings();
  await seedWalletTransactions();
  await seedInfoCategories();
  await seedInfoArticles();
  await seedFaqs();
  await seedNotifications();

  console.log("\nSeeding complete!");
  console.log("Demo accounts:");
  console.log("  Guest:      demo@starcity.com / password123");
  console.log("  Resident 1: resident@starcity.com / password123  (City Loft A-12-03)");
  console.log("  Resident 2: hla.win@gmail.com / password123      (Estella B-05-12)");
  console.log("  Resident 3: nwe.nwe@gmail.com / password123      (ARA C-08-07)");
  console.log("Admin accounts:");
  console.log("  Admin:      admin@starcity.com / admin123");
  console.log("  Content:    content@starcity.com / content123");
  console.log("  Support:    support@starcity.com / support123");
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
