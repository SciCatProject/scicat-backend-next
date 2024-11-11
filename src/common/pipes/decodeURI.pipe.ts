import { PipeTransform, Injectable } from "@nestjs/common";

@Injectable()
export class DecodeURIPipe implements PipeTransform<string, string> {
  transform(value: string) {
    return decodeURIComponent(value);
  }
}
