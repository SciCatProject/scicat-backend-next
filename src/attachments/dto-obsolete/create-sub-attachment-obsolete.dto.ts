import { OmitType } from "@nestjs/swagger";
import { CreateAttachmentObsoleteDto } from "./create-attachment-obsolete.dto";

export class CreateSubAttachmentObsoleteDto extends OmitType(
  CreateAttachmentObsoleteDto,
  [
    "aid",
    "datasetId",
    "sampleId",
    "proposalId",
    "ownerGroup",
    "accessGroups",
    "instrumentGroup",
  ],
) {}
