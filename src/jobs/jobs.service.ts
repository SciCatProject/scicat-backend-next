import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { FilterQuery, Model, PipelineStage, QueryOptions, UpdateQuery } from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  addCreatedByFields,
  addUpdatedByField,
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
} from "src/common/utils";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobStatusDto } from "./dto/update-jobstatus.dto";
import { JobClass, JobDocument } from "./schemas/job.schema";

@Injectable({ scope: Scope.REQUEST })
export class JobsService {
  constructor(
    @InjectModel(JobClass.name) private jobModel: Model<JobDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<JobDocument> {
    const username = (this.request.user as JWTUser).username;
    const createdJob = new this.jobModel(
      addCreatedByFields(createJobDto, username),
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
  ): Promise<Record<string, unknown>[]> {
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

  async statusUpdate(updateJobStatusDto: UpdateJobStatusDto): Promise<JobClass | null> {
    const id = updateJobStatusDto.id;
    const existingJob = await this.jobModel.findOne({ pid: id }).exec();
    if (!existingJob) {
      throw new NotFoundException(`Job #${id} not found`);
    }

    const username = (this.request.user as JWTUser).username;

    const updatedJob = await this.jobModel
      .findOneAndUpdate(
        { pid: id },
        addUpdatedByField(
          updateJobStatusDto as UpdateQuery<JobDocument>,
          username,
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
