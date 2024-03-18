import { OmitType } from "@nestjs/swagger";
import { CreateAttachmentDto } from "./create-attachment.dto";

export class CreateSubAttachmentDto extends OmitType(CreateAttachmentDto, [
  "id",
  "datasetId",
  "sampleId",
  "proposalId",
  "ownerGroup",
  "accessGroups",
  "instrumentGroup",
]) {}
