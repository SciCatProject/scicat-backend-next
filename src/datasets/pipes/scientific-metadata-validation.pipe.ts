import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { PipeTransform, Inject, Injectable } from "@nestjs/common";
import { CreateDatasetDto } from "../dto/create-dataset.dto";
import {
  UpdateDatasetDto,
  PartialUpdateDatasetDto,
} from "../dto/update-dataset.dto";
import { DatasetsService } from "../datasets.service";
import { ScientificMetadataValidator } from "../utils/scientificMetadata";

type DatasetDto = CreateDatasetDto | UpdateDatasetDto | PartialUpdateDatasetDto;

type ValidatedDto = DatasetDto & { scientificMetadataValid?: boolean };

@Injectable()
export class ScientificMetadataValidationPipe
  implements PipeTransform<DatasetDto, Promise<ValidatedDto>>
{
  constructor(
    private readonly scientificMetadataValidator: ScientificMetadataValidator,
    private readonly datasetsService: DatasetsService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async transform(datasetDto: DatasetDto): Promise<ValidatedDto> {
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
    // Validate and add validation status
    if (updatedDto.scientificMetadata && updatedDto.scientificMetadataSchema) {
      const result =
        await this.scientificMetadataValidator.addValidationStatus(updatedDto);
      return result;
    }

    // Return original DTO for PATCH requests without metadata, or DTO with validation status = false for other cases
    return updatedDto instanceof PartialUpdateDatasetDto
      ? updatedDto
      : datasetDto;
  }
}
