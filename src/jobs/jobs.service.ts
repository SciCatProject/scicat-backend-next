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
  addConfigVersionField,
  addUpdatedByField,
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
} from "src/common/utils";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateStatusJobDto } from "./dto/status-update-job.dto";
import { JobClass, JobDocument } from "./schemas/job.schema";

@Injectable({ scope: Scope.REQUEST })
export class JobsService {
  constructor(
    @InjectModel(JobClass.name) private jobModel: Model<JobDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(
    createJobDto: CreateJobDto,
    configVersion: string,
  ): Promise<JobDocument> {
    let username;
    if (this.request.user as JWTUser){
      username = (this.request.user as JWTUser).username;
    }else{
      const anonymousUser: JWTUser = {
        _id: "",
        username: "anonymous",
        email: "",
        currentGroups: []
      };
      username = anonymousUser.username;
    }
    //const username = (this.request.user as JWTUser).username;
    const createdJob = new this.jobModel(
      addStatusFields(
        addConfigVersionField(
          addCreatedByFields(createJobDto, username),
          configVersion,
        ),
        "Job has been created.",
        "jobCreated",
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
    const jobFound = await this.jobModel.findOne(filter).exec();
    if (jobFound){
      const job = new JobClass();
      job.createdBy = jobFound.createdBy;
      job.updatedBy = jobFound.updatedBy;
      job.createdAt = jobFound.createdAt;
      job.updatedAt = jobFound.updatedAt;
      job.ownerGroup = jobFound.ownerGroup;
      job.accessGroups = jobFound.accessGroups;
      job.id = jobFound.id;
      job._id = jobFound._id;
      job.ownerUser = jobFound.ownerUser;
      job.type = jobFound.type;
      job.statusCode = jobFound.statusCode;
      job.statusMessage = jobFound.statusMessage;
      job.configVersion = jobFound.configVersion;
      job.messageSent = jobFound.messageSent;
      job.jobParams = jobFound.jobParams;
      job.datasetsValidation = jobFound.datasetsValidation;
      job.contactEmail = jobFound.contactEmail;
      job.configuration = jobFound.configuration;
      return job
    }
    return jobFound
  }

  async statusUpdate(
    id: string,
    updateJobDto: UpdateStatusJobDto,
  ): Promise<JobClass | null> {
    const existingJob = await this.jobModel.findOne({ id: id }).exec();
    if (!existingJob) {
      throw new NotFoundException(`Job #${id} not found`);
    }
    const username = (this.request.user as JWTUser).username;

    const updatedJob = await this.jobModel
      .findOneAndUpdate(
        { id: id },
        addStatusFields(
          addUpdatedByField(updateJobDto as UpdateQuery<JobDocument>, username),
          updateJobDto.statusCode,
          updateJobDto.statusMessage!,
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
