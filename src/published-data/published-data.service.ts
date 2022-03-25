import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { parseLimitFilters } from "src/common/utils";
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

  async findAll(filter: IPublishedDataFilters): Promise<PublishedData[]> {
    const whereFilter: FilterQuery<PublishedDataDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters<PublishedData>(
      filter.limits,
    );

    return this.publishedDataModel
      .find(whereFilter)
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
