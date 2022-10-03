import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateOrigdatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigdatablockDto } from "./dto/update-origdatablock.dto";
import {
  OrigDatablock,
  OrigDatablockDocument,
} from "./schemas/origdatablock.schema";

@Injectable()
export class OrigDatablocksService {
  constructor(
    @InjectModel(OrigDatablock.name)
    private origDatablockModel: Model<OrigDatablockDocument>,
  ) {}

  async create(
    createOrigdatablockDto: CreateOrigdatablockDto,
  ): Promise<OrigDatablock> {
    const createdOrigDatablock = new this.origDatablockModel(
      createOrigdatablockDto,
    );
    return createdOrigDatablock.save();
  }

  async findAll(
    filter: FilterQuery<OrigDatablockDocument>,
  ): Promise<OrigDatablock[]> {
    return this.origDatablockModel.find(filter).exec();
  }

  async findOne(
    filter: FilterQuery<OrigDatablockDocument>,
  ): Promise<OrigDatablock | null> {
    return this.origDatablockModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<OrigDatablockDocument>,
    updateOrigdatablockDto: UpdateOrigdatablockDto,
  ): Promise<OrigDatablock | null> {
    return this.origDatablockModel
      .findOneAndUpdate(filter, updateOrigdatablockDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<OrigDatablockDocument>): Promise<unknown> {
    return this.origDatablockModel.findOneAndRemove(filter).exec();
  }
}
