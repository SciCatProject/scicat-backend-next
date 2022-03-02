import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import {
  IJobFacets,
  IJobFilters,
  JobField,
} from "./interfaces/job-filters.interface";
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

  async fullfacet(filters: IJobFacets): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];
    const pipeline = [];
    const facetMatch: Record<string, unknown> = {};
    const allMatch = [];

    Object.keys(fields).forEach((key) => {
      if (facets.indexOf(key) < 0) {
        if (key === JobField.Text) {
          if (typeof fields[key] === "string") {
            const match = {
              $match: {
                $or: [
                  {
                    $text: this.searchExpression(key, fields[key]),
                  },
                ],
              },
            };
            pipeline.unshift(match);
          }
        } else if (key === JobField.Id) {
          const match = {
            $match: {
              id: this.searchExpression(key, fields[key]),
            },
          };
          allMatch.push(match);
          pipeline.push(match);
        } else {
          const match: Record<string, unknown> = {};
          match[key] = this.searchExpression(key, fields[key]);
          const m = {
            $match: match,
          };
          allMatch.push(m);
          pipeline.push(m);
        }
      } else {
        facetMatch[key] = this.searchExpression(key, fields[key]);
      }
    });

    const facetObject: Record<string, unknown> = {};
    facets.forEach((facet) => {
      if (facet in this.jobModel.schema.paths) {
        facetObject[facet] = this.createNewFacetPipeline(
          facet,
          this.schemaTypeOf(facet),
          facetMatch,
        );
        return;
      } else {
        Logger.warn(
          `Warning: Facet not part of any model: ${facet}`,
          "JobsService",
        );
      }
    });

    facetObject["all"] = [
      {
        $match: facetMatch,
      },
      {
        $count: "totalSets",
      },
    ];
    pipeline.push({ $facet: facetObject });

    const results = await this.jobModel
      .aggregate(pipeline as PipelineStage[])
      .exec();
    return results;
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

  private searchExpression(fieldName: string, value: unknown): unknown {
    if (fieldName === JobField.Text) {
      return { $search: value };
    }

    const valueType = this.schemaTypeOf(fieldName, value);

    if (valueType === "String") {
      if (Array.isArray(value)) {
        if (value.length === 1) {
          return value[0];
        } else {
          return { $in: value };
        }
      } else {
        return value;
      }
    } else if (valueType === "Date") {
      return {
        $gte: new Date((value as Record<string, string | Date>).begin),
        $lte: new Date((value as Record<string, string | Date>).end),
      };
    } else if (valueType === "Boolean") {
      return { $eq: value };
    } else if (Array.isArray(value)) {
      return { $in: value };
    } else {
      return value;
    }
  }

  private createNewFacetPipeline(
    name: string,
    type: string,
    query: Record<string, unknown>,
  ) {
    const pipeline = [];

    if (type === "Array") {
      pipeline.push({ $unwind: "$" + name });
    }

    if (query && Object.keys(query).length > 0) {
      const queryCopy = { ...query };
      delete queryCopy[name];

      if (Object.keys(queryCopy).length > 0) {
        pipeline.push({ $match: queryCopy });
      }
    }

    const group: {
      $group: {
        _id: string | Record<string, unknown>;
        count: Record<string, number>;
      };
    } = {
      $group: {
        _id: "$" + name,
        count: {
          $sum: 1,
        },
      },
    };

    if (type === "Date") {
      group.$group._id = {
        year: {
          $year: "$" + name,
        },
        month: {
          $month: "$" + name,
        },
        day: {
          $dayOfMonth: "$" + name,
        },
      };
    }
    pipeline.push(group);

    const sort = {
      $sort: {
        _id: -1,
      },
    };
    pipeline.push(sort);

    return pipeline;
  }

  private schemaTypeOf(key: string, value: unknown = null): string {
    const property = this.jobModel.schema.path(key);

    if (!property) {
      if ("begin" in (value as Record<string, unknown>)) {
        return "Date";
      }
      return "String";
    }

    return property.instance;
  }
}
