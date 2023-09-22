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
import {SamplesService} from "./samples.service";
import {CreateSampleDto} from "./dto/create-sample.dto";
import {UpdateSampleDto} from "./dto/update-sample.dto";
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
import {PoliciesGuard} from "src/casl/guards/policies.guard";
import {CheckPolicies} from "src/casl/decorators/check-policies.decorator";
import {AppAbility} from "src/casl/casl-ability.factory";
import {Action} from "src/casl/action.enum";
import {
  SampleClass,
  SampleDocument,
  SampleWithAttachmentsAndDatasets,
} from "./schemas/sample.schema";
import {Attachment} from "src/attachments/schemas/attachment.schema";
import {CreateAttachmentDto} from "src/attachments/dto/create-attachment.dto";
import {AttachmentsService} from "src/attachments/attachments.service";
import {DatasetClass} from "src/datasets/schemas/dataset.schema";
import {DatasetsService} from "src/datasets/datasets.service";
import {ISampleFields} from "./interfaces/sample-filters.interface";
import {FormatPhysicalQuantitiesInterceptor} from "src/common/interceptors/format-physical-quantities.interceptor";
import {IFilters} from "src/common/interfaces/common.interface";
import {
  filterDescription,
  filterExample,
  fullQueryDescriptionLimits,
  fullQueryExampleLimits,
  samplesFullQueryDescriptionFields,
  samplesFullQueryExampleFields,
} from "src/common/utils";

@ApiBearerAuth()
@ApiTags("samples")
@Controller("samples")
export class SamplesController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly datasetsService: DatasetsService,
    private readonly samplesService: SamplesService,
  ) {}

  // POST /samples
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, SampleClass),
  )
  @UseInterceptors(
    new FormatPhysicalQuantitiesInterceptor<SampleClass>(
      "sampleCharacteristics",
    ),
  )
  @HttpCode(HttpStatus.OK)
  @Post()
  @ApiOperation({
    summary: "It creates a new sample.",
    description:
      "It creates a new sample and returns it completed with systems fields.",
  })
  @ApiExtraModels(CreateSampleDto)
  @ApiBody({
    type: CreateSampleDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SampleClass,
    description: "Create a new sample and return its representation in SciCat",
  })
  async create(@Body() createSampleDto: CreateSampleDto): Promise<SampleClass> {
    return this.samplesService.create(createSampleDto);
  }

  // GET /samples
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, SampleClass))
  @Get()
  @ApiOperation({
    summary: "It returns a list of samples",
    description:
      "It returns a list of samples. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieve samples\n" + filterDescription,
    required: false,
    type: String,
    example: filterExample,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SampleClass,
    isArray: true,
    description: "Return the samples requested",
  })
  async findAll(@Query("filter") filters?: string): Promise<SampleClass[]> {
    const sampleFilters: IFilters<SampleDocument, ISampleFields> = JSON.parse(
      filters ?? "{}",
    );
    return this.samplesService.findAll(sampleFilters);
  }

  // GET /samples/fullquery
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, SampleClass))
  @Get("/fullquery")
  @ApiOperation({
    summary: "It returns a list of samples matching the query provided.",
    description:
      "It returns a list of samples matching the query provided.<br>This endpoint still needs some work on the query specification.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Full query filters to apply when retrieve samples\n" +
      samplesFullQueryDescriptionFields,
    required: false,
    type: String,
    example: samplesFullQueryExampleFields,
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
    status: HttpStatus.OK,
    type: SampleClass,
    isArray: true,
    description: "Return samples requested",
  })
  async fullquery(
    @Query() filters: {fields?: string; limits?: string},
  ): Promise<SampleClass[]> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.samplesService.fullquery(parsedFilters);
  }

  // GET /samples/metadataKeys
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, SampleClass))
  @Get("/metadataKeys")
  @ApiOperation({
    summary:
      "It returns a list of sample metadata keys matching the query provided.",
    description:
      "It returns a list of sample metadata keys matching the query provided.",
  })
  @ApiQuery({
    name: "filters",
    description:
      "Full query filters to apply when retrieve sample metadata keys",
    required: false,
    type: String,
    // NOTE: This is custom example because the service function metadataKeys expects input like the following.
    // eslint-disable-next-line @typescript-eslint/quotes
    example: '{ "fields": { "metadataKey": "chemical_formula" } }',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    isArray: true,
    description: "Return sample metadata keys requested",
  })
  async metadataKeys(@Query() {filters}: {filters: string}): Promise<string[]> {
    const parsedInput = JSON.parse(filters ?? "{}");

    const parsedFilters = {
      fields: parsedInput.fields ?? {},
      limits: parsedInput.limits ?? {},
    };

    return this.samplesService.metadataKeys(parsedFilters);
  }

  // GET /samples/findOne
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, SampleClass))
  @Get("/findOne")
  @ApiOperation({
    summary: "It returns a sample matching the query provided.",
    description: "It returns sample matching the query provided.",
  })
  @ApiQuery({
    name: "filter",
    description: "Filters to apply when retrieve sample\n" + filterDescription,
    required: false,
    type: String,
    example: filterExample,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SampleWithAttachmentsAndDatasets,
    description: "Return sample requested",
  })
  async findOne(
    @Query("filter") queryFilters?: string,
  ): Promise<SampleWithAttachmentsAndDatasets | null> {
    const jsonFilters: IFilters<SampleDocument, ISampleFields> = queryFilters
      ? JSON.parse(queryFilters)
      : {};
    const whereFilters = jsonFilters.where ?? {};

    const sample = (
      await this.samplesService.findOne(whereFilters)
    )?.toObject() as SampleWithAttachmentsAndDatasets;

    if (sample) {
      const includeFilters = jsonFilters.include ?? [];
      await Promise.all(
        includeFilters.map(async ({relation}) => {
          switch (relation) {
            case "attachments": {
              sample.attachments = await this.attachmentsService.findAll({
                sampleId: sample.sampleId,
              });
              break;
            }
            case "datasets": {
              sample.datasets = await this.datasetsService.findAll({
                where: {sampleId: sample.sampleId},
              });
              break;
            }
          }
        }),
      );
    }

    return sample;
  }

  // GET /samples/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, SampleClass))
  @Get("/:id")
  @ApiOperation({
    summary: "It returns the sample requested.",
    description: "It returns the sample requested through the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the sample to return",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SampleClass,
    description: "Return sample with id specified",
  })
  async findById(@Param("id") id: string): Promise<SampleClass | null> {
    return this.samplesService.findOne({sampleId: id});
  }

  // PATCH /samples/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, SampleClass),
  )
  @UseInterceptors(
    new FormatPhysicalQuantitiesInterceptor<SampleClass>(
      "sampleCharacteristics",
    ),
  )
  @Patch("/:id")
  @ApiOperation({
    summary: "It updates the sample.",
    description:
      "It updates the sample specified through the id specified. it updates only the specified fields.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the sample to modify",
    type: String,
  })
  @ApiExtraModels(UpdateSampleDto)
  @ApiBody({
    type: UpdateSampleDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SampleClass,
    description:
      "Update an existing sample and return its representation in SciCat",
  })
  async update(
    @Param("id") id: string,
    @Body() updateSampleDto: UpdateSampleDto,
  ): Promise<SampleClass | null> {
    return this.samplesService.update({sampleId: id}, updateSampleDto);
  }

  // DELETE /samples/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, SampleClass),
  )
  @Delete("/:id")
  @ApiOperation({
    summary: "It deletes the sample.",
    description: "It delete the sample specified through the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the sample to delete",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "No value is returned",
  })
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.samplesService.remove({sampleId: id});
  }

  // POST /samples/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Attachment),
  )
  @Post("/:id/attachments")
  @ApiOperation({
    summary: "It creates a new attachment related with this sample.",
    description:
      "It creates a new attachment related to the sample id provided and returns it completed with system fields.",
  })
  @ApiExtraModels(CreateAttachmentDto)
  @ApiBody({
    type: CreateAttachmentDto,
  })
  @ApiParam({
    name: "id",
    description: "Sample id that this attachment will be related to.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Attachment,
    description:
      "Create a new attachment related to sample id provided and return its representation in SciCat",
  })
  async createAttachments(
    @Param("id") id: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment | null> {
    const sample = await this.samplesService.findOne({sampleId: id});
    if (sample) {
      const createAttachment: CreateAttachmentDto = {
        ...createAttachmentDto,
        sampleId: id,
        ownerGroup: sample.ownerGroup,
      };
      return this.attachmentsService.create(createAttachment);
    }
    return null;
  }

  // GET /samples/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:id/attachments")
  @ApiOperation({
    summary: "It returns the attachments related to a specific sample.",
    description:
      "It returns the attachments related to a sample through the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the sample to get attachments related.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    isArray: true,
    type: Attachment,
    description: "Return attachments related with sample id specified",
  })
  async findAllAttachments(@Param("id") id: string): Promise<Attachment[]> {
    return this.attachmentsService.findAll({sampleId: id});
  }

  /*
  // PATCH /samples/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Attachment),
  )
  @Patch("/:id/attachments/:fk")
  async findOneAttachmentAndUpdate(
    @Param("id") sampleId: string,
    @Param("fk") attachmentId: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    console.log("SampleId: ", sampleId);
    console.log("AttachmentIs: ", attachmentId);
    return this.attachmentsService.findOneAndUpdate(
      { id: attachmentId, sampleId: sampleId },
      updateAttachmentDto,
    );
  }
  */

  // GET /samples/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:id/attachments/:fk")
  @ApiOperation({
    summary: "It returns the attachment related to a specific sample.",
    description:
      "It returns the attachment related to a sample through the sample and attachment ids specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the sample to get attachments related.",
    type: String,
  })
  @ApiParam({
    name: "fk",
    description: "Id of the specific attachment to get.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Attachment,
    description:
      "Return one specific attachment by id(fk) related to specified sample id.",
  })
  async findOneAttachment(
    @Param("id") sampleId: string,
    @Param("fk") attachmentId: string,
  ): Promise<Attachment | null> {
    return this.attachmentsService.findOne({
      id: attachmentId,
      sampleId: sampleId,
    });
  }

  // DELETE /samples/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Attachment),
  )
  @Delete("/:id/attachments/:fk")
  @ApiOperation({
    summary: "It deletes the attachment related to a specific sample.",
    description:
      "It deletes the attachment specified through the id(fk) related to specific sample.",
  })
  @ApiParam({
    name: "id",
    description:
      "Id of the sample that this specific attachment is related with",
    type: String,
  })
  @ApiParam({
    name: "fk",
    description: "Id of the attachment to delete",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "No value is returned",
  })
  async findOneAttachmentAndRemove(
    @Param("id") sampleId: string,
    @Param("fk") attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      sampleId: sampleId,
    });
  }

  // POST /samples/:id/datasets
  /*   @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Dataset))
  @Post("/:id/datasets")
  async createDataset(
    @Param("id") id: string,
    @Body() createRawDatasetDto: CreateRawDatasetDto,
  ): Promise<Dataset> {
    const createDataset = { ...createRawDatasetDto, sampleId: id };
    return this.datasetsService.create(createDataset);
  }
 */

  // GET /samples/:id/datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, DatasetClass),
  )
  @Get("/:id/datasets")
  @ApiOperation({
    summary: "It returns the datasets related to a specific sample.",
    description:
      "It returns the datasets related to a sample through the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the sample to get datasets related.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    isArray: true,
    type: DatasetClass,
    description: "Return all datasets related with sample id specified",
  })
  async findAllDatasets(
    @Param("id") sampleId: string,
  ): Promise<DatasetClass[] | null> {
    const cond = {where: {sampleId: sampleId}};
    return this.datasetsService.findAll(cond);
  }

  // PATCH /samples/:id/datasets/:fk
  /* @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Dataset))
  @Patch("/:id/datasets/:fk")
  async findOneDatasetAndUpdate(
    @Param("id") sampleId: string,
    @Param("fk") datasetId: string,
    @Body() updateRawDatasetDto: UpdateRawDatasetDto,
  ): Promise<Dataset | null> {
    return this.datasetsService.findByIdAndUpdate(
      datasetId,
      updateRawDatasetDto,
    );
  } */

  // DELETE /samples/:id/datasets/:fk
  /*   @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Dataset))
  @Delete("/:id/datasets/:fk")
  async findOneDatasetAndRemove(
    @Param("id") sampleId: string,
    @Param("fk") datasetId: string,
  ): Promise<unknown> {
    return this.datasetsService.findByIdAndDelete(datasetId);
  }
 */
}
