import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private a: AnalyticsService) {}

  @Get("dashboard")
  dashboard(@CurrentUser() u: any) {
    return this.a.dashboard(u.orgId);
  }
}

