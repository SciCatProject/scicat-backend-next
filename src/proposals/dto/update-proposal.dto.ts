import { PartialType } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsOptional } from "class-validator";
import { CreateProposalDto } from "./create-proposal.dto";

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
  @IsOptional()
  @Exclude()
  readonly proposalId: string;
}
