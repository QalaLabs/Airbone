import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Airborne Aviation Academy...\n");

  // ─── Organization ──────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "airborne-aviation" },
    update: {},
    create: {
      name: "Airborne Aviation Academy",
      slug: "airborne-aviation",
      domain: "airborne.academy",
      plan: "PROFESSIONAL",
      settings: {
        leadAutoAssign: false,
        defaultFollowUpDays: 2,
        workingHours: { start: "09:00", end: "18:00" },
      },
      featureFlags: {
        whatsappNotifications: true,
        emailNotifications: true,
        leadScoring: true,
        workflowAutomation: false,
      },
    },
  });
  console.log(`✅ Organization: ${org.name} (${org.id})`);

  // ─── Campuses ──────────────────────────────────────────────────────────────
  const campusDelhiData = {
    orgId: org.id,
    name: "Delhi Campus",
    code: "DEL",
    city: "New Delhi",
    state: "Delhi",
    country: "IN",
    address: "Plot 14, Aerocity, New Delhi 110037",
    phone: "+911140000001",
    email: "delhi@airborne.academy",
    timezone: "Asia/Kolkata",
    isActive: true,
  };

  const campusMumbaiData = {
    orgId: org.id,
    name: "Mumbai Campus",
    code: "MUM",
    city: "Mumbai",
    state: "Maharashtra",
    country: "IN",
    address: "BKC, Bandra Kurla Complex, Mumbai 400051",
    phone: "+912240000002",
    email: "mumbai@airborne.academy",
    timezone: "Asia/Kolkata",
    isActive: true,
  };

  const campusBangaloreData = {
    orgId: org.id,
    name: "Bangalore Campus",
    code: "BLR",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN",
    address: "HAL Old Airport Road, Bangalore 560017",
    phone: "+918040000003",
    email: "bangalore@airborne.academy",
    timezone: "Asia/Kolkata",
    isActive: true,
  };

  const campusDelhi = await prisma.campus.upsert({
    where: { orgId_code: { orgId: org.id, code: "DEL" } },
    update: {},
    create: campusDelhiData,
  });

  const campusMumbai = await prisma.campus.upsert({
    where: { orgId_code: { orgId: org.id, code: "MUM" } },
    update: {},
    create: campusMumbaiData,
  });

  const campusBangalore = await prisma.campus.upsert({
    where: { orgId_code: { orgId: org.id, code: "BLR" } },
    update: {},
    create: campusBangaloreData,
  });

  console.log(`✅ Campuses: ${campusDelhi.name}, ${campusMumbai.name}, ${campusBangalore.name}`);

  // ─── Users — one per role ──────────────────────────────────────────────────
  const defaultPassword = await hash("Airborne@123");

  const usersData = [
    {
      email: "superadmin@airborne.academy",
      name: "Super Admin",
      role: "SUPER_ADMIN" as const,
      campusId: null,
    },
    {
      email: "admin@airborne.academy",
      name: "Org Admin",
      role: "ADMIN" as const,
      campusId: campusDelhi.id,
    },
    {
      email: "marketing@airborne.academy",
      name: "Priya Sharma",
      role: "MARKETING_MANAGER" as const,
      campusId: campusDelhi.id,
    },
    {
      email: "content@airborne.academy",
      name: "Rahul Gupta",
      role: "CONTENT_MANAGER" as const,
      campusId: campusDelhi.id,
    },
    {
      email: "counselor@airborne.academy",
      name: "Anjali Verma",
      role: "ADMISSIONS_COUNSELOR" as const,
      campusId: campusDelhi.id,
    },
    {
      email: "placement@airborne.academy",
      name: "Vikram Singh",
      role: "PLACEMENT_MANAGER" as const,
      campusId: campusMumbai.id,
    },
    {
      email: "support@airborne.academy",
      name: "Meena Patel",
      role: "SUPPORT_STAFF" as const,
      campusId: campusBangalore.id,
    },
  ];

  const createdUsers: Awaited<ReturnType<typeof prisma.user.upsert>>[] = [];

  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email_orgId: { email: userData.email, orgId: org.id } },
      update: {},
      create: {
        orgId: org.id,
        email: userData.email,
        name: userData.name,
        passwordHash: defaultPassword,
        role: userData.role,
        campusId: userData.campusId,
        isActive: true,
        emailVerified: new Date(),
      },
    });
    createdUsers.push(user);
    console.log(`  👤 ${user.role}: ${user.name} (${user.email})`);
  }

  console.log(`✅ Users: ${createdUsers.length} created`);

  // Assign head counselors to campuses
  const adminUser = createdUsers.find((u) => u.role === "ADMIN");
  const counselorUser = createdUsers.find((u) => u.role === "ADMISSIONS_COUNSELOR");

  if (adminUser) {
    await prisma.campus.update({
      where: { id: campusDelhi.id },
      data: { headCounselorId: counselorUser?.id ?? adminUser.id },
    });
  }

  // ─── Sample Leads ──────────────────────────────────────────────────────────
  const counselor = createdUsers.find((u) => u.role === "ADMISSIONS_COUNSELOR");

  const leadsData = [
    {
      name: "Arjun Kapoor",
      email: "arjun.k@gmail.com",
      phone: "+919812345001",
      city: "Delhi",
      state: "Delhi",
      courseInterest: "CPL (Commercial Pilot License)",
      source: "GOOGLE_ADS" as const,
      status: "NEW" as const,
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "cpl-course-2024",
    },
    {
      name: "Sneha Reddy",
      email: "sneha.r@yahoo.com",
      phone: "+919823456002",
      city: "Hyderabad",
      state: "Telangana",
      courseInterest: "CPL (Commercial Pilot License)",
      source: "FACEBOOK_ADS" as const,
      status: "CONTACTED" as const,
      utmSource: "facebook",
      utmMedium: "social",
      utmCampaign: "aviation-leads-q1",
    },
    {
      name: "Karan Mehta",
      email: "karan.m@hotmail.com",
      phone: "+919834567003",
      city: "Mumbai",
      state: "Maharashtra",
      courseInterest: "CPL (Commercial Pilot License)",
      source: "ORGANIC" as const,
      status: "INTERESTED" as const,
    },
    {
      name: "Pooja Nair",
      email: "pooja.n@gmail.com",
      phone: "+919845678004",
      city: "Bangalore",
      state: "Karnataka",
      courseInterest: "ATPL (Airline Transport Pilot License)",
      source: "REFERRAL" as const,
      status: "COUNSELED" as const,
      score: 75,
    },
    {
      name: "Rohit Sharma",
      email: "rohit.s@gmail.com",
      phone: "+919856789005",
      city: "Chandigarh",
      state: "Punjab",
      courseInterest: "CPL (Commercial Pilot License)",
      source: "WHATSAPP" as const,
      status: "FOLLOW_UP" as const,
    },
  ];

  for (const leadData of leadsData) {
    await prisma.lead.upsert({
      where: { orgId_phone: { orgId: org.id, phone: leadData.phone } },
      update: {},
      create: {
        orgId: org.id,
        createdBy: counselor?.id ?? createdUsers[0]!.id,
        assignedTo: counselor?.id,
        campusId: campusDelhi.id,
        ...leadData,
        score: leadData.score ?? 0,
        tags: ["2024-intake"],
        customFields: {},
        lastActivityAt: new Date(),
      },
    });
  }

  console.log(`✅ Leads: ${leadsData.length} sample leads created`);

  // ─── Notification Templates ─────────────────────────────────────────────────
  const templates = [
    {
      orgId: org.id,
      name: "New Lead WhatsApp Welcome",
      event: "NEW_LEAD" as const,
      channel: "WHATSAPP" as const,
      subject: null,
      body: "Hi {{leadName}}, thank you for your interest in Airborne Aviation Academy! Our counselor will contact you shortly.",
      variables: ["leadName"],
      isActive: true,
    },
    {
      orgId: org.id,
      name: "Lead Assigned Counselor Email",
      event: "LEAD_ASSIGNED" as const,
      channel: "EMAIL" as const,
      subject: "New Lead Assigned: {{leadName}}",
      body: "Dear {{counselorName}},\n\nA new lead has been assigned to you:\n\nName: {{leadName}}\nPhone: {{leadPhone}}\nCourse Interest: {{courseInterest}}\n\nPlease follow up within 24 hours.\n\nAirborne Aviation Academy",
      variables: ["counselorName", "leadName", "leadPhone", "courseInterest"],
      isActive: true,
    },
    {
      orgId: org.id,
      name: "Lead Status Changed Email",
      event: "LEAD_STATUS_CHANGED" as const,
      channel: "EMAIL" as const,
      subject: "Lead Status Updated: {{leadName}}",
      body: "The lead {{leadName}} has been updated from {{oldStatus}} to {{newStatus}}.",
      variables: ["leadName", "oldStatus", "newStatus"],
      isActive: true,
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { orgId_event_channel: { orgId: org.id, event: template.event, channel: template.channel } },
      update: {},
      create: template,
    });
  }

  console.log(`✅ Notification templates: ${templates.length} created`);

  // ─── Feature Flags ──────────────────────────────────────────────────────────
  const flags = [
    { key: "lead_scoring_v2", value: { version: 2 }, description: "Next-gen lead scoring algorithm", isEnabled: false },
    { key: "whatsapp_bot", value: { provider: "wati" }, description: "Automated WhatsApp bot responses", isEnabled: false },
    { key: "ai_counselor_assist", value: { model: "gpt-4o" }, description: "AI-powered counselor suggestions", isEnabled: false },
    { key: "advanced_analytics", value: { provider: "internal" }, description: "Advanced analytics dashboard", isEnabled: true },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { orgId_key: { orgId: org.id, key: flag.key } },
      update: {},
      create: { orgId: org.id, ...flag },
    });
  }

  console.log(`✅ Feature flags: ${flags.length} created`);

  console.log("\n🎉 Seed completed successfully!\n");
  console.log("─".repeat(50));
  console.log("🔑 Default password for all users: Airborne@123");
  console.log("🌐 Org slug: airborne-aviation");
  console.log("─".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
