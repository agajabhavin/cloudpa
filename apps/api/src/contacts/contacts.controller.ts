import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { ContactsService } from "./contacts.service";

@Controller("contacts")
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private contacts: ContactsService) {}

  @Get()
  list(@CurrentUser() u: any) {
    return this.contacts.list(u.orgId);
  }

  @Post()
  create(
    @CurrentUser() u: any,
    @Body() body: { name?: string; handle: string },
  ) {
    return this.contacts.create(u.orgId, body);
  }

  @Get(":id")
  get(@CurrentUser() u: any, @Param("id") id: string) {
    return this.contacts.get(u.orgId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() u: any,
    @Param("id") id: string,
    @Body() body: { name?: string; handle?: string },
  ) {
    return this.contacts.update(u.orgId, id, body);
  }
}

