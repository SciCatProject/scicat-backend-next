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
import { SamplesService } from "./samples.service";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Sample } from "./schemas/sample.schema";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { AttachmentsService } from "src/attachments/attachments.service";
import { UpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";
import { Dataset } from "src/datasets/schemas/dataset.schema";
import { DatasetsService } from "src/datasets/datasets.service";
import { CreateRawDatasetDto } from "src/datasets/dto/create-raw-dataset.dto";
import { UpdateRawDatasetDto } from "src/datasets/dto/update-raw-dataset.dto";
import { ISampleFilters } from "./interfaces/sample-filters.interface";

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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Sample))
  @Post()
  async create(@Body() createSampleDto: CreateSampleDto): Promise<Sample> {
    return this.samplesService.create(createSampleDto);
  }

  // GET /samples
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get()
  @ApiQuery({
    name: "filters",
    description: "Database filters to apply when retrieve all samples",
    required: false,
  })
  async findAll(@Query("filters") filters?: string): Promise<Sample[]> {
    console.log({ filters });
    const sampleFilters: ISampleFilters = JSON.parse(filters ?? "{}");
    return this.samplesService.findAll(sampleFilters);
  }

  // GET /samples/fullquery
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get("/fullquery")
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<Sample[]> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.samplesService.fullquery(parsedFilters);
  }

  // GET /samples/metadataKeys
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get("/metadataKeys")
  async metadataKeys(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<string[]> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.samplesService.metadataKeys(parsedFilters);
  }

  // GET /samples/findOne
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get("/findOne")
  async findOne(@Query("filter") filters?: string): Promise<Sample | null> {
    const jsonFilters: ISampleFilters = filters ? JSON.parse(filters) : {};
    const whereFilters = jsonFilters.where ?? {};
    const sample = await this.samplesService.findOne(whereFilters);

    if (sample) {
      const includeFilters = jsonFilters.include ?? [];
      await Promise.all(
        includeFilters.map(async ({ relation }) => {
          switch (relation) {
            case "attachments": {
              sample.attachments = await this.attachmentsService.findAll({
                sampleId: sample.sampleId,
              });
              break;
            }
            case "datasets": {
              const datasets = await this.datasetsService.findAll({
                where: { sampleId: sample.sampleId },
              });
              if (datasets) {
                sample.datasets = datasets;
              }
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get("/:id")
  async findById(@Param("id") id: string): Promise<Sample | null> {
    return this.samplesService.findOne({ sampleId: id });
  }

  // PATCH /samples/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Sample))
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updateSampleDto: UpdateSampleDto,
  ): Promise<Sample | null> {
    return this.samplesService.update({ sampleId: id }, updateSampleDto);
  }

  // DELETE /samples/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Sample))
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.samplesService.remove({ sampleId: id });
  }

  // POST /samples/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Attachment),
  )
  @Post("/:id/attachments")
  async createAttachments(
    @Param("id") id: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment> {
    const createAttachment = { ...createAttachmentDto, sampleId: id };
    return this.attachmentsService.create(createAttachment);
  }

  // GET /samples/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:id/attachments")
  async findAllAttachments(@Param("id") id: string): Promise<Attachment[]> {
    return this.attachmentsService.findAll({ sampleId: id });
  }

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
    return this.attachmentsService.findOneAndUpdate(
      { _id: attachmentId, sampleId },
      updateAttachmentDto,
    );
  }

  // DELETE /samples/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Attachment),
  )
  @Delete("/:id/attachments/:fk")
  async findOneAttachmentAndRemove(
    @Param("id") sampleId: string,
    @Param("fk") attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      sampleId,
    });
  }

  // POST /samples/:id/datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Dataset))
  @Post("/:id/datasets")
  async createDataset(
    @Param("id") id: string,
    @Body() createRawDatasetDto: CreateRawDatasetDto,
  ): Promise<Dataset> {
    const createDataset = { ...createRawDatasetDto, sampleId: id };
    return this.datasetsService.create(createDataset);
  }

  // GET /samples/:id/datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Dataset))
  @Get("/:id/datasets")
  async findAllDatasets(
    @Param("id") sampleId: string,
  ): Promise<Dataset[] | null> {
    return this.datasetsService.findAll({ where: { sampleId } });
  }

  // PATCH /samples/:id/datasets/:fk
  @UseGuards(PoliciesGuard)
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
  }

  // DELETE /samples/:id/datasets/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Dataset))
  @Delete("/:id/datasets/:fk")
  async findOneDatasetAndRemove(
    @Param("id") sampleId: string,
    @Param("fk") datasetId: string,
  ): Promise<unknown> {
    return this.datasetsService.findByIdAndDelete(datasetId);
  }
}
