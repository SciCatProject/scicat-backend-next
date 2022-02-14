import { PartialType } from "@nestjs/swagger";
import { CreatePublishedDatumDto } from "./create-published-datum.dto";

export class UpdatePublishedDatumDto extends PartialType(
  CreatePublishedDatumDto,
) {}
