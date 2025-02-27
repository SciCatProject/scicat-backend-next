import { firstValueFrom } from "rxjs";
import { Validator } from "jsonschema";
import { HttpService } from "@nestjs/axios";
import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { CreateDatasetDto } from "../dto/create-dataset.dto";
import { CreateRawDatasetObsoleteDto } from "../dto/create-raw-dataset-obsolete.dto";
import { CreateDerivedDatasetObsoleteDto } from "../dto/create-derived-dataset-obsolete.dto";

interface MetadataSchema {
  $defs: {
    [key: string]: any; // Allow arbitrary keys
    QuantityValue: { [key: string]: any }; // Define QuantityValue as an object with key-value pairs
  };
}

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
    if (dataset.scientificMetadata) {
      const { schemaUrl, metadata, ...rest } = dataset.scientificMetadata;

      if (typeof schemaUrl === "string" && typeof metadata === "object") {
        if (Object.keys(rest).length > 0) {
          throw new BadRequestException(
            "To proceed with validation, scientificMetadata should only contain the fields 'schemaUrl' and 'metadata'.",
          );
        }

        try {
          const response = await firstValueFrom(
            this.httpService.get<MetadataSchema>(
              dataset.scientificMetadata.schemaUrl as string,
            ),
          );

          const schema = response.data;
          // Expand QuantityValue properties to include unitSI and valueSI
          schema.$defs.QuantityValue.properties.unitSI = { type: "string" };
          schema.$defs.QuantityValue.properties.valueSI = { type: "number" };

          const validator = new Validator();
          const validationResult = validator.validate(
            dataset.scientificMetadata.metadata,
            schema as object,
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
    }
    return dataset;
  }
}
