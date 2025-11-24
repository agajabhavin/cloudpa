import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const r = this.schema.safeParse(value);
    if (!r.success) {
      throw new BadRequestException(r.error.flatten());
    }
    return r.data;
  }
}

