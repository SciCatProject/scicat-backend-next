import { firstValueFrom } from "rxjs";
import { Validator } from "jsonschema";
import { HttpService } from "@nestjs/axios";
import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { CreateDatasetDto } from "../dto/create-dataset.dto";

interface ValidatedDto extends CreateDatasetDto {
  scientificMetadataValid?: boolean;
}

@Injectable()
export class ScientificMetadataValidationPipe
  implements PipeTransform<CreateDatasetDto, Promise<ValidatedDto>>
{
  constructor(private readonly httpService: HttpService) {}

  async transform(dataset: CreateDatasetDto): Promise<ValidatedDto> {
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

        return {
          ...dataset,
          scientificMetadataValid: validationResult.errors.length === 0,
        };
      } catch (error) {
        throw new BadRequestException(error);
      }
    }
    return dataset;
  }
}
