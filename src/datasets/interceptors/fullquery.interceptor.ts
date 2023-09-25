import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { get, update } from "lodash";
import { map, Observable } from "rxjs";
import { convertToRequestedUnit } from "src/common/utils";
import { IDatasetFields } from "../interfaces/dataset-filters.interface";
import { DatasetClass } from "../schemas/dataset.schema";

@Injectable()
export class FullQueryInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return next.handle().pipe(
      map((data: DatasetClass[]) => {
        const req = context.switchToHttp().getRequest();
        const fields: IDatasetFields = req.query.fields
          ? JSON.parse(req.query.fields)
          : {};
        if (fields.scientific) {
          const { scientific } = fields;
          data.forEach(({ scientificMetadata }) => {
            scientific.forEach(({ lhs, unit }) => {
              const currentUnit = get(
                scientificMetadata,
                `${lhs}.unit`,
              ) as string;
              const currentValue = get(
                scientificMetadata,
                `${lhs}.value`,
              ) as number;
              if (
                unit &&
                currentUnit &&
                currentUnit !== unit &&
                scientificMetadata
              ) {
                const { valueRequested, unitRequested } =
                  convertToRequestedUnit(currentValue, currentUnit, unit);
                update(scientificMetadata, `${lhs}.unit`, () => unitRequested);
                update(
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
