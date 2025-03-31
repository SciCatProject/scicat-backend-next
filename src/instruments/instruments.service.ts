import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage } from "mongoose";
import {
  CompleteResponse,
  IFilters,
  IFiltersNew,
  ILimitsFilter,
} from "src/common/interfaces/common.interface";
import { CountApiResponse } from "src/common/types";
import { parseLimitFilters, parsePipelineProjection } from "src/common/utils";
import { CreateInstrumentDto } from "./dto/create-instrument.dto";
import { PartialUpdateInstrumentDto } from "./dto/update-instrument.dto";
import { Instrument, InstrumentDocument } from "./schemas/instrument.schema";
import { parsePipelineSort } from "src/common/utils";

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

  buildFacetPipeline(
    limits: ILimitsFilter | undefined,
    fields: string[] | undefined,
  ) {
    const { limit, skip, sort } = parseLimitFilters(limits);

    const facet: PipelineStage.Facet = {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        count: [{ $count: "totalCount" }],
      },
    };

    if (sort && typeof sort === "object") {
      const sortParsed = parsePipelineSort(sort);

      facet.$facet.data.push({ $sort: sortParsed });
    }

    if (fields) {
      const project: PipelineStage.Project["$project"] =
        parsePipelineProjection(fields);

      facet.$facet.data.push({ $project: project });
    }

    return facet;
  }

  async findAllComplete(
    filter: IFiltersNew<InstrumentDocument>,
  ): Promise<CompleteResponse<Instrument>> {
    const whereFilter: FilterQuery<InstrumentDocument> = filter.where ?? {};

    const $match: PipelineStage.Match = { $match: whereFilter };

    const $facet = this.buildFacetPipeline(filter.limits, filter.fields);
    const $project = {
      $project: {
        data: 1,
        totalCount: { $arrayElemAt: ["$count.totalCount", 0] },
      },
    };

    const pipeline: PipelineStage[] = [$match, $facet, $project];

    const [result] = await this.instrumentModel.aggregate(pipeline).exec();

    return result;
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
