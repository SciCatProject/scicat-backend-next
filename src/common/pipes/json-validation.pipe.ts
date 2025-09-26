import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class JsonValidationPipe implements PipeTransform<string> {
  transform(inValue: string): string | undefined {
    if (!inValue) {
      return;
    }
    try {
      JSON.parse(inValue);
    } catch (err) {
      const error = err as Error;
      throw new BadRequestException(`Invalid JSON in filter: ${error.message}`);
    }
    return inValue;
  }
}
