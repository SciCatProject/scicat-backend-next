import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { Job, JobDocument } from "./schemas/job.schema";

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const createdJob = new this.jobModel(createJobDto);
    return createdJob.save();
  }

  async findAll(filter: FilterQuery<JobDocument>): Promise<Job[]> {
    return this.jobModel.find(filter).exec();
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
