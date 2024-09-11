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
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  addStatusFields,
  addCreatedByFields,
  addUpdatedByField,
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
} from "src/common/utils";
import { CreateJobDto } from "./dto/create-job.dto";
import { StatusUpdateJobDto } from "./dto/status-update-job.dto";
import { JobClass, JobDocument } from "./schemas/job.schema";

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
      addStatusFields(
        addCreatedByFields(createJobDto, username),
        "jobCreated",
        "Job has been created.",
        {},
      ),
    );
    return createdJob.save();
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
    filters: IFacets<FilterQuery<JobDocument>>,
  ): Promise<JobClass[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];

    const pipeline: PipelineStage[] = createFullfacetPipeline<
      JobDocument,
      FilterQuery<JobDocument>
    >(this.jobModel, "id", fields, facets);

    return await this.jobModel.aggregate(pipeline).exec();
  }

  async findOne(filter: FilterQuery<JobDocument>): Promise<JobClass | null> {
    return this.jobModel.findOne(filter).exec();
  }

  async statusUpdate(
    id: string,
    statusUpdateJobDto: StatusUpdateJobDto,
  ): Promise<JobClass | null> {
    const existingJob = await this.jobModel.findOne({ id: id }).exec();
    if (!existingJob) {
      throw new NotFoundException(`Job #${id} not found`);
    }

    const username = this.getUsername();
    const updatedJob = await this.jobModel
      .findOneAndUpdate(
        { id: id },
        addStatusFields(
          addUpdatedByField(
            statusUpdateJobDto as UpdateQuery<JobDocument>,
            username,
          ),
          statusUpdateJobDto.statusCode,
          statusUpdateJobDto.statusMessage,
          statusUpdateJobDto.jobResultObject,
        ),
        { new: true },
      )
      .exec();

    return updatedJob;
  }

  async remove(filter: FilterQuery<JobDocument>): Promise<JobClass | null> {
    return this.jobModel.findOneAndDelete(filter).exec();
  }
}
