import { PartialType } from "@nestjs/swagger";
import { CreateLogbookDto } from "./create-logbook.dto";

export class UpdateLogbookDto extends PartialType(CreateLogbookDto) {}
