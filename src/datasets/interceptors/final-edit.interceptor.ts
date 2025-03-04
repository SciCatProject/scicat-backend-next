import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DatasetClass } from "../schemas/dataset.schema";

@Injectable()
export class FinalEditInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((data: DatasetClass[]) => {
        const removeFields = (obj: any) => {
          if (obj && typeof obj === "object") {
            for (const key in obj) {
              if (key === "unitSI" || key === "valueSI") {
                delete obj[key];
              } else {
                removeFields(obj[key]);
              }
            }
          }
        };

        data.forEach((dataset) => {
          if (dataset.scientificMetadata) {
            removeFields(dataset.scientificMetadata);
          }
        });
        return data;
      }),
    );
  }
}
