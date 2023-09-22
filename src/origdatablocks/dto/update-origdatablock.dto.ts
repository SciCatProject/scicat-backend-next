import {PartialType} from "@nestjs/swagger";
import {CreateOrigDatablockDto} from "./create-origdatablock.dto";

export class UpdateOrigDatablockDto extends PartialType(
  CreateOrigDatablockDto,
) {}
