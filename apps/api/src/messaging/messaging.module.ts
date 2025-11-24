import { Module } from "@nestjs/common";
import { MessagingController } from "./messaging.controller";
import { MessagingService } from "./messaging.service";
import { AutomationModule } from "../automation/automation.module";

@Module({
  imports: [AutomationModule],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
