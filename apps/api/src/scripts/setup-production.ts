/**
 * Production Setup Script
 * Creates ChatAccount and verifies production configuration
 * 
 * Usage: npx ts-node src/scripts/setup-production.ts
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

async function setupProduction() {
  console.log("\n🚀 CloudPA Production Setup");
  console.log("=".repeat(60));

  // Verify production URL
  const publicUrl = process.env.PUBLIC_BASE_URL || "https://app.cloudpa.io";
  console.log(`\n🌐 Production URL: ${publicUrl}`);

  if (!publicUrl.includes("app.cloudpa.io")) {
    const confirm = await question(`\n⚠️  URL is not app.cloudpa.io. Continue? (y/N): `);
    if (confirm.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      rl.close();
      await prisma.$disconnect();
      return;
    }
  }

  // List orgs
  const orgs = await prisma.org.findMany({
    include: {
      users: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orgs.length === 0) {
    console.error("\n❌ No organizations found. Please create an organization first.");
    rl.close();
    await prisma.$disconnect();
    return;
  }

  console.log("\n📋 Available Organizations:\n");
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
    console.log(`\n✅ Using organization: ${selectedOrg.name}`);
  } else {
    const answer = await question(`\nSelect organization (1-${orgs.length}) or press Enter for first: `);
    const index = answer.trim() ? parseInt(answer) - 1 : 0;
    selectedOrg = orgs[index >= 0 && index < orgs.length ? index : 0];
  }

  // Check existing ChatAccount
  const existing = await prisma.chatAccount.findFirst({
    where: {
      orgId: selectedOrg.id,
      provider: "twilio_whatsapp",
      externalPhoneId: "whatsapp:+14155238886",
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
      await prisma.chatAccount.update({
        where: { id: existing.id },
        data: {
          isActive: true,
        },
      });
      console.log("\n✅ ChatAccount updated!");
    }
  } else {
    // Create ChatAccount
    console.log(`\n📝 Creating ChatAccount for: ${selectedOrg.name}...`);

    const chatAccount = await prisma.chatAccount.create({
      data: {
        orgId: selectedOrg.id,
        provider: "twilio_whatsapp",
        externalPhoneId: "whatsapp:+14155238886",
        isActive: true,
      },
    });

    console.log("\n✅ ChatAccount created successfully!");
    console.log(`   ID: ${chatAccount.id}`);
    console.log(`   Org: ${selectedOrg.name}`);
    console.log(`   Provider: ${chatAccount.provider}`);
    console.log(`   Phone: ${chatAccount.externalPhoneId}`);
  }

  // Display webhook URL
  console.log("\n" + "=".repeat(60));
  console.log("📋 Twilio Webhook Configuration");
  console.log("=".repeat(60));
  console.log(`\nSet Twilio webhook URL to:`);
  console.log(`  ${publicUrl}/api/v1/messaging/webhook/whatsapp`);
  console.log(`\nMethod: POST`);

  console.log("\n✅ Production setup complete!");
  console.log(`\n🌐 Production URL: ${publicUrl}`);

  rl.close();
  await prisma.$disconnect();
}

setupProduction().catch((error) => {
  console.error("\n❌ Error:", error);
  rl.close();
  process.exit(1);
});

