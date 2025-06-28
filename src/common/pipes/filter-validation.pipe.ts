import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { flattenObject } from "src/common/utils";

@Injectable()
export class FilterValidationPipe implements PipeTransform<string, string> {
  constructor(
    private allowedObjectKeys: string[],
    private allowedFilterKeys: Record<string, string[]>,
    private filters: Record<string, boolean> = {
      where: true,
      include: true,
      fields: true,
      limits: true,
    },
  ) {}
  transform(inValue: string): string {
    const allAllowedKeys: string[] = [...this.allowedObjectKeys];
    for (const key in this.filters) {
      if (this.filters[key]) {
        allAllowedKeys.push(...this.allowedFilterKeys[key]);
      }
    }
    const inValueParsed = JSON.parse(inValue ?? "{}");
    const flattenFilterKeys = Object.keys(flattenObject(inValueParsed));

    /*
     * intercept filter and make sure we only allow accepted values
     */
    flattenFilterKeys.forEach((key) => {
      const keyParts = key.split(".");
      const isInAllowedKeys = keyParts.every((part) =>
        allAllowedKeys.includes(part),
      );

      if (!isInAllowedKeys) {
        throw new BadRequestException(
          `Property ${key} should not exist in the filter object`,
        );
      }
    });

    return JSON.stringify(inValueParsed);
  }
}
