import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { FollowupsService } from "./followups.service";

@Controller()
export class FollowupsController {
  constructor(private f: FollowupsService) {}

  @UseGuards(JwtAuthGuard)
  @Post("leads/:id/followup")
  create(@Param("id") leadId: string, @Body() body: { dueAt: string }) {
    return this.f.create(leadId, new Date(body.dueAt));
  }

  @UseGuards(JwtAuthGuard)
  @Get("followups/overdue")
  overdue(@CurrentUser() u: any) {
    return this.f.overdue(u.orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("followups/:id")
  del(@Param("id") id: string) {
    return this.f.markDone(id);
  }
}

