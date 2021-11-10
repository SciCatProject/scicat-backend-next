import { PartialType } from "@nestjs/swagger";
import { CreateRawDatasetDto } from "./create-raw-dataset.dto";

export class UpdateRawDatasetDto extends PartialType(CreateRawDatasetDto) {}
