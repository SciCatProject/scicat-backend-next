import { Type } from "class-transformer";
import { IsObject, IsOptional, IsString } from "class-validator";
import { UpdatePolicyDto } from "./update-policy.dto";

export class UpdateWherePolicyDto {
  @IsString()
  @IsOptional()
  readonly ownerGroupList: string;

  @IsObject()
  @IsOptional()
  @Type(() => UpdatePolicyDto)
  readonly data: UpdatePolicyDto;
}
