import { PartialType } from "@nestjs/swagger";
import { CreateUserIdentityDto } from "./create-user-identity.dto";

export class UpdateUserIdentityDto extends PartialType(CreateUserIdentityDto) {}
