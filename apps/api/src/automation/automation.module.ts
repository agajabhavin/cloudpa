import { Module } from "@nestjs/common";
import { AutomationService } from "./automation.service";
import { TodayQueueService } from "./today-queue.service";
import { AutomationController } from "./automation.controller";

@Module({
  controllers: [AutomationController],
  providers: [AutomationService, TodayQueueService],
  exports: [AutomationService, TodayQueueService],
})
export class AutomationModule {}

