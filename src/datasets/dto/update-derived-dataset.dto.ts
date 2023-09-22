import {PartialType} from "@nestjs/swagger";
import {Exclude} from "class-transformer";
import {IsOptional} from "class-validator";
import {Attachment} from "src/attachments/schemas/attachment.schema";
import {Datablock} from "src/datablocks/schemas/datablock.schema";
import {OrigDatablock} from "src/origdatablocks/schemas/origdatablock.schema";
import {CreateDerivedDatasetDto} from "./create-derived-dataset.dto";

export class UpdateDerivedDatasetDto extends CreateDerivedDatasetDto {
  @IsOptional()
  @Exclude()
  readonly _id?: string;

  @IsOptional()
  @Exclude()
  declare readonly pid?: string;

  @IsOptional()
  @Exclude()
  readonly createdAt?: string;

  @IsOptional()
  @Exclude()
  readonly updatedAt?: string;

  @IsOptional()
  @Exclude()
  readonly createdBy?: string;

  @IsOptional()
  @Exclude()
  readonly updatedBy?: string;

  @IsOptional()
  @Exclude()
  readonly history?: string;

  @IsOptional()
  attachments?: Attachment[];

  @IsOptional()
  origdatablocks?: OrigDatablock[];

  @IsOptional()
  datablocks?: Datablock[];
}
export class PartialUpdateDerivedDatasetDto extends PartialType(
  CreateDerivedDatasetDto,
) {}
