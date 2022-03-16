import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import lodash from "lodash";
import { map, Observable } from "rxjs";
import { convertToRequestedUnit } from "src/common/utils";
import { IDatasetFields } from "../interfaces/dataset-filters.interface";
import { DerivedDataset } from "../schemas/derived-dataset.schema";
import { RawDataset } from "../schemas/raw-dataset.schema";

@Injectable()
export class FullQueryInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return next.handle().pipe(
      map((data: (RawDataset | DerivedDataset)[]) => {
        const req = context.switchToHttp().getRequest();
        const fields: IDatasetFields = JSON.parse(req.query.fields);
        if (fields.scientific) {
          const { scientific } = fields;
          data.forEach(({ scientificMetadata }) => {
            scientific.forEach(({ lhs, unit }) => {
              const currentUnit = lodash.get(
                scientificMetadata,
                `${lhs}.unit`,
              ) as string;
              const currentValue = lodash.get(
                scientificMetadata,
                `${lhs}.value`,
              ) as number;
              if (unit && currentUnit && currentUnit !== unit) {
                const { valueRequested, unitRequested } =
                  convertToRequestedUnit(currentValue, currentUnit, unit);
                lodash.update(
                  scientificMetadata,
                  `${lhs}.unit`,
                  () => unitRequested,
                );
                lodash.update(
                  scientificMetadata,
                  `${lhs}.value`,
                  () => valueRequested,
                );
              }
            });
          });
        }
        return data;
      }),
    );
  }
}
