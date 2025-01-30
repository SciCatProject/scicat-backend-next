import { IsString } from "class-validator";
import { UpdateProposalDto } from "./update-proposal.dto";

export class CreateProposalDto extends UpdateProposalDto {
  /**
   * Globally unique identifier of a proposal, eg. PID-prefix/internal-proposal-number. PID prefix is auto prepended.
   */
  @IsString()
  readonly proposalId: string;
}
