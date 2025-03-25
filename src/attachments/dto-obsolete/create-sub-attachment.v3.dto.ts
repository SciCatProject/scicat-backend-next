import { OmitType } from "@nestjs/swagger";
import { CreateAttachmentV3Dto } from "./create-attachment.v3.dto";

export class CreateSubAttachmentV3Dto extends OmitType(CreateAttachmentV3Dto, [
  "aid",
  "datasetId",
  "sampleId",
  "proposalId",
  "ownerGroup",
  "accessGroups",
  "instrumentGroup",
]) {}
