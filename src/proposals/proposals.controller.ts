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
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { Request } from "express";
import { ProposalsService } from "./proposals.service";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { PartialUpdateProposalDto } from "./dto/update-proposal.dto";
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
import { AuthenticatedPoliciesGuard } from "../casl/guards/auth-check.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { ProposalClass, ProposalDocument } from "./schemas/proposal.schema";
import { AttachmentsService } from "src/attachments/attachments.service";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { PartialUpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";
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
import { plainToInstance } from "class-transformer";
import { validate, ValidatorOptions } from "class-validator";
import {
  filterDescription,
  filterExample,
  fullQueryDescriptionLimits,
  fullQueryExampleLimits,
  proposalsFullQueryDescriptionFields,
  proposalsFullQueryExampleFields,
} from "src/common/utils";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";

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

  private generateProposalInstanceForPermissions(
    proposal: ProposalClass | CreateProposalDto,
  ): ProposalClass {
    const proposalInstance = new ProposalClass();
    proposalInstance.accessGroups = proposal.accessGroups || [];
    proposalInstance.ownerGroup = proposal.ownerGroup || "";
    proposalInstance.proposalId = proposal.proposalId || "";
    proposalInstance.email = proposal.email || "";
    proposalInstance.isPublished =
      "isPublished" in proposal ? proposal.isPublished : false;

    return proposalInstance;
  }

  private async permissionChecker(
    group: Action,
    proposal: ProposalClass | CreateProposalDto,
    request: Request,
  ) {
    const proposalInstance = this.generateProposalInstanceForPermissions(
      proposal as ProposalClass,
    );

    const user: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.createForUser(user);

    try {
      switch (group) {
        case Action.ProposalsCreate:
          return (
            ability.can(Action.ProposalsCreateAny, ProposalClass) ||
            ability.can(Action.ProposalsCreateOwner, proposalInstance)
          );
        case Action.ProposalsRead:
          return (
            ability.can(Action.ProposalsReadAny, ProposalClass) ||
            ability.can(Action.ProposalsReadOneOwner, proposalInstance) ||
            ability.can(Action.ProposalsReadOneAccess, proposalInstance) ||
            ability.can(Action.ProposalsReadOnePublic, proposalInstance)
          );
        case Action.ProposalsUpdate:
          return (
            ability.can(Action.ProposalsUpdateAny, ProposalClass) ||
            ability.can(Action.ProposalsUpdateOwner, proposalInstance)
          );
        case Action.ProposalsDelete:
          return (
            ability.can(Action.ProposalsDeleteAny, ProposalClass) ||
            ability.can(Action.ProposalsDeleteOwner, proposalInstance)
          );
        case Action.ProposalsAttachmentCreate:
          return (
            ability.can(Action.ProposalsAttachmentCreateAny, ProposalClass) ||
            ability.can(Action.ProposalsAttachmentCreateOwner, proposalInstance)
          );
        case Action.ProposalsAttachmentRead:
          return (
            ability.can(Action.ProposalsAttachmentReadAny, ProposalClass) ||
            ability.can(
              Action.ProposalsAttachmentReadOwner,
              proposalInstance,
            ) ||
            ability.can(
              Action.ProposalsAttachmentReadPublic,
              proposalInstance,
            ) ||
            ability.can(Action.ProposalsAttachmentReadAccess, proposalInstance)
          );
        case Action.ProposalsAttachmentUpdate:
          return (
            ability.can(Action.ProposalsAttachmentUpdateAny, ProposalClass) ||
            ability.can(Action.ProposalsAttachmentUpdateOwner, proposalInstance)
          );
        case Action.ProposalsAttachmentDelete:
          return (
            ability.can(Action.ProposalsAttachmentDeleteAny, ProposalClass) ||
            ability.can(Action.ProposalsAttachmentDeleteOwner, proposalInstance)
          );

        default:
          Logger.error("Permission for the action is not specified");
          return false;
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async checkPermissionsForProposal(
    request: Request,
    id: string,
    group: Action,
  ) {
    const proposal = await this.proposalsService.findOne({
      proposalId: id,
    });

    if (proposal) {
      const canDoAction = await this.permissionChecker(
        group,
        proposal,
        request,
      );

      if (!canDoAction) {
        throw new ForbiddenException("Unauthorized to this proposal");
      }
    }
    return proposal;
  }

  private async checkPermissionsForProposalCreate(
    request: Request,
    proposal: CreateProposalDto,
    group: Action,
  ) {
    if (!proposal) {
      throw new BadRequestException("Not able to create this proposal");
    }
    const canDoAction = await this.permissionChecker(group, proposal, request);
    if (!canDoAction) {
      throw new ForbiddenException("Unauthorized to create this proposal");
    }
    return proposal;
  }
  updateFiltersForList(
    request: Request,
    mergedFilters: IFilters<ProposalDocument, IProposalFields>,
  ): IFilters<ProposalDocument, IProposalFields> {
    const user: JWTUser = request.user as JWTUser;
    mergedFilters.where = mergedFilters.where || {};

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ProposalsReadAny, ProposalClass);
      if (!canViewAll) {
        const canViewAccess = ability.can(
          Action.ProposalsReadManyAccess,
          ProposalClass,
        );
        const canViewOwner = ability.can(
          Action.ProposalsReadManyOwner,
          ProposalClass,
        );
        const canViewPublic = ability.can(
          Action.ProposalsReadManyPublic,
          ProposalClass,
        );
        if (canViewAccess) {
          mergedFilters.where["$or"] = [
            { ownerGroup: { $in: user.currentGroups } },
            { accessGroups: { $in: user.currentGroups } },
          ];
        } else if (canViewOwner) {
          mergedFilters.where = { ownerGroup: { $in: user.currentGroups } };
        } else if (canViewPublic) {
          mergedFilters.where.isPublished = true;
        }
      }
    } else {
      mergedFilters.where.isPublished = true;
    }

    return mergedFilters;
  }

  // POST /proposals
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsCreate, ProposalClass),
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
    @Req() request: Request,
    @Body() createProposalDto: CreateProposalDto,
  ): Promise<ProposalClass> {
    const proposalDTO = await this.checkPermissionsForProposalCreate(
      request,
      createProposalDto,
      Action.ProposalsCreate,
    );
    const existingProposal = await this.proposalsService.findOne({
      proposalId: createProposalDto.proposalId,
    });

    if (existingProposal) {
      throw new ConflictException(
        `Proposal with ${createProposalDto.proposalId} already exists`,
      );
    }

    return this.proposalsService.create(proposalDTO);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsCreate, ProposalClass),
  )
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
    @Req() request: Request,
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
    ability.can(Action.ProposalsRead, ProposalClass),
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
    ability.can(Action.ProposalsRead, ProposalClass),
  )
  @Get("/fullquery")
  @ApiOperation({
    summary: "It returns a list of proposals matching the query provided.",
    description:
      "It returns a list of proposals matching the query provided.<br>This endpoint still needs some work on the query specification.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Full query filters to apply when retrieving proposals\n" +
      proposalsFullQueryDescriptionFields,
    required: false,
    type: String,
    example: proposalsFullQueryExampleFields,
  })
  @ApiQuery({
    name: "limits",
    description:
      "Define further query parameters like skip, limit, order\n" +
      fullQueryDescriptionLimits,
    required: false,
    type: String,
    example: fullQueryExampleLimits,
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
      const canViewAll = ability.can(Action.ProposalsReadAny, ProposalClass);

      if (!canViewAll) {
        const canViewAccess = ability.can(
          Action.ProposalsReadManyAccess,
          ProposalClass,
        );
        const canViewOwner = ability.can(
          Action.ProposalsReadManyOwner,
          ProposalClass,
        );
        const canViewPublic = ability.can(
          Action.ProposalsReadManyPublic,
          ProposalClass,
        );
        if (canViewAccess) {
          fields.userGroups = fields.userGroups ?? [];
          fields.userGroups.push(...user.currentGroups);
          // fields.sharedWith = user.email;
        } else if (canViewOwner) {
          fields.ownerGroup = fields.ownerGroup ?? [];
          fields.ownerGroup.push(...user.currentGroups);
        } else if (canViewPublic) {
          fields.isPublished = true;
        }
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
    ability.can(Action.ProposalsRead, ProposalClass),
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
      proposalsFullQueryDescriptionFields,
    required: false,
    type: String,
    example: proposalsFullQueryExampleFields,
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
      const canViewAll = ability.can(Action.ProposalsReadAny, ProposalClass);

      if (!canViewAll) {
        const canViewAccess = ability.can(
          Action.ProposalsReadManyAccess,
          ProposalClass,
        );
        const canViewOwner = ability.can(
          Action.ProposalsReadManyOwner,
          ProposalClass,
        );
        const canViewPublic = ability.can(
          Action.ProposalsReadManyPublic,
          ProposalClass,
        );
        if (canViewAccess) {
          fields.userGroups = fields.userGroups ?? [];
          fields.userGroups.push(...user.currentGroups);
          // fields.sharedWith = user.email;
        } else if (canViewOwner) {
          fields.ownerGroup = fields.ownerGroup ?? [];
          fields.ownerGroup.push(...user.currentGroups);
        } else if (canViewPublic) {
          fields.isPublished = true;
        }
      }
    }

    const parsedFilters: IFacets<IProposalFields> = {
      fields,
      facets,
    };

    return this.proposalsService.fullfacet(parsedFilters);
  }

  // GET /proposals/:pid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsRead, ProposalClass),
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
    status: HttpStatus.OK,
    type: ProposalClass,
    isArray: false,
    description: "Return proposal with pid specified",
  })
  async findById(
    @Req() request: Request,
    @Param("pid") proposalId: string,
  ): Promise<ProposalClass | null> {
    const proposal = await this.checkPermissionsForProposal(
      request,
      proposalId,
      Action.ProposalsRead,
    );

    return proposal;
  }

  // GET /proposals/:pid/access
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsRead, ProposalClass),
  )
  @Get("/:pid/access")
  @ApiOperation({
    summary: "Check user access to a specific proposal.",
    description:
      "Returns a boolean indicating whether the user has access to the proposal with the specified ID.",
  })
  @ApiParam({
    name: "pid",
    description: "ID of the proposal to check access for",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean,
    description:
      "Returns true if the user has access to the specified proposal, otherwise false.",
  })
  async findByIdAccess(
    @Req() request: Request,
    @Param("pid") proposalId: string,
  ): Promise<{ canAccess: boolean }> {
    const proposal = await this.proposalsService.findOne({
      proposalId,
    });
    if (!proposal) return { canAccess: false };

    const canAccess = await this.permissionChecker(
      Action.ProposalsRead,
      proposal,
      request,
    );
    return { canAccess: canAccess };
  }

  // PATCH /proposals/:pid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsUpdate, ProposalClass),
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
  @ApiExtraModels(PartialUpdateProposalDto)
  @ApiBody({
    type: PartialUpdateProposalDto,
  })
  @ApiResponse({
    status: 200,
    type: ProposalClass,
    description:
      "Update an existing proposal and return its representation in SciCat",
  })
  async update(
    @Req() request: Request,
    @Param("pid") proposalId: string,
    @Body() updateProposalDto: PartialUpdateProposalDto,
  ): Promise<ProposalClass | null> {
    await this.checkPermissionsForProposal(
      request,
      proposalId,
      Action.ProposalsUpdate,
    );
    return this.proposalsService.update(
      { proposalId: proposalId },
      updateProposalDto,
    );
  }

  // DELETE /proposals/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsDelete, ProposalClass),
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
  async remove(
    @Req() request: Request,
    @Param("pid") proposalId: string,
  ): Promise<unknown> {
    await this.checkPermissionsForProposal(
      request,
      proposalId,
      Action.ProposalsDelete,
    );
    return this.proposalsService.remove({ proposalId: proposalId });
  }

  // POST /proposals/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsAttachmentCreate, ProposalClass),
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
    @Req() request: Request,
    @Param("pid") proposalId: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment> {
    await this.checkPermissionsForProposal(
      request,
      proposalId,
      Action.ProposalsAttachmentCreate,
    );

    const createAttachment = {
      ...createAttachmentDto,
      proposalId: proposalId,
    };
    return this.attachmentsService.create(createAttachment);
  }

  // GET /proposals/:pid/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsAttachmentRead, ProposalClass),
  )
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
    @Req() request: Request,
    @Param("pid") proposalId: string,
  ): Promise<Attachment[]> {
    await this.checkPermissionsForProposal(
      request,
      proposalId,
      Action.ProposalsAttachmentRead,
    );
    return this.attachmentsService.findAll({ proposalId: proposalId });
  }

  // PATCH /proposals/:pid/attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsAttachmentUpdate, ProposalClass),
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
    @Req() request: Request,
    @Param("pid") proposalId: string,
    @Param("aid") attachmentId: string,
    @Body() updateAttachmentDto: PartialUpdateAttachmentDto,
  ): Promise<Attachment | null> {
    await this.checkPermissionsForProposal(
      request,
      proposalId,
      Action.ProposalsAttachmentUpdate,
    );
    return this.attachmentsService.findOneAndUpdate(
      { _id: attachmentId, proposalId: proposalId },
      updateAttachmentDto,
    );
  }

  // DELETE /proposals/:pid/attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsAttachmentDelete, ProposalClass),
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
    @Req() request: Request,
    @Param("pid") proposalId: string,
    @Param("aid") attachmentId: string,
  ): Promise<unknown> {
    await this.checkPermissionsForProposal(
      request,
      proposalId,
      Action.ProposalsAttachmentDelete,
    );
    return this.attachmentsService.findOneAndDelete({
      _id: attachmentId,
      proposalId: proposalId,
    });
  }

  // GET /proposals/:id/datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.ProposalsDatasetRead, ProposalClass),
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
    @Req() request: Request,
    @Param("pid") proposalId: string,
  ): Promise<DatasetClass[] | null> {
    const user: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.createForUser(user);
    const canViewAny = ability.can(Action.DatasetReadAny, DatasetClass);
    const fields: IDatasetFields = JSON.parse("{}");

    if (!canViewAny) {
      const canViewAccess = ability.can(
        Action.DatasetReadManyAccess,
        DatasetClass,
      );
      const canViewOwner = ability.can(
        Action.DatasetReadManyOwner,
        DatasetClass,
      );
      const canViewPublic = ability.can(
        Action.DatasetReadManyPublic,
        DatasetClass,
      );
      if (canViewAccess) {
        fields.userGroups = user.currentGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
        // fields.sharedWith = user.email;
      } else if (canViewOwner) {
        fields.ownerGroup = user.currentGroups ?? [];
        fields.ownerGroup.push(...user.currentGroups);
      } else if (canViewPublic) {
        fields.isPublished = true;
      }
    }

    const dataset = await this.datasetsService.fullquery({
      where: { proposalId },
      fields: fields,
    });

    return dataset;
  }
}
