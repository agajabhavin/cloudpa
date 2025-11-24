import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { LeadsService } from "./leads.service";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { CreateLeadDto } from "./dto/create-lead.dto";

@Controller("leads")
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leads: LeadsService) {}

  @Get()
  list(
    @CurrentUser() u: any,
    @Query("stage") stage?: string,
    @Query("search") search?: string,
  ) {
    return this.leads.list(u.orgId, stage, search);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateLeadDto))
  create(@CurrentUser() u: any, @Body() body: any) {
    return this.leads.create(u.orgId, body);
  }

  @Get(":id")
  get(@CurrentUser() u: any, @Param("id") id: string) {
    return this.leads.get(u.orgId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() u: any,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.leads.update(u.orgId, id, body);
  }

  @Post(":id/notes")
  addNote(
    @CurrentUser() u: any,
    @Param("id") id: string,
    @Body() body: { text: string },
  ) {
    return this.leads.addNote(u.orgId, id, body.text);
  }
}

