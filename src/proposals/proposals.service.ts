import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
} from "src/common/utils";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import { IProposalFields } from "./interfaces/proposal-filters.interface";
import { Proposal, ProposalDocument } from "./schemas/proposal.schema";

@Injectable()
export class ProposalsService {
  constructor(
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
  ) {}

  async create(createProposalDto: CreateProposalDto): Promise<Proposal> {
    const createdProposal = new this.proposalModel(createProposalDto);
    return createdProposal.save();
  }

  async findAll(
    filter: IFilters<ProposalDocument, IProposalFields>,
  ): Promise<Proposal[]> {
    const whereFilter: FilterQuery<ProposalDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters<Proposal>(filter.limits);

    return this.proposalModel
      .find(whereFilter)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(
    filter: IFilters<ProposalDocument, IProposalFields>,
  ): Promise<Proposal[]> {
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
  ): Promise<Proposal | null> {
    return this.proposalModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<ProposalDocument>,
    updateProposalDto: UpdateProposalDto,
  ): Promise<Proposal | null> {
    return this.proposalModel
      .findOneAndUpdate(filter, updateProposalDto, {
        new: true,
      })
      .exec();
  }

  async remove(filter: FilterQuery<ProposalDocument>): Promise<unknown> {
    return this.proposalModel.findOneAndRemove(filter).exec();
  }
}
