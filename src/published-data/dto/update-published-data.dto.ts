import { PartialType } from "@nestjs/swagger";
import { CreatePublishedDataDto } from "./create-published-data.dto";

export class UpdatePublishedDataDto extends PartialType(
  CreatePublishedDataDto,
) {}
