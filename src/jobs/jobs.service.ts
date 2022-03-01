import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { IJobFilters, JobField } from "./interfaces/job-filters.interface";
import { Job, JobDocument } from "./schemas/job.schema";

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const createdJob = new this.jobModel(createJobDto);
    return createdJob.save();
  }

  async findAll(filter: IJobFilters): Promise<Job[]> {
    const whereFilters: FilterQuery<JobDocument> = filter.where ?? {};
    let limit = 100;
    let skip = 0;
    let sort = {};
    if (filter.limits) {
      if (filter.limits.limit) {
        limit = filter.limits.limit;
      }
      if (filter.limits.skip) {
        skip = filter.limits.skip;
      }
      if (filter.limits.order) {
        const [field, direction] = filter.limits.order.split(":");
        sort = { [field]: direction };
      }
    }
    return this.jobModel
      .find(whereFilters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(filters: IJobFilters): Promise<Job[]> {
    const modifiers: QueryOptions = {
      limit: 100,
    };
    const filterQuery: FilterQuery<JobDocument> = {};

    if (filters) {
      if (filters.limits) {
        if (filters.limits.limit) {
          modifiers.limit = filters.limits.limit;
        }
        if (filters.limits.skip) {
          modifiers.skip = filters.limits.skip;
        }
        if (filters.limits.order) {
          const [field, direction] = filters.limits.order.split(":");
          const sort = { [field]: direction };
          modifiers.sort = sort;
        }
      }

      if (filters.fields) {
        const fields = filters.fields;
        Object.keys(fields).forEach((key) => {
          if (key === JobField.Text) {
            const text = fields[key];
            if (text) {
              filterQuery.$text = { $search: text };
            }
          } else if (key === JobField.CreationTime) {
            const { begin, end } = fields.creationTime;
            filterQuery.creationTime = {
              $gte: new Date(begin),
              $lte: new Date(end),
            };
          } else {
            filterQuery[key] = fields[key];
          }
        });
      }
    }

    return await this.jobModel.find(filterQuery, null, modifiers).exec();
  }

  async findOne(filter: FilterQuery<JobDocument>): Promise<Job | null> {
    return this.jobModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<JobDocument>,
    updateJobDto: UpdateJobDto,
  ): Promise<Job | null> {
    return this.jobModel
      .findOneAndUpdate(filter, updateJobDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<JobDocument>): Promise<unknown> {
    return this.jobModel.findOneAndRemove(filter).exec();
  }
}
