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
import { AttachmentsService } from "src/attachments/attachments.service";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { UpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";

@ApiTags("proposals")
@Controller("proposals")
export class ProposalsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly proposalsService: ProposalsService,
  ) {}

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

  // POST /proposals/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Attachment),
  )
  @Post("/:id/attachments")
  async createAttachment(
    @Param("id") id: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment> {
    const createAttachment = { ...createAttachmentDto, proposalId: id };
    return this.attachmentsService.create(createAttachment);
  }

  // GET /proposals/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:id/attachments")
  async findAllAttachments(@Param("id") id: string): Promise<Attachment[]> {
    return this.attachmentsService.findAll({ proposalId: id });
  }

  // PATCH /proposals/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Attachment),
  )
  @Patch("/:id/attachments/:fk")
  async findOneAttachmentAndUpdate(
    @Param("id") proposalId: string,
    @Param("fk") attachmentId: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    return this.attachmentsService.findOneAndUpdate(
      { _id: attachmentId, proposalId },
      updateAttachmentDto,
    );
  }

  // DELETE /proposals/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Attachment),
  )
  @Delete("/:id/attachments/:fk")
  async findOneAttachmentAndRemove(
    @Param("id") proposalId: string,
    attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      proposalId,
    });
  }
}
