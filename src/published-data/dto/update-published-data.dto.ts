import { PartialType } from "@nestjs/swagger";
import { CreatePublishedDatumDto } from "./create-published-data.dto";

export class UpdatePublishedDatumDto extends PartialType(
  CreatePublishedDatumDto,
) {}
