import { PartialType } from '@nestjs/swagger';
import { CreateDerivedDatasetDto } from './create-derived-dataset.dto';

export class UpdateDerivedDatasetDto extends PartialType(
  CreateDerivedDatasetDto,
) {}
