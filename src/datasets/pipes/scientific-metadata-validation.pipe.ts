import { firstValueFrom } from "rxjs";
import { Validator } from "jsonschema";
import { HttpService } from "@nestjs/axios";
import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { CreateDatasetDto } from "../dto/create-dataset.dto";
import { CreateRawDatasetObsoleteDto } from "../dto/create-raw-dataset-obsolete.dto";
import { CreateDerivedDatasetObsoleteDto } from "../dto/create-derived-dataset-obsolete.dto";

@Injectable()
export class ScientificMetadataValidationPipe
  implements
    PipeTransform<
      | CreateRawDatasetObsoleteDto
      | CreateDerivedDatasetObsoleteDto
      | CreateDatasetDto,
      Promise<
        | CreateRawDatasetObsoleteDto
        | CreateDerivedDatasetObsoleteDto
        | CreateDatasetDto
      >
    >
{
  constructor(private readonly httpService: HttpService) {}

  async transform(
    dataset:
      | CreateRawDatasetObsoleteDto
      | CreateDerivedDatasetObsoleteDto
      | CreateDatasetDto,
  ): Promise<
    | CreateRawDatasetObsoleteDto
    | CreateDerivedDatasetObsoleteDto
    | CreateDatasetDto
  > {
    if (dataset.scientificMetadata && dataset.scientificMetadataSchema) {
      try {
        const response = await firstValueFrom(
          this.httpService.get<Record<string, unknown>>(
            dataset.scientificMetadataSchema,
          ),
        );

        const schema = response.data;
        const validator = new Validator();
        const validationResult = validator.validate(
          dataset.scientificMetadata,
          schema,
        );

        if (validationResult.errors.length > 0) {
          throw new BadRequestException(
            "The scientific metadata do not conform to the given schema.",
          );
        }
      } catch (error) {
        throw new BadRequestException(error);
      }
    }
    return dataset;
  }
}
