import { OmitType } from "@nestjs/swagger";
import { CreateDatablockDto } from "./create-datablock.dto";

/*
 * This dto is used when created a datablock from the dataset endpoint
 */
export class CreateDatasetDatablockDto extends OmitType(CreateDatablockDto, [
  "datasetId",
  "ownerGroup",
  "accessGroups",
  "instrumentGroup",
] as const) {}
