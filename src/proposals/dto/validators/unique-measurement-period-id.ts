import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { MeasurementPeriodClass } from "src/proposals/schemas/measurement-period.schema";

@ValidatorConstraint({ async: false })
export class UniqueMeasurementPeriodIdConstraint
  implements ValidatorConstraintInterface
{
  validate(
    measurementPeriods: MeasurementPeriodClass[],
    args: ValidationArguments,
  ) {
    const ids = measurementPeriods.map((period) => period.id);
    return ids.length === new Set(ids).size;
  }

  defaultMessage(args: ValidationArguments) {
    return "MeasurementPeriod id must be unique within the MeasurementPeriodList";
  }
}
