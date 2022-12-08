import { Injectable, Inject, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { IFilters } from "src/common/interfaces/common.interface";
import {
  addCreatedFields,
  addUpdatedField,
  extractMetadataKeys,
  mapScientificQuery,
  parseLimitFilters,
} from "src/common/utils";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";
import { ISampleFields } from "./interfaces/sample-filters.interface";
import { SampleField } from "./sample-field.enum";
import { Sample, SampleDocument } from "./schemas/sample.schema";

@Injectable({ scope: Scope.REQUEST })
export class SamplesService {
  constructor(
    @InjectModel(Sample.name) private sampleModel: Model<SampleDocument>,
    private configService: ConfigService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createSampleDto: CreateSampleDto): Promise<Sample> {
    const username = (this.request.user as JWTUser).username;
    const createdSample = new this.sampleModel(
      addCreatedFields(createSampleDto, username),
    );
    return createdSample.save();
  }

  async findAll(
    filter: IFilters<SampleDocument, ISampleFields>,
  ): Promise<Sample[]> {
    const whereFilter: FilterQuery<SampleDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    return this.sampleModel
      .find(whereFilter)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(
    filter: IFilters<SampleDocument, ISampleFields>,
  ): Promise<Sample[]> {
    const modifiers: QueryOptions = {};
    let filterQuery: FilterQuery<SampleDocument> = {};

    if (filter) {
      const { limit, skip, sort } = parseLimitFilters(filter.limits);
      modifiers.limit = limit;
      modifiers.skip = skip;
      modifiers.sort = sort;

      if (filter.fields) {
        const fields = filter.fields;
        Object.keys(fields).forEach((key) => {
          if (key === SampleField.Text) {
            const text = fields[key];
            if (text) {
              filterQuery.$text = { $search: text };
            }
          } else if (key === SampleField.Characteristics) {
            filterQuery = {
              ...filterQuery,
              ...mapScientificQuery(fields[key]),
            };
          }
        });
      }
    }

    return this.sampleModel.find(filterQuery, null, modifiers).exec();
  }

  async metadataKeys(
    filters: IFilters<SampleDocument, ISampleFields>,
  ): Promise<string[]> {
    const blacklist = [new RegExp(".*_date")];

    let MAXLIMIT;
    if (this.configService.get<number>("metadataParentInstancesReturnLimit")) {
      MAXLIMIT = this.configService.get<number>(
        "metadataParentInstancesReturnLimit",
      );

      let lm;

      if (filters.limits) {
        lm = JSON.parse(JSON.stringify(filters.limits));
      } else {
        lm = {};
      }

      if (MAXLIMIT && lm.limit) {
        if (lm.limit > MAXLIMIT) {
          lm.limit = MAXLIMIT;
        }
      } else {
        lm.limit = MAXLIMIT;
      }
      filters.limits = lm;
    }

    const samples = await this.findAll(filters);

    const metadataKeys = extractMetadataKeys<Sample>(
      samples,
      "sampleCharacteristics",
    ).filter((key) => !blacklist.some((regex) => regex.test(key)));

    const metadataKey: string | undefined = filters.fields
      ? filters.fields.metadataKey
      : undefined;
    const returnLimit = this.configService.get<number>(
      "metadataKeysReturnLimit",
    );

    if (metadataKey && metadataKey.length > 0) {
      const filterKey = metadataKey.toLowerCase();
      return metadataKeys
        .filter((key) => key.toLowerCase().includes(filterKey))
        .slice(0, returnLimit);
    } else {
      return metadataKeys.slice(0, returnLimit);
    }
  }

  async findOne(filter: FilterQuery<SampleDocument>): Promise<Sample | null> {
    return this.sampleModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<SampleDocument>,
    updateSampleDto: UpdateSampleDto,
  ): Promise<Sample | null> {
    const username = (this.request.user as JWTUser).username;

    return this.sampleModel
      .findOneAndUpdate(filter, addUpdatedField(updateSampleDto, username), {
        new: true,
      })
      .exec();
  }

  async remove(filter: FilterQuery<SampleDocument>): Promise<unknown> {
    return this.sampleModel.findOneAndRemove(filter).exec();
  }
}
