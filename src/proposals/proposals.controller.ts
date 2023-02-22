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
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";
import { ProposalsService } from "./proposals.service";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { ProposalClass, ProposalDocument } from "./schemas/proposal.schema";
import { AttachmentsService } from "src/attachments/attachments.service";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { UpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";
import { DatasetsService } from "src/datasets/datasets.service";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { IProposalFields } from "./interfaces/proposal-filters.interface";
import { MultiUTCTimeInterceptor } from "src/common/interceptors/multi-utc-time.interceptor";
import { MeasurementPeriodClass } from "./schemas/measurement-period.schema";
import {
  IFacets,
  IFilters,
  ILimitsFilter,
} from "src/common/interfaces/common.interface";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { plainToInstance } from "class-transformer";
import { validate, ValidatorOptions } from "class-validator";
import {
  filterDescription,
  filterExample,
  fullQueryDescription,
  fullQueryExample,
} from "src/common/utils";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";

@ApiBearerAuth()
@ApiTags("proposals")
@Controller("proposals")
export class ProposalsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly datasetsService: DatasetsService,
    private readonly proposalsService: ProposalsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  updateFiltersForList(
    request: Request,
    mergedFilters: IFilters<ProposalDocument, IProposalFields>,
  ): IFilters<ProposalDocument, IProposalFields> {
    const user: JWTUser = request.user as JWTUser;
    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, ProposalClass);
      const canViewTheirOwn = ability.can(Action.ListOwn, ProposalClass);

      if (!canViewAll && canViewTheirOwn) {
        if (!mergedFilters.where) {
          mergedFilters.where = {};
        }
        mergedFilters.where["$or"] = [
          { ownerGroup: { $in: user.currentGroups } },
          { accessGroups: { $in: user.currentGroups } },
        ];
      }
    }

    return mergedFilters;
  }

  // POST /proposals
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, ProposalClass),
  )
  @UseInterceptors(
    new MultiUTCTimeInterceptor<ProposalClass, MeasurementPeriodClass>(
      "MeasurementPeriodList",
      ["start", "end"],
    ),
  )
  @Post()
  @ApiOperation({
    summary: "It creates a new proposal.",
    description:
      "It creates a new proposal and returnes it completed with systems fields.",
  })
  @ApiExtraModels(CreateProposalDto)
  @ApiBody({
    type: CreateProposalDto,
  })
  @ApiResponse({
    status: 201,
    type: ProposalClass,
    description:
      "Create a new proposal and return its representation in SciCat",
  })
  async create(
    @Body() createProposalDto: CreateProposalDto,
  ): Promise<ProposalClass> {
    return this.proposalsService.create(createProposalDto);
  }

  @AllowAny()
  @HttpCode(HttpStatus.OK)
  @Post("/isValid")
  @ApiOperation({
    summary: "It validates the proposal provided as input.",
    description:
      "It validates the proposal provided as input, and returns true if the information is a valid proposal",
  })
  @ApiBody({
    type: CreateProposalDto,
  })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description:
      "Check if the proposal provided pass validation. It return true if the validation is passed",
  })
  async isValid(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() createProposal: unknown,
  ): Promise<{ valid: boolean }> {
    const validatorOptions: ValidatorOptions = {
      skipMissingProperties: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    };

    const dtoProposal = plainToInstance(CreateProposalDto, createProposal);
    const errorsProposal = await validate(dtoProposal, validatorOptions);

    const valid = errorsProposal.length == 0;

    return { valid: valid };
  }

  // GET /proposals
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, ProposalClass),
  )
  @Get()
  @ApiOperation({
    summary: "It returns a list of proposals.",
    description:
      "It returns a list of proposals. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filters",
    description:
      "Database filters to apply when retrieving proposals\n" +
      filterDescription,
    required: false,
    type: String,
    example: filterExample,
  })
  @ApiResponse({
    status: 200,
    type: ProposalClass,
    isArray: true,
    description: "Return the proposals requested",
  })
  async findAll(
    @Req() request: Request,
    @Query("filters") filters?: string,
  ): Promise<ProposalClass[]> {
    const proposalFilters: IFilters<ProposalDocument, IProposalFields> =
      this.updateFiltersForList(request, JSON.parse(filters ?? "{}"));

    return this.proposalsService.findAll(proposalFilters);
  }

  // GET /proposals/fullquery
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, ProposalClass),
  )
  @Get("/fullquery")
  @ApiOperation({
    summary: "It returns a list of proposals matching the query provided.",
    description:
      "It returns a list of proposals matching the query provided.<br>This endpoint still needs some work on the query specification.",
  })
  @ApiQuery({
    name: "filters",
    description:
      "Full query filters to apply when retrieving proposals\n" +
      fullQueryDescription,
    required: false,
    type: String,
    example: fullQueryExample,
  })
  @ApiResponse({
    status: 200,
    type: ProposalClass,
    isArray: true,
    description: "Return proposals requested",
  })
  async fullquery(
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<ProposalClass[]> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IProposalFields = JSON.parse(filters.fields ?? "{}");
    const limits: ILimitsFilter = JSON.parse(filters.limits ?? "{}");
    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, ProposalClass);

      // NOTE: If we have published true we don't add groups at all
      if (!canViewAll) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }

    const parsedFilters: IFilters<ProposalDocument, IProposalFields> = {
      fields,
      limits,
    };

    return this.proposalsService.fullquery(parsedFilters);
  }

  // GET /proposals/fullfacet
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, ProposalClass),
  )
  @Get("/fullfacet")
  @ApiOperation({
    summary:
      "It returns a list of proposal facets matching the filter provided.",
    description:
      "It returns a list of proposal facets matching the filter provided.<br>This endpoint still needs some work on the filter and facets specification.",
  })
  @ApiQuery({
    name: "filters",
    description:
      "Full facet query filters to apply when retrieving proposals\n" +
      fullQueryDescription,
    required: false,
    type: String,
    example: fullQueryExample,
  })
  @ApiResponse({
    status: 200,
    type: ProposalClass,
    isArray: true,
    description: "Return proposals requested",
  })
  async fullfacet(
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IProposalFields = JSON.parse(filters.fields ?? "{}");
    const facets = JSON.parse(filters.facets ?? "[]");
    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, ProposalClass);

      // NOTE: If we have published true we don't add groups at all
      if (!canViewAll) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }

    const parsedFilters: IFacets<IProposalFields> = {
      fields,
      facets,
    };

    return this.proposalsService.fullfacet(parsedFilters);
  }

  // GET /proposals/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, ProposalClass),
  )
  @Get("/:pid")
  @ApiOperation({
    summary: "It returns the proposal requested.",
    description: "It returns the proposal requested through the pid specified.",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the proposal to return",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: ProposalClass,
    isArray: false,
    description: "Return proposal with pid specified",
  })
  async findById(
    @Req() request: Request,
    @Param("pid") proposalId: string,
  ): Promise<ProposalClass | null> {
    const proposal = await this.proposalsService.findOne({
      proposalId: proposalId,
    });
    const user: JWTUser = request.user as JWTUser;

    if (proposal) {
      // NOTE: We need ProposalClass instance because casl module can not recognize the type from proposal mongo database model. If other fields are needed can be added later.
      const proposalInstance = new ProposalClass();
      proposalInstance._id = proposal._id;
      proposalInstance.accessGroups = proposal.accessGroups;
      proposalInstance.ownerGroup = proposal.ownerGroup;
      proposalInstance.proposalId = proposal.proposalId;
      proposalInstance.email = proposal.email;

      if (user) {
        const ability = this.caslAbilityFactory.createForUser(user);
        const canView =
          ability.can(Action.Manage, proposalInstance) ||
          ability.can(Action.Read, proposalInstance);

        if (!canView) {
          throw new ForbiddenException("Unauthorized access");
        }
      } else {
        throw new ForbiddenException("Unauthorized access");
      }
    }

    return proposal;
  }

  // PATCH /proposals/:pid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, ProposalClass),
  )
  @UseInterceptors(
    new MultiUTCTimeInterceptor<ProposalClass, MeasurementPeriodClass>(
      "MeasurementPeriodList",
      ["start", "end"],
    ),
  )
  @Patch("/:pid")
  @ApiOperation({
    summary: "It updates the proposal.",
    description:
      "It updates the proposal specified through the pid specified. it updates only the specified fields.",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the proposal to modify",
    type: String,
  })
  @ApiExtraModels(UpdateProposalDto)
  @ApiBody({
    type: UpdateProposalDto,
  })
  @ApiResponse({
    status: 200,
    type: ProposalClass,
    description:
      "Update an existing proposal and return its representation in SciCat",
  })
  async update(
    @Param("pid") proposalId: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ): Promise<ProposalClass | null> {
    return this.proposalsService.update(
      { proposalId: proposalId },
      updateProposalDto,
    );
  }

  // DELETE /proposals/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, ProposalClass),
  )
  @Delete("/:pid")
  @ApiOperation({
    summary: "It deletes the proposal.",
    description: "It delete the proposal specified through the pid specified.",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the proposal to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned",
  })
  async remove(@Param("pid") proposalId: string): Promise<unknown> {
    return this.proposalsService.remove({ proposalId: proposalId });
  }

  // POST /proposals/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Attachment),
  )
  @Post("/:pid/attachments")
  @ApiOperation({
    summary: "It creates a new attachement for the proposal specified.",
    description:
      "It creates a new attachement for the proposal specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the proposal we would like to create a new attachment for",
    type: String,
  })
  @ApiExtraModels(CreateAttachmentDto)
  @ApiBody({
    type: CreateAttachmentDto,
  })
  @ApiResponse({
    status: 201,
    type: Attachment,
    description:
      "Create a new attachment for the proposal identified by the pid specified",
  })
  async createAttachment(
    @Param("pid") proposalId: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment> {
    const createAttachment = {
      ...createAttachmentDto,
      proposalId: proposalId,
    };
    return this.attachmentsService.create(createAttachment);
  }

  // GET /proposals/:pid/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:pid/attachments")
  @ApiOperation({
    summary: "It returns all the attachments for the proposal specified.",
    description:
      "It returns all the attachments for the proposal specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the proposal for which we would like to retrieve all the attachments",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Attachment,
    isArray: true,
    description:
      "Array with all the attachments associated with the proposal with the pid specified",
  })
  async findAllAttachments(
    @Param("pid") proposalId: string,
  ): Promise<Attachment[]> {
    return this.attachmentsService.findAll({ proposalId: proposalId });
  }

  // PATCH /proposals/:pid/attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Attachment),
  )
  @Patch("/:pid/attachments/:aid")
  @ApiOperation({
    summary: "It updates the attachment specified for the proposal indicated.",
    description:
      "It updates the attachment specified by the aid parameter for the proposal indicated by the pid parameter.<br>This endpoint is obsolete and it will removed in future version.<br>Attachements can be updated from the attachment endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the proposal for which we would like to update the attachment specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Id of the attachment of this proposal that we would like to patch",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Attachment,
    isArray: false,
    description:
      "Update values of the attachment with id specified associated with the proposal with the pid specified",
  })
  async findOneAttachmentAndUpdate(
    @Param("pid") proposalId: string,
    @Param("aid") attachmentId: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    return this.attachmentsService.findOneAndUpdate(
      { _id: attachmentId, proposalId: proposalId },
      updateAttachmentDto,
    );
  }

  // DELETE /proposals/:pid/attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Attachment),
  )
  @Delete("/:pid/attachments/:aid")
  @ApiOperation({
    summary: "It deletes the attachment from the proposal.",
    description:
      "It deletes the attachment from the proposal.<br>This endpoint is obsolete and will be dropped in future versions.<br>Deleting attachments will be done only from the attachements endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the proposal for which we would like to delete the attachment specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Id of the attachment of this proposal that we would like to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description:
      "Remove the attachment with id specified associated with the proposal with the pid specified",
  })
  async findOneAttachmentAndRemove(
    @Param("pid") proposalId: string,
    @Param("aid") attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      proposalId: proposalId,
    });
  }

  // GET /proposals/:id/datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, DatasetClass),
  )
  @Get("/:pid/datasets")
  @ApiOperation({
    summary:
      "It returns all the datasets associated with the proposal indicated.",
    description:
      "It returns all the datasets associated with the proposal indicated by the pid parameter.<br>Changes to the related datasets must be performed through the dataset endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the proposal for which we would like to retrieve all the datasets",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    isArray: true,
    description:
      "Array with all the datasets associated with the proposal with the pid specified",
  })
  async findAllDatasets(
    @Param("pid") proposalId: string,
  ): Promise<DatasetClass[] | null> {
    return this.datasetsService.findAll({ where: { proposalId } });
  }
}
