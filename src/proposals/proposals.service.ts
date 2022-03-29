import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  createFullqueryFilter,
  createNewFacetPipeline,
  parseLimitFilters,
  schemaTypeOf,
  searchExpression,
} from "src/common/utils";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import { IProposalFields } from "./interfaces/proposal-filters.interface";
import { ProposalField } from "./proposal-field.enum";
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
    const pipeline = [];
    const facetMatch: Record<string, unknown> = {};
    const allMatch = [];

    Object.keys(fields).forEach((key) => {
      if (facets.indexOf(key) < 0) {
        if (key === ProposalField.Text) {
          if (typeof fields[key] === "string") {
            const match = {
              $match: {
                $or: [
                  {
                    $text: searchExpression<ProposalDocument>(
                      this.proposalModel,
                      key,
                      String(fields[key]),
                    ),
                  },
                ],
              },
            };
            pipeline.unshift(match);
          }
        } else if (key === ProposalField.ProposalId) {
          const match = {
            $match: {
              proposalId: searchExpression<ProposalDocument>(
                this.proposalModel,
                key,
                fields[key],
              ),
            },
          };
          allMatch.push(match);
          pipeline.push(match);
        } else {
          const match: Record<string, unknown> = {};
          match[key] = searchExpression<ProposalDocument>(
            this.proposalModel,
            key,
            fields[key as keyof IProposalFields],
          );
          const m = {
            $match: match,
          };
          allMatch.push(m);
          pipeline.push(m);
        }
      } else {
        facetMatch[key] = searchExpression<ProposalDocument>(
          this.proposalModel,
          key,
          fields[key as keyof IProposalFields],
        );
      }
    });

    const facetObject: Record<string, PipelineStage[]> = {};
    facets.forEach((facet) => {
      if (facet in this.proposalModel.schema.paths) {
        facetObject[facet] = createNewFacetPipeline(
          facet,
          schemaTypeOf<ProposalDocument>(this.proposalModel, facet),
          facetMatch,
        );
        return;
      } else {
        Logger.warn(
          `Warning: Facet not part of any model: ${facet}`,
          "ProposalsService",
        );
      }
    });

    facetObject["all"] = [
      {
        $match: facetMatch,
      },
      {
        $count: "totalSets",
      },
    ];
    pipeline.push({ $facet: facetObject });

    const results = await this.proposalModel
      .aggregate(pipeline as PipelineStage[])
      .exec();
    return results;
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
