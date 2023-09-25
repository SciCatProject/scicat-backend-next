import { OmitType } from "@nestjs/swagger";
import { CreateOrigDatablockDto } from "./create-origdatablock.dto";

export class CreateDatasetOrigDatablockDto extends OmitType(
  CreateOrigDatablockDto,
  ["datasetId", "ownerGroup", "accessGroups", "instrumentGroup"] as const,
) {}
