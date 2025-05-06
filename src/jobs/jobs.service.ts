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
import {
  addCreatedByFields,
  addUpdatedByField,
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
} from "src/common/utils";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { JobClass, JobDocument } from "./schemas/job.schema";
import { IJobFields } from "./interfaces/job-filters.interface";

@Injectable({ scope: Scope.REQUEST })
export class JobsService {
  constructor(
    @InjectModel(JobClass.name) private jobModel: Model<JobDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}

  getUsername(): string {
    if (this.request.user as JWTUser) {
      return (this.request.user as JWTUser).username;
    } else {
      return "anonymous";
    }
  }

  async create(createJobDto: CreateJobDto): Promise<JobDocument> {
    const username = this.getUsername();
    const createdJob = new this.jobModel(
      this.addStatusFields(
        addCreatedByFields(createJobDto, username),
        "jobCreated",
        "Job has been created.",
      ),
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
    jobs: JobClass[],
    limits: ILimitsFilter | undefined,
  ): JobClass[] {
    const modifiers: QueryOptions = parseLimitFilters(limits);
    if (modifiers.sort) {
      jobs = jobs.sort((a, b) => {
        for (const [key, order] of Object.entries(modifiers.sort) as [
          keyof JobClass,
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
