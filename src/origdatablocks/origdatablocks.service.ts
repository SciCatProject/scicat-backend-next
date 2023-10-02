import { Injectable, Inject, Scope, ForbiddenException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  addCreatedByFields,
  addUpdatedByField,
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
  parseLimitFiltersForPipeline,
} from "src/common/utils";
import { CreateOrigDatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigDatablockDto } from "./dto/update-origdatablock.dto";
import { IOrigDatablockFields } from "./interfaces/origdatablocks.interface";
import {
  OrigDatablock,
  OrigDatablockDocument,
} from "./schemas/origdatablock.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";

@Injectable({ scope: Scope.REQUEST })
export class OrigDatablocksService {
  constructor(
    @InjectModel(OrigDatablock.name)
    private origDatablockModel: Model<OrigDatablockDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(
    createOrigdatablockDto: CreateOrigDatablockDto,
  ): Promise<OrigDatablock> {
    const username = (this.request.user as JWTUser).username;
    const createdOrigDatablock = new this.origDatablockModel(
      addCreatedByFields(createOrigdatablockDto, username),
    );
    return createdOrigDatablock.save();
  }

  async findAll(
    filter: FilterQuery<OrigDatablockDocument>,
  ): Promise<OrigDatablock[]> {
    const whereFilter: FilterQuery<OrigDatablockDocument> =
      createFullqueryFilter<OrigDatablockDocument>(
        this.origDatablockModel,
        "_id",
        filter.where as FilterQuery<OrigDatablockDocument>,
      );

    const fieldsProjection: FilterQuery<OrigDatablockDocument> =
      filter.fields ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    const origdatablockPromise = this.origDatablockModel
      .find(whereFilter, fieldsProjection)
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const origdatablock = await origdatablockPromise.exec();

    return origdatablock;
  }

  async findOne(
    filter: FilterQuery<OrigDatablockDocument>,
  ): Promise<OrigDatablock | null> {
    const whereFilter: FilterQuery<OrigDatablockDocument> =
      createFullqueryFilter<OrigDatablockDocument>(
        this.origDatablockModel,
        "_id",
        filter as FilterQuery<OrigDatablockDocument>,
      );

    const origdatablock = await this.origDatablockModel.findOne(whereFilter);

    if (!origdatablock) {
      throw new ForbiddenException("Unauthorized access");
    }

    return origdatablock;
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

    return this.origDatablockModel.find(filterQuery, null, modifiers).exec();
  }

  async fullqueryFilesList(
    filter: IFilters<OrigDatablockDocument, IOrigDatablockFields>,
  ): Promise<OrigDatablock[] | null> {
    const filterQuery: FilterQuery<OrigDatablockDocument> =
      createFullqueryFilter<OrigDatablockDocument>(
        this.origDatablockModel,
        "_id",
        filter.fields as FilterQuery<OrigDatablockDocument>,
      );
    const modifiers = parseLimitFiltersForPipeline(filter.limits);

    const pipelineStages: PipelineStage[] = [
      { $match: filterQuery },
      {
        $lookup: {
          from: "Dataset",
          localField: "datasetId",
          foreignField: "pid",
          as: "Dataset",
        },
      },
      {
        $addFields: {
          datasetExist: { $gt: [{ $size: "$Dataset" }, 0] },
        },
      },
      { $unset: "Dataset" },
      { $unwind: "$dataFileList" },
      ...modifiers,
    ];

    return this.origDatablockModel.aggregate(pipelineStages).exec();
  }

  async fullfacet(
    filters: IFacets<IOrigDatablockFields>,
    subField?: string,
  ): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];
    const pipeline = createFullfacetPipeline<
      OrigDatablockDocument,
      FilterQuery<OrigDatablockDocument>
    >(this.origDatablockModel, "datasetId", fields, facets, subField);

    return this.origDatablockModel.aggregate(pipeline).exec();
  }

  async update(
    filter: FilterQuery<OrigDatablockDocument>,
    updateOrigdatablockDto: UpdateOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    const username = (this.request.user as JWTUser).username;
    return this.origDatablockModel
      .findOneAndUpdate(
        filter,
        addUpdatedByField(updateOrigdatablockDto, username),
        { new: true },
      )
      .exec();
  }

  async remove(filter: FilterQuery<OrigDatablockDocument>): Promise<unknown> {
    return this.origDatablockModel.findOneAndRemove(filter).exec();
  }
}
