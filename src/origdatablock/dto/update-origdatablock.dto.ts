import { PartialType } from "@nestjs/swagger";
import { CreateOrigdatablockDto } from "./create-origdatablock.dto";

export class UpdateOrigdatablockDto extends PartialType(
  CreateOrigdatablockDto,
) {}
