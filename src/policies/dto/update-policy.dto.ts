import {PartialType} from "@nestjs/swagger";
import {CreatePolicyDto} from "./create-policy.dto";

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}
