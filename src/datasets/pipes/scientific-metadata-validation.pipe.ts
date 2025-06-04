import { firstValueFrom } from "rxjs";
import { Validator } from "jsonschema";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { HttpService } from "@nestjs/axios";
import { PipeTransform, Inject, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { CreateDatasetDto } from "../dto/create-dataset.dto";
import {
  UpdateDatasetDto,
  PartialUpdateDatasetDto,
} from "../dto/update-dataset.dto";
import { DatasetsService } from "../datasets.service";

type ValidationDto =
  | CreateDatasetDto
  | UpdateDatasetDto
  | PartialUpdateDatasetDto;

type ValidatedDto = ValidationDto & { scientificMetadataValid?: boolean };

@Injectable()
export class ScientificMetadataValidationPipe
  implements PipeTransform<ValidationDto, Promise<ValidatedDto>>
{
  constructor(
    private readonly httpService: HttpService,
    private readonly datasetsService: DatasetsService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async transform(datasetDto: ValidationDto): Promise<ValidatedDto> {
    const updatedDto = { ...datasetDto };

    if (
      this.request.method === "PATCH" &&
      datasetDto instanceof PartialUpdateDatasetDto
    ) {
      const pid = this.request.params?.pid;
      let currentDataset = null;

      if (pid) {
        currentDataset = await this.datasetsService.findOne({ where: { pid } });
      }
      updatedDto.scientificMetadata =
        datasetDto.scientificMetadata ?? currentDataset?.scientificMetadata;
      updatedDto.scientificMetadataSchema =
        datasetDto.scientificMetadataSchema ??
        currentDataset?.scientificMetadataSchema;
    }

    if (updatedDto.scientificMetadata && updatedDto.scientificMetadataSchema) {
      try {
        const response = await firstValueFrom(
          this.httpService.get<Record<string, unknown>>(
            updatedDto.scientificMetadataSchema,
            { validateStatus: () => true },
          ),
        );
        // Check HTTP status
        if (response.status !== 200) {
          throw new BadRequestException(
            `Schema fetch failed with status ${response.status}: ${response.statusText}`,
          );
        }
        const schema = response.data;
        // Check if response is an object
        if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
          throw new BadRequestException(
            "Fetched schema is not a valid JSON object.",
          );
        }
        const validator = new Validator();
        const validationResult = validator.validate(
          updatedDto.scientificMetadata,
          schema,
        );
        // Append dataset dto with validation result
        return {
          ...updatedDto,
          scientificMetadataValid: validationResult.errors.length === 0,
        };
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error ? error.message : error,
        );
      }
    }
    return updatedDto instanceof PartialUpdateDatasetDto
      ? updatedDto
      : datasetDto;
  }
}
