import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateInstrumentDto } from "./dto/create-instrument.dto";
import { UpdateInstrumentDto } from "./dto/update-instrument.dto";
import { IInstrumentFilters } from "./interfaces/instrument-filters.interface";
import { Instrument, InstrumentDocument } from "./schemas/instrument.schema";

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectModel(Instrument.name)
    private instrumentModel: Model<InstrumentDocument>,
  ) {}

  async create(createInstrumentDto: CreateInstrumentDto): Promise<Instrument> {
    const createdInstrument = new this.instrumentModel(createInstrumentDto);
    return createdInstrument.save();
  }

  async findAll(filter: IInstrumentFilters): Promise<Instrument[]> {
    const whereFilter: FilterQuery<InstrumentDocument> = filter.where ?? {};
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
    return this.instrumentModel
      .find(whereFilter)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async findOne(
    filter: FilterQuery<InstrumentDocument>,
  ): Promise<Instrument | null> {
    return this.instrumentModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<InstrumentDocument>,
    updateInstrumentDto: UpdateInstrumentDto,
  ): Promise<Instrument | null> {
    return this.instrumentModel
      .findOneAndUpdate(filter, updateInstrumentDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<InstrumentDocument>): Promise<unknown> {
    return this.instrumentModel.findOneAndRemove(filter).exec();
  }
}
