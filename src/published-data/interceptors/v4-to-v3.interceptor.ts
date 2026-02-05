import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { createDeepGetterAll } from "src/common/utils/deep-mapper.util";
import {
  PublishedDataObsoleteDto,
  publishedDataV3toV4FieldMap,
} from "../dto/published-data.obsolete.dto";
import { PublishedDataStatus } from "../interfaces/published-data.interface";
import { PublishedData } from "../schemas/published-data.schema";
import { plainToInstance } from "class-transformer";
import { Document } from "mongoose";

export const v4ToV3Response = createDeepGetterAll<
  PublishedData,
  PublishedDataObsoleteDto
>({
  ...publishedDataV3toV4FieldMap,
  status: (src) => {
    delete src.metadata;
    return [
      PublishedDataStatus.REGISTERED,
      PublishedDataStatus.AMENDED,
    ].includes((src as Required<PublishedData>).status)
      ? "registered"
      : "pending_registration";
  },
});

@Injectable()
export class V4ToV3ResponseInterceptor<S, T> implements NestInterceptor<S, T> {
  constructor(private readonly mapper: (source: S) => T) {}

  private transform(item: Document | T): T {
    if (!item) return item;

    const lean = item instanceof Document ? item.toObject() : item;

    return this.mapper(lean);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((data) => {
        if (!data || typeof data !== "object") return data;
        if (Array.isArray(data))
          return plainToInstance(
            PublishedDataObsoleteDto,
            data.map((item) => this.transform(item)) as unknown as T,
            { excludeExtraneousValues: true },
          );
        return plainToInstance(PublishedDataObsoleteDto, this.transform(data), {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

export const V4_TO_V3_RESPONSE = new V4ToV3ResponseInterceptor(v4ToV3Response);
