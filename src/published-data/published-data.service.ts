import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreatePublishedDataDto } from "./dto/create-published-data.dto";
import { UpdatePublishedDataDto } from "./dto/update-published-data.dto";
import {
  ICount,
  IPublishedDataFilters,
} from "./interfaces/published-data.interface";
import {
  PublishedData,
  PublishedDataDocument,
} from "./schemas/published-data.schema";

@Injectable()
export class PublishedDataService {
  constructor(
    @InjectModel(PublishedData.name)
    private publishedDataModel: Model<PublishedDataDocument>,
  ) {}

  async create(
    createPublishedDataDto: CreatePublishedDataDto,
  ): Promise<PublishedData> {
    const createdPublishedData = new this.publishedDataModel(
      createPublishedDataDto,
    );
    return createdPublishedData.save();
  }

  async findAll(filters: IPublishedDataFilters): Promise<PublishedData[]> {
    const whereFilters: FilterQuery<PublishedDataDocument> =
      filters.where ?? {};
    let limit = 100;
    let skip = 0;
    let sort = {};
    if (filters.limits) {
      if (filters.limits.limit) {
        limit = filters.limits.limit;
      }
      if (filters.limits.skip) {
        skip = filters.limits.skip;
      }
      if (filters.limits.order) {
        const [field, direction] = filters.limits.order.split(":");
        sort = { [field]: direction };
      }
    }
    return this.publishedDataModel
      .find(whereFilters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async count(filter: FilterQuery<PublishedDataDocument>): Promise<ICount> {
    const count = await this.publishedDataModel.count(filter).exec();
    return { count };
  }

  async findOne(
    filter: FilterQuery<PublishedDataDocument>,
  ): Promise<PublishedData | null> {
    return this.publishedDataModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<PublishedDataDocument>,
    updatePublishedDataDto: UpdatePublishedDataDto,
  ): Promise<PublishedData | null> {
    return this.publishedDataModel
      .findOneAndUpdate(filter, updatePublishedDataDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<PublishedDataDocument>): Promise<unknown> {
    return this.publishedDataModel.findOneAndRemove(filter).exec();
  }
}
