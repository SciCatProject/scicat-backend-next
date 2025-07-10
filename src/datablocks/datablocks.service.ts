import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { FilterQuery, Model } from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { IFilters } from "src/common/interfaces/common.interface";
import { CountApiResponse } from "src/common/types";
import {
  addCreatedByFields,
  addUpdatedByField,
  parseLimitFilters,
} from "src/common/utils";
import { CreateDatablockDto } from "./dto/create-datablock.dto";
import { PartialUpdateDatablockDto } from "./dto/update-datablock.dto";
import { Datablock, DatablockDocument } from "./schemas/datablock.schema";

@Injectable()
export class DatablocksService {
  constructor(
    @InjectModel(Datablock.name)
    private datablockModel: Model<DatablockDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createDatablockDto: CreateDatablockDto): Promise<Datablock> {
    const username = (this.request.user as JWTUser).username;
    const createdDatablock = new this.datablockModel(
      addCreatedByFields<CreateDatablockDto>(createDatablockDto, username),
    );
    return createdDatablock.save();
  }

  async findAll(filter: FilterQuery<DatablockDocument>): Promise<Datablock[]> {
    const whereFilter: FilterQuery<DatablockDocument> = filter.where ?? {};
    const fieldsProjection: FilterQuery<DatablockDocument> =
      filter.fields ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    return this.datablockModel
      .find(whereFilter, fieldsProjection)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async findOne(
    filter: FilterQuery<DatablockDocument>,
  ): Promise<Datablock | null> {
    const whereFilter: FilterQuery<DatablockDocument> = filter.where ?? {};
    const fieldsProjection: FilterQuery<DatablockDocument> =
      filter.fields ?? {};
    return this.datablockModel.findOne(whereFilter, fieldsProjection).exec();
  }

  async update(
    filter: FilterQuery<DatablockDocument>,
    updateDatablockDto: PartialUpdateDatablockDto,
  ): Promise<Datablock | null> {
    const username = (this.request.user as JWTUser).username;
    return this.datablockModel
      .findOneAndUpdate(
        filter,
        addUpdatedByField(updateDatablockDto, username),
        {
          new: true,
        },
      )
      .exec();
  }

  async remove(filter: FilterQuery<DatablockDocument>): Promise<unknown> {
    return this.datablockModel.findOneAndDelete(filter).exec();
  }

  async count(filter: IFilters<DatablockDocument>): Promise<CountApiResponse> {
    const whereFilter: FilterQuery<DatablockDocument> = filter.where ?? {};

    const count = await this.datablockModel.countDocuments(whereFilter).exec();

    return { count };
  }
}
