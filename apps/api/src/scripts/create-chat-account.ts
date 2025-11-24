/**
 * Helper script to create ChatAccount for Twilio WhatsApp
 * This script will prompt for orgId or find the first org
 * Run with: npx ts-node src/scripts/create-chat-account.ts
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

async function createChatAccount() {
  console.log("\n🚀 Twilio WhatsApp ChatAccount Setup\n");

  // Check env vars
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

  // List all orgs
  const orgs = await prisma.org.findMany({
    include: {
      users: {
        include: {
          user: true,
        },
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

  let selectedOrg;
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
      console.log(`   Account SID: ${updated.accountSid ? "Set" : "Using env"}`);
      console.log(`   Auth Token: ${updated.authToken ? "Set" : "Using env"}`);
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
      accountSid, // Store in DB (optional - can use env vars)
      authToken,   // Store in DB (optional - can use env vars)
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

createChatAccount().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});

