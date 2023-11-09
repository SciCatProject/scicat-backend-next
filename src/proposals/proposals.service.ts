import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
  addCreatedByFields,
  addUpdatedByField,
} from "src/common/utils";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import { IProposalFields } from "./interfaces/proposal-filters.interface";
import { ProposalClass, ProposalDocument } from "./schemas/proposal.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { CreateMeasurementPeriodDto } from "./dto/create-measurement-period.dto";

@Injectable({ scope: Scope.REQUEST })
export class ProposalsService {
  constructor(
    @InjectModel(ProposalClass.name)
    private proposalModel: Model<ProposalDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createProposalDto: CreateProposalDto): Promise<ProposalClass> {
    const username = (this.request.user as JWTUser).username;
    if (createProposalDto.MeasurementPeriodList) {
      for (const i in createProposalDto.MeasurementPeriodList) {
        createProposalDto.MeasurementPeriodList[i] =
          addCreatedByFields<CreateMeasurementPeriodDto>(
            createProposalDto.MeasurementPeriodList[i],
            username,
          );
      }
    }
    const createdProposal = new this.proposalModel(
      addCreatedByFields<CreateProposalDto>(createProposalDto, username),
    );
    return createdProposal.save();
  }

  async findAll(
    filter: IFilters<ProposalDocument, IProposalFields>,
  ): Promise<ProposalClass[]> {
    const whereFilter: FilterQuery<ProposalDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    return this.proposalModel
      .find(whereFilter)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(
    filter: IFilters<ProposalDocument, IProposalFields>,
  ): Promise<ProposalClass[]> {
    const filterQuery: FilterQuery<ProposalDocument> =
      createFullqueryFilter<ProposalDocument>(
        this.proposalModel,
        "proposalId",
        filter.fields,
      );
    const modifiers: QueryOptions = parseLimitFilters(filter.limits);

    return this.proposalModel.find(filterQuery, null, modifiers).exec();
  }

  async fullfacet(
    filters: IFacets<IProposalFields>,
  ): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];

    const pipeline: PipelineStage[] = createFullfacetPipeline<
      ProposalDocument,
      IProposalFields
    >(this.proposalModel, "proposalId", fields, facets);

    return await this.proposalModel.aggregate(pipeline).exec();
  }

  async findOne(
    filter: FilterQuery<ProposalDocument>,
  ): Promise<ProposalClass | null> {
    return this.proposalModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<ProposalDocument>,
    updateProposalDto: UpdateProposalDto,
  ): Promise<ProposalClass | null> {
    const username = (this.request.user as JWTUser).username;

    return this.proposalModel
      .findOneAndUpdate(
        filter,
        addUpdatedByField(updateProposalDto, username),
        {
          new: true,
        },
      )
      .exec();
  }

  async remove(filter: FilterQuery<ProposalDocument>): Promise<unknown> {
    return this.proposalModel.findOneAndRemove(filter).exec();
  }
}
