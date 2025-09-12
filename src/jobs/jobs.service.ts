import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import {
  FilterQuery,
  Model,
  PipelineStage,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import {
  IFacets,
  IFilters,
  ILimitsFilter,
} from "src/common/interfaces/common.interface";
import { JobLookupKeysEnum, JOB_LOOKUP_FIELDS } from "./types/job-lookup";
import { parsePipelineProjection } from "src/common/utils";
import {
  addCreatedByFields,
  addUpdatedByField,
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
} from "src/common/utils";
import { UpdateJobDto } from "./dto/update-job.dto";
import {
  PartialOutputJobDto,
  PartialIntermediateOutputJobDto,
} from "./dto/output-job-v4.dto";
import { JobClass, JobDocument } from "./schemas/job.schema";
import { IJobFields } from "./interfaces/job-filters.interface";
import { ConfigService } from "@nestjs/config";
import { DatasetsAccessService } from "../datasets/datasets-access.service";
import { mandatoryFields } from "./types/jobs-filter-content";

@Injectable({ scope: Scope.REQUEST })
export class JobsService {
  constructor(
    private readonly datasetsAccessService: DatasetsAccessService,
    @InjectModel(JobClass.name) private jobModel: Model<JobDocument>,
    @Inject(REQUEST) private request: Request,
    private configService: ConfigService,
  ) {}

  getUsername(): string {
    if (this.request.user as JWTUser) {
      return (this.request.user as JWTUser).username;
    } else {
      return "anonymous";
    }
  }

  async create(createJobDto: JobClass): Promise<JobDocument> {
    const username = this.getUsername();
    const jobData = addCreatedByFields(createJobDto, username);
    const statusCode =
      createJobDto.statusCode ||
      this.configService.get<string>("jobDefaultStatusCode")!;
    const statusMessage =
      createJobDto.statusMessage ||
      this.configService.get<string>("jobDefaultStatusMessage")!;
    const createdJob = new this.jobModel(
      this.addStatusFields(jobData, statusCode, statusMessage),
    );
    return createdJob.save();
  }

  async findByFilters(
    fields: FilterQuery<JobDocument> | undefined,
  ): Promise<JobClass[]> {
    const filters: FilterQuery<JobDocument> =
      createFullqueryFilter<JobDocument>(this.jobModel, "id", fields ?? {});
    return this.jobModel.find(filters).exec();
  }

  applyFilterLimits(
    jobs: PartialOutputJobDto[],
    limits: ILimitsFilter | undefined,
  ): PartialOutputJobDto[] {
    const modifiers: QueryOptions = parseLimitFilters(limits);
    if (modifiers.sort) {
      jobs = jobs.sort((a, b) => {
        for (const [key, order] of Object.entries(modifiers.sort) as [
          keyof PartialOutputJobDto,
          1 | -1,
        ][]) {
          const aValue = a[key];
          const bValue = b[key];
          if (aValue === undefined || bValue === undefined) continue;
          if (aValue < bValue) return order === 1 ? -1 : 1;
          if (aValue > bValue) return order === 1 ? 1 : -1;
        }
        return 0;
      });
    }
    if (modifiers.skip) {
      jobs = jobs.slice(modifiers.skip);
    }
    if (modifiers.limit) {
      jobs = jobs.slice(0, modifiers.limit);
    }
    return jobs;
  }

  addLookupFields(
    pipeline: PipelineStage[],
    jobLookupFields?: JobLookupKeysEnum[],
  ) {
    let nested = false;
    if (jobLookupFields?.includes(JobLookupKeysEnum.all)) {
      jobLookupFields = Object.keys(JOB_LOOKUP_FIELDS).filter(
        // exclude all itself and datsetDetails
        (field) =>
          field !== JobLookupKeysEnum.all &&
          field !== JobLookupKeysEnum.datasetDetails,
      ) as JobLookupKeysEnum[];
    } else if (jobLookupFields?.includes(JobLookupKeysEnum.datasetDetails)) {
      nested = true;
    }

    jobLookupFields?.forEach((field) => {
      const fieldValue = structuredClone(JOB_LOOKUP_FIELDS[field]);

      if (fieldValue) {
        for (const stage of fieldValue) {
          if ("$lookup" in stage && stage.$lookup) {
            stage.$lookup.as = field;
            stage.$lookup.pipeline = stage.$lookup.pipeline || [];
            this.datasetsAccessService.addDatasetAccess(stage);

            // adds lookup logic based on jobLookupFields
            if (nested) {
              for (const nestedLookup of stage.$lookup.pipeline) {
                if ("$lookup" in nestedLookup && nestedLookup.$lookup) {
                  this.datasetsAccessService.addRelationFieldAccess(
                    nestedLookup as PipelineStage.Lookup,
                  );
                }
              }
            }
          }
          pipeline.push(stage);
        }
      }
    });
  }

  async findJobComplete(
    filter: FilterQuery<JobDocument>,
  ): Promise<PartialIntermediateOutputJobDto[]> {
    const whereFilter = filter.where ?? {};
    let fieldsProjection: string[] | undefined;

    if (filter.fields && filter.fields.length > 0) {
      fieldsProjection = [
        ...filter.fields,
        ...mandatoryFields.filter((f) => !filter.fields.includes(f)),
      ];
    } else {
      fieldsProjection = undefined;
    }

    const pipeline: PipelineStage[] = [{ $match: whereFilter }];

    this.addLookupFields(pipeline, filter.include);
    // fields in datasets relation

    if (fieldsProjection && fieldsProjection.length > 0) {
      const projectionFields = [...fieldsProjection];
      const projection = parsePipelineProjection(projectionFields);
      pipeline.push({ $project: projection });
    } else {
      // remove field datasetIds
      pipeline.push({
        $project: {
          datasetIds: 0,
        },
      });
    }
    const data = await this.jobModel
      .aggregate<PartialIntermediateOutputJobDto>(pipeline)
      .exec();

    return data || null;
  }

  async findAll(
    filter: IFilters<JobDocument, FilterQuery<JobDocument>>,
  ): Promise<JobClass[]> {
    const whereFilters: FilterQuery<JobDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    return this.jobModel
      .find(whereFilters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(
    filter: IFilters<JobDocument, FilterQuery<JobDocument>>,
  ): Promise<JobClass[] | null> {
    const filterQuery: FilterQuery<JobDocument> =
      createFullqueryFilter<JobDocument>(this.jobModel, "id", filter.fields);
    const modifiers: QueryOptions = parseLimitFilters(filter.limits);

    return await this.jobModel.find(filterQuery, null, modifiers).exec();
  }

  async fullfacet(
    filters: IFacets<IJobFields>,
  ): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];

    const pipeline: PipelineStage[] = createFullfacetPipeline<
      JobDocument,
      IJobFields
    >(this.jobModel, "id", fields, facets);

    return await this.jobModel.aggregate(pipeline).exec();
  }

  async findOne(filter: FilterQuery<JobDocument>): Promise<JobClass | null> {
    return this.jobModel.findOne(filter).exec();
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
  ): Promise<JobClass | null> {
    const existingJob = await this.jobModel.findOne({ id: id }).exec();
    if (!existingJob) {
      throw new NotFoundException(`Job #${id} not found`);
    }

    let jobParams = existingJob.jobParams;
    let newJobResultObject = updateJobDto.jobResultObject;
    // extract executionTime from jobResultObject and move it to jobParams
    if (newJobResultObject?.executionTime) {
      const { executionTime, ...jobResultObject } = newJobResultObject;
      jobParams = {
        ...jobParams,
        executionTime: executionTime as Date,
      };
      newJobResultObject = jobResultObject;
    }

    const username = this.getUsername();
    const updatedJob = await this.jobModel
      .findOneAndUpdate(
        { id: id },
        this.updateJobFields(
          addUpdatedByField(updateJobDto as UpdateQuery<JobDocument>, username),
          updateJobDto.statusCode,
          updateJobDto.statusMessage,
          newJobResultObject,
          jobParams,
        ),
        { new: true },
      )
      .exec();

    return updatedJob;
  }

  async remove(filter: FilterQuery<JobDocument>): Promise<JobClass | null> {
    return this.jobModel.findOneAndDelete(filter).exec();
  }

  private addStatusFields = <T>(
    obj: T,
    statusCode: string,
    statusMessage: string,
  ): T & {
    statusCode: string;
    statusMessage: string;
  } => {
    return {
      ...obj,
      statusCode: statusCode,
      statusMessage: statusMessage,
    };
  };

  private updateJobFields = <T>(
    obj: T,
    statusCode: string,
    statusMessage: string,
    jobResultObject: Record<string, unknown> | undefined,
    jobParams?: Record<string, unknown> | undefined,
  ): T & {
    statusCode: string;
    statusMessage: string;
    jobResultObject: Record<string, unknown> | undefined;
    jobParams?: Record<string, unknown> | undefined;
  } => {
    return {
      ...obj,
      statusCode: statusCode,
      statusMessage: statusMessage,
      jobResultObject: jobResultObject,
      jobParams: jobParams,
    };
  };
}
