import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AutomationService } from "./automation.service";
import { TodayQueueService } from "./today-queue.service";

@Controller("automation")
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(
    private automation: AutomationService,
    private todayQueue: TodayQueueService
  ) {}

  @Get("today-queue")
  getTodayQueue(@CurrentUser() u: any) {
    return this.todayQueue.generateTodayQueue(u.orgId);
  }

  @Post("leads/:id/check-draft")
  checkDraft(@CurrentUser() u: any, @Param("id") id: string) {
    return this.automation.createFollowupDraftIfNeeded(id);
  }

  @Get("revive-leads")
  getReviveLeads(@CurrentUser() u: any) {
    return this.automation.getDeadLeadsForRevival(u.orgId);
  }

  @Post("revive-leads/:id/draft")
  createRevivalDraft(@CurrentUser() u: any, @Param("id") id: string) {
    return this.automation.createRevivalDraft(id);
  }
}
