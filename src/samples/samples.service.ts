import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import { extractMetadataKeys, mapScientificQuery } from "src/common/utils";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";
import {
  ISampleFilters,
  SampleField,
} from "./interfaces/sample-filters.interface";
import { Sample, SampleDocument } from "./schemas/sample.schema";

@Injectable()
export class SamplesService {
  constructor(
    @InjectModel(Sample.name) private sampleModel: Model<SampleDocument>,
    private configService: ConfigService,
  ) {}

  async create(createSampleDto: CreateSampleDto): Promise<Sample> {
    const createdSample = new this.sampleModel(createSampleDto);
    return createdSample.save();
  }

  async findAll(filters: ISampleFilters): Promise<Sample[]> {
    const whereFilters: FilterQuery<SampleDocument> = filters.where ?? {};
    let limit = 100;
    let skip = 0;
    let sort = {};
    if (filters.limits) {
      if (filters.limits.limit) {
        limit = filters.limits.limit;
      }
      if (filters.limits.skip) {
        skip = filters.limits.skip;
      }
      if (filters.limits.order) {
        const [field, direction] = filters.limits.order.split(":");
        sort = { [field]: direction };
      }
    }
    return this.sampleModel
      .find(whereFilters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(filters: ISampleFilters): Promise<Sample[]> {
    const modifiers: QueryOptions = {};
    let filterQuery: FilterQuery<SampleDocument> = {};

    if (filters) {
      if (filters.limits) {
        if (filters.limits.limit) {
          modifiers.limit = filters.limits.limit;
        }
        if (filters.limits.skip) {
          modifiers.skip = filters.limits.skip;
        }
        if (filters.limits.order) {
          const [field, direction] = filters.limits.order.split(":");
          const sort = { [field]: direction };
          modifiers.sort = sort;
        }
      }

      if (filters.fields) {
        const fields = filters.fields;
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

  async metadataKeys(filters: ISampleFilters): Promise<string[]> {
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
    return this.sampleModel
      .findOneAndUpdate(filter, updateSampleDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<SampleDocument>): Promise<unknown> {
    return this.sampleModel.findOneAndRemove(filter).exec();
  }
}
