import PDFDocument from "pdfkit";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PdfService {
  createQuotePdf(quote: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (d) => chunks.push(d));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(18).text("Quote", { align: "center" }).moveDown();
      doc.fontSize(12).text(`Quote ID: ${quote.id}`);
      doc.text(`Status: ${quote.status}`).moveDown();
      doc.text("Items:");

      quote.items.forEach((it: any) => {
        doc.text(
          `- ${it.name} x${it.qty} @ $${it.price} = $${it.qty * it.price}`,
        );
      });

      doc.moveDown();
      doc.fontSize(14).text(`Total: $${quote.total}`, { align: "right" });
      doc.end();
    });
  }
}

