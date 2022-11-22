import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { FilterQuery, Model } from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import {
  addCreatedFields,
  addUpdatedFields,
  parseLimitFilters,
} from "src/common/utils";
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

@Injectable({ scope: Scope.REQUEST })
export class PublishedDataService {
  constructor(
    @Inject(REQUEST)
    private request: Request,
    @InjectModel(PublishedData.name)
    private publishedDataModel: Model<PublishedDataDocument>,
  ) {}

  async create(
    createPublishedDataDto: CreatePublishedDataDto,
  ): Promise<PublishedData> {
    const username = (this.request?.user as JWTUser).username;
    const ts = new Date();
    const createdPublishedData = new this.publishedDataModel(
      addCreatedFields(createPublishedDataDto, username, ts),
    );
    return createdPublishedData.save();
  }

  async findAll(filter: IPublishedDataFilters): Promise<PublishedData[]> {
    const whereFilter: FilterQuery<PublishedDataDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

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
    const username = (this.request?.user as JWTUser).username;
    const ts = new Date();
    const updatePublishedData = addUpdatedFields(
      updatePublishedDataDto,
      username,
      ts,
    );
    return this.publishedDataModel
      .findOneAndUpdate(filter, updatePublishedData, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<PublishedDataDocument>): Promise<unknown> {
    return this.publishedDataModel.findOneAndRemove(filter).exec();
  }
}
