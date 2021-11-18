import { PartialType } from "@nestjs/swagger";
import { CreateDatasetDto } from "./create-dataset.dto";

export class UpdateDatasetDto extends PartialType(CreateDatasetDto) {}
