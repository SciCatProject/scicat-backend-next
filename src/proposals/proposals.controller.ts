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
} from "@nestjs/common";
import { ProposalsService } from "./proposals.service";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Proposal, ProposalDocument } from "./schemas/proposal.schema";
import { AttachmentsService } from "src/attachments/attachments.service";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { UpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";
import { DatasetsService } from "src/datasets/datasets.service";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { IProposalFields } from "./interfaces/proposal-filters.interface";
import { CreateRawDatasetDto } from "src/datasets/dto/create-raw-dataset.dto";
import { UpdateRawDatasetDto } from "src/datasets/dto/update-raw-dataset.dto";
import { MultiUTCTimeInterceptor } from "src/common/interceptors/multi-utc-time.interceptor";
import { MeasurementPeriod } from "./schemas/measurement-period.schema";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { plainToInstance } from "class-transformer";
import { validate, ValidatorOptions } from "class-validator";
//import { DerivedDataset } from "src/datasets/schemas/derived-dataset.schema";
//import { RawDataset } from "src/datasets/schemas/raw-dataset.schema";

@ApiBearerAuth()
@ApiTags("proposals")
@Controller("proposals")
export class ProposalsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly datasetsService: DatasetsService,
    private readonly proposalsService: ProposalsService,
  ) {}

  // POST /proposals
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Proposal))
  @UseInterceptors(
    new MultiUTCTimeInterceptor<Proposal, MeasurementPeriod>(
      "MeasurementPeriodList",
      ["start", "end"],
    ),
  )
  @Post()
  @ApiExtraModels(CreateProposalDto)
  @ApiBody({
    type: CreateProposalDto,
    //schema: { $ref: getSchemaPath(CreateProposalDto) },
  })
  async create(
    @Body() createProposalDto: CreateProposalDto,
  ): Promise<Proposal> {
    return this.proposalsService.create(createProposalDto);
  }

  @AllowAny()
  @HttpCode(HttpStatus.OK)
  @Post("/isValid")
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Proposal))
  @Get()
  @ApiQuery({
    name: "filters",
    description: "Database filters to apply when retrieve all proposals",
    required: false,
  })
  async findAll(@Query("filters") filters?: string): Promise<Proposal[]> {
    const proposalFilters: IFilters<ProposalDocument, IProposalFields> =
      JSON.parse(filters ?? "{}");
    return this.proposalsService.findAll(proposalFilters);
  }

  // GET /proposals/fullquery
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Proposal))
  @Get("/fullquery")
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<Proposal[]> {
    const parsedFilters: IFilters<ProposalDocument, IProposalFields> = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.proposalsService.fullquery(parsedFilters);
  }

  // GET /proposals/fullfacet
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Proposal))
  @Get("/fullfacet")
  async fullfacet(
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const parsedFilters: IFacets<IProposalFields> = {
      fields: JSON.parse(filters.fields ?? "{}"),
      facets: JSON.parse(filters.facets ?? "[]"),
    };
    return this.proposalsService.fullfacet(parsedFilters);
  }

  // GET /proposals/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Proposal))
  @Get("/:id")
  async findOne(@Param("id") id: string): Promise<Proposal | null> {
    return this.proposalsService.findOne({ proposalId: id });
  }

  // PATCH /proposals/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Proposal))
  @UseInterceptors(
    new MultiUTCTimeInterceptor<Proposal, MeasurementPeriod>(
      "MeasurementPeriodList",
      ["start", "end"],
    ),
  )
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ): Promise<Proposal | null> {
    return this.proposalsService.update({ proposalId: id }, updateProposalDto);
  }

  // DELETE /proposals/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Proposal))
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.proposalsService.remove({ proposalId: id });
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
    //console.log("Add attachement to  proposal");
    const createAttachment = {
      ...createAttachmentDto,
      proposalId: id,
    };
    //console.log(createAttachmentDto);
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
      { _id: attachmentId, proposalId: proposalId },
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
    @Param("fk") attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      proposalId: proposalId,
    });
  }

  // POST /proposals/:id/datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, DatasetClass),
  )
  @Post("/:id/datasets")
  async createDataset(
    @Param("id") id: string,
    createRawDatasetDto: CreateRawDatasetDto,
  ): Promise<DatasetClass> {
    const createRawDataset = { ...createRawDatasetDto, proposalId: id };
    return await this.datasetsService.create(createRawDataset);
  }

  // GET /proposals/:id/datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, DatasetClass),
  )
  @Get("/:id/datasets")
  async findAllDatasets(
    @Param("id") proposalId: string,
  ): Promise<DatasetClass[] | null> {
    return this.datasetsService.findAll({ where: { proposalId } });
  }

  // PATCH /proposals/:id/datasets/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, DatasetClass),
  )
  @Patch("/:id/datasets/:fk")
  async findOneDatasetAndUpdate(
    @Param("id") proposalId: string,
    @Param("fk") datasetId: string,
    @Body() updateRawDatasetDto: UpdateRawDatasetDto,
  ): Promise<DatasetClass | null> {
    return this.datasetsService.findByIdAndUpdate(
      datasetId,
      updateRawDatasetDto,
    );
  }

  // DELETE /proposals/:id/datasets/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, DatasetClass),
  )
  @Delete("/:id/datasets/:fk")
  async findOneDatasetAndRemove(
    @Param("id") proposalId: string,
    @Param("fk") datasetId: string,
  ): Promise<unknown> {
    return this.datasetsService.findByIdAndDelete(datasetId);
  }
}
