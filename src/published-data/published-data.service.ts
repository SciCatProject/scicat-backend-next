import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import {
  parseLimitFilters,
  addCreatedByFields,
  addUpdatedByField,
  createFullqueryFilter,
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
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";

@Injectable({ scope: Scope.REQUEST })
export class PublishedDataService {
  constructor(
    @InjectModel(PublishedData.name)
    private publishedDataModel: Model<PublishedDataDocument>,
    @Inject(REQUEST)
    private request: Request,
  ) {}

  async create(
    createPublishedDataDto: CreatePublishedDataDto,
  ): Promise<PublishedData> {
    const username = (this.request.user as JWTUser).username;
    const createdPublished = new this.publishedDataModel(
      addCreatedByFields<CreatePublishedDataDto>(
        createPublishedDataDto,
        username,
      ),
    );
    return createdPublished.save();
  }

  async findAll(filter: IPublishedDataFilters): Promise<PublishedData[]> {
    const whereFilter: FilterQuery<PublishedDataDocument> = filter.where ?? {};
    const fields = filter.fields ?? {};
    const filterQuery: FilterQuery<PublishedDataDocument> =
      createFullqueryFilter<PublishedDataDocument>(
        this.publishedDataModel,
        "doi",
        fields,
      );
    const whereClause: FilterQuery<PublishedDataDocument> = {
      ...filterQuery,
      ...whereFilter,
    };
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    return this.publishedDataModel
      .find(whereClause)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async countDocuments(
    filter: FilterQuery<PublishedDataDocument>,
    options?: object,
  ): Promise<ICount> {
    const count = await this.publishedDataModel
      .countDocuments(filter, options)
      .exec();
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
    const username = (this.request.user as JWTUser).username;
    return this.publishedDataModel
      .findOneAndUpdate(
        filter,
        addUpdatedByField(updatePublishedDataDto, username),
        {
          new: true,
        },
      )
      .exec();
  }

  async remove(filter: FilterQuery<PublishedDataDocument>): Promise<unknown> {
    return this.publishedDataModel.findOneAndDelete(filter).exec();
  }
}
