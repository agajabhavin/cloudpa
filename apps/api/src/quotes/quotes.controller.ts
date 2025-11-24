import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { QuotesService } from "./quotes.service";
import { PdfService } from "./pdf.service";
import { Response } from "express";

@Controller()
export class QuotesController {
  constructor(private q: QuotesService, private pdf: PdfService) {}

  @UseGuards(JwtAuthGuard)
  @Post("leads/:id/quotes")
  create(
    @CurrentUser() u: any,
    @Param("id") leadId: string,
    @Body() body: { items: any[] },
  ) {
    return this.q.create(u.orgId, leadId, body.items);
  }

  @UseGuards(JwtAuthGuard)
  @Get("quotes/:id")
  get(@CurrentUser() u: any, @Param("id") id: string) {
    return this.q.get(u.orgId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("quotes/:id/pdf")
  async pdfGet(
    @CurrentUser() u: any,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const quote = await this.q.get(u.orgId, id);
    if (!quote) {
      return res.status(404).send("Quote not found");
    }
    const buffer = await this.pdf.createQuotePdf(quote);
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("quotes/:id")
  update(
    @CurrentUser() u: any,
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    return this.q.update(u.orgId, id, body.status);
  }

  @Get("public/quotes/:publicId")
  async public(@Param("publicId") publicId: string) {
    const quote = await this.q.publicGet(publicId);
    if (quote) {
      // Track view
      await this.q.trackView(quote.id);
    }
    return quote;
  }
}

