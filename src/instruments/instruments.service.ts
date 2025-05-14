import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage } from "mongoose";
import { IFilters, IFiltersV4 } from "src/common/interfaces/common.interface";
import { CountApiResponse, DataCountOutputDto } from "src/common/types";
import {
  buildDataCountFacetPipeline,
  getDefaultDataCountProject,
  parseLimitFilters,
} from "src/common/utils";
import { CreateInstrumentDto } from "./dto/create-instrument.dto";
import { PartialUpdateInstrumentDto } from "./dto/update-instrument.dto";
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

  async findAll(filter: IFilters<InstrumentDocument>): Promise<Instrument[]> {
    const whereFilter: FilterQuery<InstrumentDocument> = filter.where ?? {};
    const fieldsProjection: FilterQuery<InstrumentDocument> =
      filter.fields ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    const instrumentPromise = this.instrumentModel
      .find(whereFilter, fieldsProjection)
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const instruments = await instrumentPromise.exec();

    return instruments;
  }

  async findAllComplete(
    filter: IFiltersV4<InstrumentDocument>,
  ): Promise<DataCountOutputDto<Instrument>> {
    const $match: PipelineStage.Match = { $match: filter.where ?? {} };

    const $facet = buildDataCountFacetPipeline(filter.limits, filter.fields);

    const $project = getDefaultDataCountProject();

    const pipeline: PipelineStage[] = [$match, $facet, $project];

    const [result] = await this.instrumentModel
      .aggregate<DataCountOutputDto<Instrument>>(pipeline)
      .exec();

    return { data: result.data, totalCount: result.totalCount || 0 };
  }
  async count(filter: IFilters<InstrumentDocument>): Promise<CountApiResponse> {
    const whereFilter: FilterQuery<InstrumentDocument> = filter.where ?? {};

    const count = await this.instrumentModel.countDocuments(whereFilter).exec();

    return { count };
  }

  async findOne(
    filter: FilterQuery<InstrumentDocument>,
  ): Promise<Instrument | null> {
    const whereFilter: FilterQuery<InstrumentDocument> = filter.where ?? {};
    const fieldsProjection: FilterQuery<InstrumentDocument> =
      filter.fields ?? {};

    return this.instrumentModel.findOne(whereFilter, fieldsProjection).exec();
  }

  async update(
    filter: FilterQuery<InstrumentDocument>,
    updateInstrumentDto: PartialUpdateInstrumentDto,
  ): Promise<Instrument | null> {
    return this.instrumentModel
      .findOneAndUpdate(filter, updateInstrumentDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<InstrumentDocument>): Promise<unknown> {
    return this.instrumentModel.findOneAndDelete(filter).exec();
  }
}
