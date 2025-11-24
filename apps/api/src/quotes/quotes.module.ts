import { Module } from "@nestjs/common";
import { QuotesController } from "./quotes.controller";
import { QuotesService } from "./quotes.service";
import { PdfService } from "./pdf.service";

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, PdfService],
})
export class QuotesModule {}

