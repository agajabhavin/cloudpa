import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { OrgModule } from "./org/org.module";
import { MessagingModule } from "./messaging/messaging.module";
import { ContactsModule } from "./contacts/contacts.module";
import { LeadsModule } from "./leads/leads.module";
import { FollowupsModule } from "./followups/followups.module";
import { QuotesModule } from "./quotes/quotes.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AutomationModule } from "./automation/automation.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrgModule,
    MessagingModule,
    ContactsModule,
    LeadsModule,
    FollowupsModule,
    QuotesModule,
    AnalyticsModule,
    AutomationModule,
  ],
})
export class AppModule {}

