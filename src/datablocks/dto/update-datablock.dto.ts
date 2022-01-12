import { PartialType } from "@nestjs/swagger";
import { CreateDatablockDto } from "./create-datablock.dto";

export class UpdateDatablockDto extends PartialType(CreateDatablockDto) {}
