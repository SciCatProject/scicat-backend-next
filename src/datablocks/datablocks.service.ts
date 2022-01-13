import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateDatablockDto } from "./dto/create-datablock.dto";
import { UpdateDatablockDto } from "./dto/update-datablock.dto";
import { Datablock, DatablockDocument } from "./schemas/datablock.schema";

@Injectable()
export class DatablocksService {
  constructor(
    @InjectModel(Datablock.name)
    private datablockModel: Model<DatablockDocument>,
  ) {}

  async create(createDatablockDto: CreateDatablockDto): Promise<Datablock> {
    const createdDatablock = new this.datablockModel(createDatablockDto);
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
    return this.datablockModel
      .findOneAndUpdate(filter, updateDatablockDto, {
        new: true,
      })
      .exec();
  }

  async remove(filter: FilterQuery<DatablockDocument>): Promise<unknown> {
    return this.datablockModel.findOneAndRemove(filter).exec();
  }
}
