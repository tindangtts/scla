import { db } from "@workspace/db";
import {
  usersTable, announcementsTable, promotionsTable,
  invoicesTable, facilitiesTable, infoCategoriesTable, infoArticlesTable, notificationsTable,
  staffUsersTable, ticketsTable, upgradeRequestsTable, faqsTable
} from "@workspace/db";
import { hashPasswordBcrypt } from "./lib/password.js";

async function seedStaffUsers() {
  const existingStaff = await db.select().from(staffUsersTable).limit(1);
  if (existingStaff.length > 0) return;

  console.log("Seeding staff users...");
  await db.insert(staffUsersTable).values([
    {
      name: "U Kyaw Zin",
      email: "admin@starcity.com",
      passwordHash: await hashPasswordBcrypt("admin123"),
      role: "admin" as const,
      isActive: true,
    },
    {
      name: "Ma Su Su",
      email: "content@starcity.com",
      passwordHash: await hashPasswordBcrypt("content123"),
      role: "content_manager" as const,
      isActive: true,
    },
    {
      name: "Ko Nay Lin",
      email: "support@starcity.com",
      passwordHash: await hashPasswordBcrypt("support123"),
      role: "ticket_handler" as const,
      isActive: true,
    },
  ]);
  console.log("Staff users seeded.");
}

async function seed() {
  console.log("Seeding database...");

  await seedStaffUsers();

  const existingUsers = await db.select().from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const [guestUser] = await db.insert(usersTable).values({
    name: "Ko Zin Min",
    email: "demo@starcity.com",
    phone: "09-999-111-222",
    passwordHash: await hashPasswordBcrypt("password123"),
    userType: "guest",
    upgradeStatus: "none",
  }).returning();

  const [residentUser] = await db.insert(usersTable).values({
    name: "Ma Aye Aye",
    email: "resident@starcity.com",
    phone: "09-888-333-444",
    passwordHash: await hashPasswordBcrypt("password123"),
    userType: "resident",
    unitNumber: "A-12-03",
    residentId: "SC-2023-00142",
    developmentName: "City Loft",
    upgradeStatus: "approved",
  }).returning();

  const [guestUser2] = await db.insert(usersTable).values({
    name: "Ko Aung Kyaw",
    email: "aung.kyaw@gmail.com",
    phone: "09-777-222-333",
    passwordHash: await hashPasswordBcrypt("password123"),
    userType: "guest",
    upgradeStatus: "pending",
  }).returning();

  const [guestUser3] = await db.insert(usersTable).values({
    name: "Ma Thida Nwe",
    email: "thida.nwe@outlook.com",
    phone: "09-666-444-555",
    passwordHash: await hashPasswordBcrypt("password123"),
    userType: "guest",
    upgradeStatus: "none",
  }).returning();

  await db.insert(upgradeRequestsTable).values({
    userId: guestUser2.id,
    userName: guestUser2.name,
    userEmail: guestUser2.email,
    unitNumber: "B-05-12",
    residentId: "SC-2024-00389",
    developmentName: "Estella",
    status: "pending",
  });

  await db.insert(announcementsTable).values([
    {
      title: "Scheduled Water Supply Interruption — 12 April 2026",
      content: "Dear StarCity Residents,\n\nPlease be informed that there will be a scheduled water supply interruption on Saturday, 12 April 2026, from 8:00 AM to 12:00 PM for maintenance work on the main water supply line.\n\nAffected zones: City Loft Blocks A, B, C and Estella Tower 1.\n\nWe apologise for any inconvenience caused. Please store sufficient water prior to the maintenance window. For urgent assistance, please contact our 24-hour hotline at 09-123-456-789.\n\nThank you for your understanding.\n\nStarCity Estate Management",
      summary: "Water supply will be interrupted on 12 April from 8AM to 12PM for maintenance in City Loft and Estella Tower 1.",
      type: "announcement" as const,
      isPinned: true,
      isDraft: false,
      targetAudience: "all" as const,
      tags: ["maintenance", "water"],
      publishedAt: new Date("2026-04-08T09:00:00Z"),
    },
    {
      title: "StarCity Sports Centre — April Pool Cleaning Schedule",
      content: "Dear Residents,\n\nThe main swimming pool at StarCity Sports Centre (SCSC) will undergo its monthly deep cleaning on:\n\n• Thursday, 10 April 2026 — 7:00 AM to 3:00 PM\n\nDuring this time, the main pool will be closed. The leisure pool will remain open. We apologise for the inconvenience and thank you for your patience.\n\nSCSC Operations Team",
      summary: "Main swimming pool closed for cleaning on 10 April from 7AM to 3PM. Leisure pool remains open.",
      type: "announcement" as const,
      isPinned: false,
      isDraft: false,
      targetAudience: "all" as const,
      tags: ["facilities", "pool"],
      publishedAt: new Date("2026-04-06T10:00:00Z"),
    },
    {
      title: "StarCity Community Newsletter — March 2026",
      content: "# StarCity Monthly Newsletter — March 2026\n\n## A Message from the Estate Director\n\nDear StarCity Family,\n\nMarch has been a wonderful month for our community. We welcomed 45 new families across City Loft and ARA, hosted our Thingyan celebration at the Central Plaza, and completed phase 2 of the landscape renovation in Estella.\n\n## Community Highlights\n\n**Thingyan Festival 2026** — Over 500 residents joined our water festival celebration on 13-17 April. A special thank you to our Residents' Committee for organising the event.\n\n**New Facilities** — The upgraded gym at SCSC is now open with 20 new equipment pieces including treadmills, rowing machines, and a dedicated yoga studio.\n\n**Green Initiative** — Our composting programme in City Loft now diverts over 200kg of organic waste per month from landfill.\n\n## Upcoming Events\n\n• 20 April — Children's Art Competition (Central Playground)\n• 25 April — Residents' Forum (Community Hall, 7PM)\n• 3 May — SCSC Annual Fun Run\n\nWarm regards,\nDaw Khin Mar Lwin\nEstate Director, StarCity",
      summary: "March community highlights including Thingyan celebrations, new gym equipment, and upcoming events for April and May.",
      type: "newsletter" as const,
      isPinned: false,
      isDraft: false,
      targetAudience: "all" as const,
      tags: ["newsletter", "community"],
      publishedAt: new Date("2026-04-01T08:00:00Z"),
    },
    {
      title: "Important: Resident ID Update — Action Required",
      content: "Dear Residents,\n\nPlease ensure your resident ID is updated in the app by 30 April 2026. Visit the Profile section to verify your linked unit information.",
      summary: "Residents must update their Resident ID in the app by 30 April 2026.",
      type: "announcement" as const,
      isPinned: false,
      isDraft: true,
      targetAudience: "residents_only" as const,
      tags: ["resident", "action-required"],
      publishedAt: new Date("2026-04-10T09:00:00Z"),
    },
  ]);

  await db.insert(promotionsTable).values([
    {
      title: "20% Off All Coffee at The Roost Cafe",
      description: "StarCity residents enjoy 20% off all beverages at The Roost Cafe, located at the City Loft Ground Floor Commercial Hub. Simply show your SCLA app or StarCity resident card to redeem. Valid Monday to Friday, 7AM to 5PM.",
      category: "F&B",
      partnerName: "The Roost Cafe",
      validFrom: new Date("2026-04-01T00:00:00Z"),
      validUntil: new Date("2026-06-30T23:59:59Z"),
      isActive: true,
    },
    {
      title: "Complimentary Fitness Assessment at SCSC",
      description: "New to the gym? Get a complimentary 45-minute fitness assessment with our certified trainers at StarCity Sports Centre. Available for all residents and sports centre members. Book through the SCLA app.",
      category: "Health & Fitness",
      partnerName: "StarCity Sports Centre",
      validFrom: new Date("2026-04-01T00:00:00Z"),
      validUntil: new Date("2026-04-30T23:59:59Z"),
      isActive: true,
    },
    {
      title: "10% Off Grocery Delivery — FreshMart Partnership",
      description: "Enjoy 10% off your first three grocery orders through FreshMart's delivery service. Use promo code STARCITY10 at checkout. Delivery available to all StarCity Estate units within 2 hours.",
      category: "Shopping",
      partnerName: "FreshMart Myanmar",
      validFrom: new Date("2026-03-15T00:00:00Z"),
      validUntil: new Date("2026-05-31T23:59:59Z"),
      isActive: true,
    },
  ]);

  await db.insert(invoicesTable).values([
    {
      invoiceNumber: "INV-2026-04-001",
      userId: residentUser.id,
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
        { id: "li1", description: "Building Management Fee", quantity: 1, unitPrice: 150000, amount: 150000 },
        { id: "li2", description: "Common Area Maintenance", quantity: 1, unitPrice: 85000, amount: 85000 },
        { id: "li3", description: "Security Services", quantity: 1, unitPrice: 50000, amount: 50000 },
      ],
    },
    {
      invoiceNumber: "INV-2026-04-002",
      userId: residentUser.id,
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
        { id: "li4", description: "Electricity Consumption (450 kWh)", quantity: 450, unitPrice: 250, amount: 112500 },
        { id: "li5", description: "Meter Rental", quantity: 1, unitPrice: 15000, amount: 15000 },
        { id: "li6", description: "Administration Fee", quantity: 1, unitPrice: 15000, amount: 15000 },
      ],
    },
    {
      invoiceNumber: "INV-2026-03-001",
      userId: residentUser.id,
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
        { id: "li7", description: "Building Management Fee", quantity: 1, unitPrice: 150000, amount: 150000 },
        { id: "li8", description: "Common Area Maintenance", quantity: 1, unitPrice: 85000, amount: 85000 },
        { id: "li9", description: "Security Services", quantity: 1, unitPrice: 50000, amount: 50000 },
      ],
    },
    {
      invoiceNumber: "INV-2026-03-002",
      userId: residentUser.id,
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
        { id: "li10", description: "Electricity Consumption (530 kWh)", quantity: 530, unitPrice: 250, amount: 132500 },
        { id: "li11", description: "Meter Rental", quantity: 1, unitPrice: 15000, amount: 15000 },
        { id: "li12", description: "Administration Fee", quantity: 1, unitPrice: 20500, amount: 20500 },
      ],
    },
  ]);

  await db.insert(facilitiesTable).values([
    {
      name: "Olympic Swimming Pool",
      description: "50-metre Olympic-standard swimming pool with 8 lanes, ideal for fitness laps and recreational swimming. Heated and monitored by certified lifeguards.",
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
      description: "International-standard hard court with LED lighting for evening play. Rackets and balls available for rent at the sports desk.",
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
      description: "State-of-the-art gym with cardio machines, free weights, resistance machines, yoga studio, and dedicated spin room. Personal training available on request.",
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
      description: "Indoor badminton court with professional lighting and non-slip flooring. Shuttlecocks and rackets available to borrow from the sports desk.",
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
      description: "Versatile event space accommodating up to 80 guests. Includes projector, sound system, and catering kitchen. Ideal for community events and private celebrations.",
      category: "function_room" as const,
      memberRate: "80000",
      nonMemberRate: "120000",
      openingTime: "08:00",
      closingTime: "22:00",
      maxCapacity: 80,
      isAvailable: true,
    },
  ]);

  await db.insert(ticketsTable).values([
    {
      ticketNumber: "SA-0001",
      userId: residentUser.id,
      title: "Air conditioning not working in bedroom",
      category: "air_conditioning" as const,
      serviceType: "Repair",
      status: "in_progress" as const,
      unitNumber: "A-12-03",
      description: "The air conditioning unit in the master bedroom stopped working yesterday evening. It powers on but no cold air comes out. Outside temperature is very hot.",
      updates: [
        { id: "u1", message: "We have logged your request and assigned it to our HVAC team. A technician will visit on 10 April between 9AM-12PM.", author: "StarCity Support", authorType: "staff", createdAt: "2026-04-09T10:00:00Z" },
      ],
    },
    {
      ticketNumber: "SA-0002",
      userId: residentUser.id,
      title: "Water leak from ceiling in bathroom",
      category: "plumbing" as const,
      serviceType: "Emergency Repair",
      status: "open" as const,
      unitNumber: "A-12-03",
      description: "There is water dripping from the ceiling in the bathroom near the shower. The dripping started this morning and seems to be getting worse.",
      updates: [],
    },
    {
      ticketNumber: "SA-0003",
      userId: guestUser.id,
      title: "General inquiry about SCSC membership",
      category: "general_enquiry" as const,
      serviceType: "Information Request",
      status: "completed" as const,
      unitNumber: null,
      description: "I would like to know the membership fees for StarCity Sports Centre and what facilities are included.",
      updates: [
        { id: "u2", message: "Thank you for your enquiry. SCSC membership fees are: Individual 150,000 MMK/month, Family 250,000 MMK/month. All facilities included. Please visit the sports centre reception to sign up.", author: "StarCity Support", authorType: "staff", createdAt: "2026-04-07T14:00:00Z" },
      ],
    },
  ]);

  await db.insert(infoCategoriesTable).values([
    { name: "Estate Rules & Guidelines", icon: "file-text", description: "Community guidelines, by-laws, and estate regulations for all residents.", articleCount: 5 },
    { name: "Utilities & Services", icon: "zap", description: "Information about electricity, water, internet, and waste management services.", articleCount: 4 },
    { name: "Emergency Contacts", icon: "phone", description: "Security, medical, fire, and utilities emergency contact numbers.", articleCount: 2 },
    { name: "Move-In Guide", icon: "home", description: "Step-by-step guide for new residents moving into StarCity Estate.", articleCount: 3 },
    { name: "Facilities Guide", icon: "dumbbell", description: "How to use and book StarCity Sports Centre facilities.", articleCount: 6 },
    { name: "Payment & Billing", icon: "credit-card", description: "Understanding your invoices, payment methods, and billing queries.", articleCount: 4 },
  ]);

  const [cat1] = await db.select().from(infoCategoriesTable).limit(1);

  await db.insert(infoArticlesTable).values([
    {
      title: "Community Rules and Quiet Hours",
      content: "# Community Rules and Quiet Hours\n\n## Quiet Hours\n\nQuiet hours at StarCity Estate are strictly observed from **10:00 PM to 7:00 AM** on weekdays and **11:00 PM to 8:00 AM** on weekends and public holidays.\n\nDuring quiet hours, residents are required to:\n- Keep music and television at a reasonable volume\n- Avoid noisy renovation or construction works\n- Minimise noise in corridors and lift lobbies\n\n## Pet Policy\n\nPets are welcome at StarCity Estate. Owners must:\n- Register all pets with the management office\n- Keep pets on a lead in all common areas\n- Clean up after pets immediately\n\n## Visitor Policy\n\nVisitors must register at the security booth and receive a visitor pass. Long-stay visitors (more than 7 nights) must be declared to estate management.",
      summary: "Community rules covering quiet hours (10PM-7AM), pet policy, and visitor registration requirements.",
      categoryId: cat1.id,
      categoryName: cat1.name,
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    },
  ]);

  await db.insert(faqsTable).values([
    { question: "How do I pay my monthly service charge?", answer: "You can pay through the Bill Payment section in the app using WavePay or KBZPay. Navigate to Bills, select the invoice, and choose your preferred payment method.", category: "Billing & Payments", isPublished: true, sortOrder: 1 },
    { question: "How do I book a facility at SCSC?", answer: "Go to the Bookings section from the home screen. Select the facility, choose a date and time slot, confirm the booking details, and proceed with payment.", category: "Facilities", isPublished: true, sortOrder: 2 },
    { question: "How do I upgrade my account to resident status?", answer: "Visit your Profile and tap 'Upgrade to Resident'. Enter your unit number and Resident ID. Our team will verify and approve your request within 1-2 business days.", category: "Account", isPublished: true, sortOrder: 3 },
    { question: "What is my Resident ID?", answer: "Your Resident ID is a unique identifier assigned by the estate management office when you registered as a resident. It is printed on your resident welcome letter. Contact the management office if you have lost it.", category: "Account", isPublished: true, sortOrder: 4 },
    { question: "How do I raise a maintenance request?", answer: "Use the Star Assist feature from the home screen. Select a category (e.g. Electricals, Plumbing), describe the issue, and submit. Our team will respond within 24 hours.", category: "Star Assist", isPublished: true, sortOrder: 5 },
  ]);

  await db.insert(notificationsTable).values([
    {
      userId: residentUser.id,
      title: "Invoice Due Soon",
      body: "Your April 2026 service charge invoice (INV-2026-04-001) of 285,000 MMK is due on 15 April.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
    {
      userId: residentUser.id,
      title: "Water Supply Interruption",
      body: "Scheduled water interruption on 12 April from 8AM to 12PM in City Loft Blocks A, B, C.",
      type: "announcement" as const,
      isRead: false,
      relatedId: null,
    },
  ]);

  console.log("Seeding complete!");
  console.log("Demo accounts:");
  console.log("  Guest:    demo@starcity.com / password123");
  console.log("  Resident: resident@starcity.com / password123");
  console.log("Admin accounts:");
  console.log("  Admin:    admin@starcity.com / admin123");
  console.log("  Content:  content@starcity.com / content123");
  console.log("  Support:  support@starcity.com / support123");
}

seed().catch(console.error).finally(() => process.exit());
