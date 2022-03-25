import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { createNewFacetPipeline, parseLimitFilters } from "src/common/utils";
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
    const modifiers: QueryOptions = {};
    const filterQuery: FilterQuery<ProposalDocument> = {};

    if (filter) {
      const { limit, skip, sort } = parseLimitFilters(filter.limits);
      modifiers.limit = limit;
      modifiers.skip = skip;
      modifiers.sort = sort;

      if (filter.fields) {
        const fields = filter.fields;
        Object.keys(fields).forEach((key) => {
          if (key === ProposalField.Text) {
            const text = fields[key];
            if (text) {
              filterQuery.$text = { $search: text };
            }
          } else if (
            key === ProposalField.StartTime ||
            key === ProposalField.EndTime
          ) {
            const time = fields[key];
            if (time) {
              const { begin, end } = time;
              filterQuery[key] = {
                $gte: new Date(begin),
                $lt: new Date(end),
              };
            }
          } else {
            filterQuery[key] = fields[key as keyof IProposalFields];
          }
        });
      }
    }

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
                    $text: this.searchExpression(key, String(fields[key])),
                  },
                ],
              },
            };
            pipeline.unshift(match);
          }
        } else if (key === ProposalField.ProposalId) {
          const match = {
            $match: {
              proposalId: this.searchExpression(key, fields[key]),
            },
          };
          allMatch.push(match);
          pipeline.push(match);
        } else {
          const match: Record<string, unknown> = {};
          match[key] = this.searchExpression(
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
        facetMatch[key] = this.searchExpression(
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
          this.schemaTypeOf(facet),
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
    // const results: Record<string, unknown>[] = [];
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

  private searchExpression(fieldName: string, value: unknown): unknown {
    if (fieldName === ProposalField.Text) {
      return { $search: value };
    }

    const valueType = this.schemaTypeOf(fieldName, value);

    if (valueType === "String") {
      if (Array.isArray(value)) {
        if (value.length === 1) {
          return value[0];
        } else {
          return {
            $in: value,
          };
        }
      } else {
        return value;
      }
    } else if (valueType === "Date") {
      return {
        $gte: new Date((value as Record<string, string | Date>).begin),
        $lte: new Date((value as Record<string, string | Date>).end),
      };
    } else if (valueType === "Boolean") {
      return {
        $eq: value,
      };
    } else if (Array.isArray(value)) {
      return {
        $in: value,
      };
    } else {
      return value;
    }
  }

  private schemaTypeOf(key: string, value: unknown = null): string {
    const property = this.proposalModel.schema.path(key);

    if (!property) {
      if ("begin" in (value as Record<string, unknown>)) {
        return "Date";
      }
      return "String";
    }

    return property.instance;
  }
}
