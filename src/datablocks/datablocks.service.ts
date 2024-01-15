import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { addCreatedByFields, addUpdatedByField } from "src/common/utils";
import { CreateDatablockDto } from "./dto/create-datablock.dto";
import { UpdateDatablockDto } from "./dto/update-datablock.dto";
import { Datablock, DatablockDocument } from "./schemas/datablock.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";

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
    return this.datablockModel.find(filter).exec();
  }

  async findOne(
    filter: FilterQuery<DatablockDocument>,
  ): Promise<Datablock | null> {
    return this.datablockModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<DatablockDocument>,
    updateDatablockDto: UpdateDatablockDto,
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
}
