import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { OutputDatasetObsoleteDto } from "../../datasets/dto/output-dataset-obsolete.dto";

@Injectable()
export class ReturnWithPhysicalQuantitiesInterceptor<
  T extends OutputDatasetObsoleteDto,
> implements NestInterceptor
{
  propName: keyof T;

  constructor(propName: keyof T) {
    this.propName = propName;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return new Observable((subscriber) => {
      next.handle().subscribe({
        next: (data) => {
          if (
            data[this.propName] &&
            data[this.propName][`${String(this.propName)}SI`]
          ) {
            data = {
              ...data,
              [this.propName]: mergeSIFields(
                data[this.propName],
                data[this.propName][`${String(this.propName)}SI`],
              ),
            };
            delete data[this.propName][`${String(this.propName)}SI`];
          }
          subscriber.next(data);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });
  }
}

type AnyObject = { [key: string]: unknown };

function mergeSIFields(original: AnyObject, flattenedSI: AnyObject): AnyObject {
  // Deep clone original to avoid mutations
  const result = JSON.parse(JSON.stringify(original));
  for (const flatKey in flattenedSI) {
    const value = flattenedSI[flatKey];
    // Split the dot notation path into parts
    const keys = flatKey.split(".");
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // Ensure the path exists, create object if missing
      if (
        !(key in current) ||
        typeof current[key] !== "object" ||
        current[key] === null
      ) {
        current[key] = {};
      }
      current = current[key];
    }
    // Assign the SI value to the last key in the path
    current[keys[keys.length - 1]] = value;
  }
  return result;
}
