import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ProposalsService } from "./proposals.service";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import { ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Proposal, ProposalDocument } from "./schemas/proposal.schema";
import { FilterQuery } from "mongoose";

@ApiTags("proposals")
@Controller("proposals")
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  // POST /proposals
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Proposal))
  @Post()
  async create(
    @Body() createProposalDto: CreateProposalDto,
  ): Promise<Proposal> {
    return this.proposalsService.create(createProposalDto);
  }

  // GET /proposals
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Proposal))
  @Get()
  async findAll(@Query() filters?: string): Promise<Proposal[]> {
    const proposalFilters: FilterQuery<ProposalDocument> = filters
      ? JSON.parse(filters)
      : {};
    return this.proposalsService.findAll(proposalFilters);
  }

  // GET /proposals/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Proposal))
  @Get("/:id")
  async findOne(@Param("id") id: string): Promise<Proposal | null> {
    return this.proposalsService.findOne({ _id: id });
  }

  // PATCH /proposals/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Proposal))
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ): Promise<Proposal | null> {
    return this.proposalsService.update({ _id: id }, updateProposalDto);
  }

  // DELETE /proposals/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Proposal))
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.proposalsService.remove({ _id: id });
  }
}
