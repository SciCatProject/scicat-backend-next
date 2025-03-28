import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { appendSIUnitToPhysicalQuantity } from "../utils";

@Injectable()
export class ExtractPhysicalQuantitiesInterceptor<T> implements NestInterceptor {
  propName: keyof T;

  constructor(propName: keyof T) {
    this.propName = propName;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const instance: unknown = (req.body as T)[this.propName];

    if (req.body[this.propName]) {
      const appendedObject = appendSIUnitToPhysicalQuantity(
        instance as object,
      );
      req.body[this.propName][`${String(this.propName)}SI`] = flatObjectForSIFields(appendedObject);
    }
    return next.handle();
  }
}

type AnyObject = { [key: string]: any };

function flatObjectForSIFields(
  obj: AnyObject,
  parentKey = '',
  result: AnyObject = {},
): AnyObject {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Recursively process nested objects
        flatObjectForSIFields(obj[key], newKey, result);
      } else if (Array.isArray(obj[key])) {
        // Handle arrays by flattening each element
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === 'object' && item !== null) {
            flatObjectForSIFields(item, `${newKey}[${index}]`, result);
          }
        });
      } else {
        // Only store values if key matches "valueSI" or "unitSI"
        if (key === "valueSI" || key === "unitSI") {
          result[newKey] = obj[key];
        }
      }
    }
  }
  return result;
}
