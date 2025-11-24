/**
 * Setup script to create ChatAccount for Twilio WhatsApp
 * Run with: npx ts-node src/scripts/setup-twilio.ts [orgId]
 * If orgId not provided, will list orgs and prompt for selection
 */

import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setupTwilio(orgId?: string) {
  console.log("\n🚀 Twilio WhatsApp ChatAccount Setup\n");

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!accountSid || !authToken) {
    console.error("❌ Error: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env");
    console.error("   Please add your Twilio credentials to apps/api/.env");
    process.exit(1);
  }

  console.log("✅ Twilio credentials found in .env");
  console.log(`   Account SID: ${accountSid.substring(0, 10)}...`);
  console.log(`   WhatsApp From: ${whatsappFrom}\n`);

  let selectedOrg;

  if (orgId) {
    // Use provided orgId
    selectedOrg = await prisma.org.findUnique({ 
      where: { id: orgId },
      include: {
        users: {
          include: { user: true },
        },
      },
    });
    
    if (!selectedOrg) {
      console.error(`❌ Error: Organization with id "${orgId}" not found`);
      process.exit(1);
    }
    console.log(`✅ Using organization: ${selectedOrg.name}`);
  } else {
    // List orgs and prompt
    const orgs = await prisma.org.findMany({
      include: {
        users: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (orgs.length === 0) {
      console.error("❌ No organizations found. Please create an organization first.");
      process.exit(1);
    }

    console.log("📋 Available Organizations:\n");
    orgs.forEach((org, index) => {
      const owner = org.users.find((ou) => ou.role === "OWNER")?.user;
      console.log(`  ${index + 1}. ${org.name} (ID: ${org.id})`);
      if (owner) {
        console.log(`     Owner: ${owner.email}`);
      }
    });

    if (orgs.length === 1) {
      selectedOrg = orgs[0];
      console.log(`\n✅ Using only organization: ${selectedOrg.name}`);
    } else {
      const answer = await question(`\nSelect organization (1-${orgs.length}) or press Enter for first: `);
      const index = answer.trim() ? parseInt(answer) - 1 : 0;
      if (index >= 0 && index < orgs.length) {
        selectedOrg = orgs[index];
      } else {
        selectedOrg = orgs[0];
      }
    }
  }

  // Check if ChatAccount already exists
  const existing = await prisma.chatAccount.findFirst({
    where: {
      orgId: selectedOrg.id,
      provider: "twilio_whatsapp",
      externalPhoneId: whatsappFrom,
    },
  });

  if (existing) {
    console.log(`\n✅ ChatAccount already exists for ${selectedOrg.name}`);
    console.log(`   ID: ${existing.id}`);
    console.log(`   Provider: ${existing.provider}`);
    console.log(`   Phone: ${existing.externalPhoneId}`);
    console.log(`   Active: ${existing.isActive}`);
    
    const update = await question("\nUpdate existing ChatAccount? (y/N): ");
    if (update.toLowerCase() === "y") {
      const updated = await prisma.chatAccount.update({
        where: { id: existing.id },
        data: {
          accountSid,
          authToken,
          isActive: true,
        },
      });
      console.log("\n✅ ChatAccount updated successfully!");
    }
    await prisma.$disconnect();
    rl.close();
    return;
  }

  // Create ChatAccount
  console.log(`\n📝 Creating ChatAccount for: ${selectedOrg.name}...`);
  
  const chatAccount = await prisma.chatAccount.create({
    data: {
      orgId: selectedOrg.id,
      provider: "twilio_whatsapp",
      externalPhoneId: whatsappFrom,
      accountSid,
      authToken,
      isActive: true,
    },
  });

  console.log("\n✅ ChatAccount created successfully!");
  console.log(`   ID: ${chatAccount.id}`);
  console.log(`   Org: ${selectedOrg.name} (${chatAccount.orgId})`);
  console.log(`   Provider: ${chatAccount.provider}`);
  console.log(`   Phone: ${chatAccount.externalPhoneId}`);
  console.log(`   Active: ${chatAccount.isActive}`);
  console.log(`\n🎉 Setup complete! Your org is ready to receive WhatsApp messages.`);

  await prisma.$disconnect();
  rl.close();
}

// Get orgId from command line args (optional)
const orgId = process.argv[2];

setupTwilio(orgId).catch((error) => {
  console.error("\n❌ Error:", error);
  rl.close();
  process.exit(1);
});

