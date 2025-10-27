import { firstValueFrom } from "rxjs";
import { Validator } from "jsonschema";
import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { CreateDatasetDto } from "../dto/create-dataset.dto";
import {
  UpdateDatasetDto,
  PartialUpdateDatasetDto,
} from "../dto/update-dataset.dto";
import { CreateDerivedDatasetObsoleteDto } from "../dto/create-derived-dataset-obsolete.dto";
import { CreateRawDatasetObsoleteDto } from "../dto/create-raw-dataset-obsolete.dto";
import {
  PartialUpdateRawDatasetObsoleteDto,
  UpdateRawDatasetObsoleteDto,
} from "../dto/update-raw-dataset-obsolete.dto";
import {
  PartialUpdateDerivedDatasetObsoleteDto,
  UpdateDerivedDatasetObsoleteDto,
} from "../dto/update-derived-dataset-obsolete.dto";

type DatasetDto =
  | CreateDatasetDto
  | CreateDerivedDatasetObsoleteDto
  | CreateRawDatasetObsoleteDto
  | UpdateDatasetDto
  | UpdateDerivedDatasetObsoleteDto
  | UpdateRawDatasetObsoleteDto
  | PartialUpdateDatasetDto
  | PartialUpdateDerivedDatasetObsoleteDto
  | PartialUpdateRawDatasetObsoleteDto;

type ValidatedDto = DatasetDto & { scientificMetadataValid?: boolean };

@Injectable()
export class ScientificMetadataValidator {
  constructor(private readonly httpService: HttpService) {}

  patchedMetadata(
    datasetDto:
      | PartialUpdateDatasetDto
      | PartialUpdateDerivedDatasetObsoleteDto
      | PartialUpdateRawDatasetObsoleteDto,
    foundMetadata:
      | CreateDatasetDto
      | CreateDerivedDatasetObsoleteDto
      | CreateRawDatasetObsoleteDto,
  ):
    | CreateDatasetDto
    | CreateDerivedDatasetObsoleteDto
    | CreateRawDatasetObsoleteDto {
    const updatedDto = { ...datasetDto };
    // Use existing metadata if not provided in the update
    updatedDto.scientificMetadata =
      datasetDto.scientificMetadata ?? foundMetadata.scientificMetadata;
    updatedDto.scientificMetadataSchema =
      datasetDto.scientificMetadataSchema ??
      foundMetadata.scientificMetadataSchema;
    return updatedDto as
      | CreateDatasetDto
      | CreateDerivedDatasetObsoleteDto
      | CreateRawDatasetObsoleteDto;
  }
  async validate(
    scientificMetadata: Record<string, unknown>,
    scientificMetadataSchema: string,
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Record<string, unknown>>(
          scientificMetadataSchema,
          { validateStatus: () => true },
        ),
      );

      // Check HTTP status
      if (response.status !== 200) {
        Logger.log(
          `Schema fetch failed with status ${response.status}: ${response.statusText}`,
          "ScientificMetadataValidation",
        );
        return false;
      }

      const schema = response.data;

      // Check if response is a valid object
      if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
        Logger.log(
          "Fetched schema is not a valid JSON object.",
          "ScientificMetadataValidation",
        );
        return false;
      }

      const validator = new Validator();
      const validationResult = validator.validate(scientificMetadata, schema);

      return validationResult.errors.length === 0;
    } catch (error) {
      Logger.log(
        error instanceof Error ? error.message : String(error),
        "ScientificMetadataValidation",
      );
      return false;
    }
  }

  async addValidationStatus(datasetDto: DatasetDto): Promise<ValidatedDto> {
    const updatedDto = { ...datasetDto };
    if (datasetDto.scientificMetadata && datasetDto.scientificMetadataSchema) {
      return {
        ...updatedDto,
        scientificMetadataValid: await this.validate(
          datasetDto.scientificMetadata,
          datasetDto.scientificMetadataSchema,
        ),
      };
    }
    return updatedDto;
  }
}
