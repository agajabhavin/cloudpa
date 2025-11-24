import { PrismaClient } from "@prisma/client";
// Note: nodemailer import removed - using console transporter for MVP

const prisma = new PrismaClient();

// Email transporter (configure via env vars or use console for MVP)
const getEmailTransporter = () => {
  // For MVP, log to console. In production, configure SMTP:
  // return nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: parseInt(process.env.SMTP_PORT || "587"),
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS,
  //   },
  // });
  
  // Console transporter for MVP
  return {
    sendMail: async (options: any) => {
      console.log("📧 EMAIL NOTIFICATION:");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("Body:", options.text);
      console.log("---");
      return { messageId: "console-" + Date.now() };
    },
  };
};

async function sendNotification(followup: any, userEmail: string) {
  const transporter = getEmailTransporter();
  
  const subject = `⏰ Overdue Follow-up: ${followup.lead.title}`;
  const text = `
You have an overdue follow-up!

Lead: ${followup.lead.title}
Due Date: ${new Date(followup.dueAt).toLocaleString()}
Organization: ${followup.lead.org.name}

Please follow up with this lead as soon as possible.

View lead: ${process.env.APP_URL || "http://localhost:3000"}/leads/${followup.leadId}
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@cloudpa.io",
      to: userEmail,
      subject,
      text,
    });
    console.log(`✅ Notification sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send notification to ${userEmail}:`, error);
  }
}

async function main() {
  const overdue = await prisma.followup.findMany({
    where: { dueAt: { lt: new Date() }, doneAt: null },
    include: { 
      lead: { 
        include: { 
          org: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(`Found ${overdue.length} overdue follow-ups`);

  for (const f of overdue) {
    // Get org owner email
    const owner = f.lead.org.users.find((ou: any) => ou.role === "OWNER");
    if (owner?.user?.email) {
      await sendNotification(f, owner.user.email);
    } else {
      console.log(`⚠️  No owner email found for org ${f.lead.org.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

