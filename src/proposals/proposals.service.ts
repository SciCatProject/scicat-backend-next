import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import {
  IProposalFacets,
  IProposalFields,
  IProposalFilters,
  ProposalField,
} from "./interfaces/proposal-filters.interface";
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

  async findAll(filter: FilterQuery<ProposalDocument>): Promise<Proposal[]> {
    return this.proposalModel.find(filter).exec();
  }

  async fullquery(filter: IProposalFilters): Promise<Proposal[]> {
    const modifiers: QueryOptions = {};
    const filterQuery: FilterQuery<ProposalDocument> = {};

    if (filter) {
      if (filter.limits) {
        if (filter.limits.limit) {
          modifiers.limit = filter.limits.limit;
        }
        if (filter.limits.skip) {
          modifiers.skip = filter.limits.skip;
        }
        if (filter.limits.order) {
          const [field, direction] = filter.limits.order.split(":");
          const sort = { [field]: direction };
          modifiers.sort = sort;
        }
      }

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
    filters: IProposalFacets,
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

    const facetObject: Record<string, unknown> = {};
    facets.forEach((facet) => {
      if (facet in this.proposalModel.schema.paths) {
        facetObject[facet] = this.createNewFacetPipeline(
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

  private createNewFacetPipeline(
    name: string,
    type: string,
    query: Record<string, unknown>,
  ) {
    const pipeline = [];

    if (type === "Array") {
      pipeline.push({
        $unwind: "$" + name,
      });
    }

    if (query && Object.keys(query).length > 0) {
      const queryCopy = { ...query };
      delete queryCopy[name];

      if (Object.keys(queryCopy).length > 0) {
        pipeline.push({
          $match: queryCopy,
        });
      }
    }

    const group: {
      $group: {
        _id: string | Record<string, unknown>;
        count: Record<string, number>;
      };
    } = {
      $group: {
        _id: "$" + name,
        count: {
          $sum: 1,
        },
      },
    };

    if (type === "Date") {
      group.$group._id = {
        year: {
          $year: "$" + name,
        },
        month: {
          $month: "$" + name,
        },
        day: {
          $dayOfMonth: "$" + name,
        },
      };
    }
    pipeline.push(group);

    const sort = {
      $sort: {
        _id: -1,
      },
    };
    pipeline.push(sort);

    return pipeline;
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
