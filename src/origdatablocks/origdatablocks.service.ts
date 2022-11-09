import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import { IFilters } from "src/common/interfaces/common.interface";
import { createFullqueryFilter, parseLimitFilters } from "src/common/utils";
import { CreateOrigDatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigDatablockDto } from "./dto/update-origdatablock.dto";
import { IOrigDatablockFields } from "./interfaces/origdatablocks.interface";
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
    createOrigdatablockDto: CreateOrigDatablockDto,
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

  async fullquery(
    filter: IFilters<OrigDatablockDocument, IOrigDatablockFields>,
  ): Promise<OrigDatablock[] | null> {
    const filterQuery: FilterQuery<OrigDatablockDocument> =
      createFullqueryFilter<OrigDatablockDocument>(
        this.origDatablockModel,
        "_id",
        filter.fields as FilterQuery<OrigDatablockDocument>,
      );
    const modifiers: QueryOptions = parseLimitFilters(filter.limits);

    const origDatablocks = await this.origDatablockModel
      .find(filterQuery, null, modifiers)
      .exec();

    return origDatablocks;
  }

  async update(
    filter: FilterQuery<OrigDatablockDocument>,
    updateOrigdatablockDto: UpdateOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    return this.origDatablockModel
      .findOneAndUpdate(filter, updateOrigdatablockDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<OrigDatablockDocument>): Promise<unknown> {
    return this.origDatablockModel.findOneAndRemove(filter).exec();
  }
}
