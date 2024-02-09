import { IsOptional, IsString } from "class-validator";
import { UpdatePublishedDataDto } from "./update-published-data.dto";

export class CreatePublishedDataDto extends UpdatePublishedDataDto {
  @IsString()
  @IsOptional()
  readonly _id?: string;
}
