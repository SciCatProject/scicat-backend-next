import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  MetadataKeyClass,
  MetadataKeyDocument,
} from "./schemas/metadatakey.schema";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { REQUEST } from "@nestjs/core";
import { CreateMetadataKeyDto } from "./dto/create-metadata-key.dto";
import { isEmpty } from "lodash";
import { parsePipelineProjection, parsePipelineSort } from "src/common/utils";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";

@Injectable({ scope: Scope.REQUEST })
export class MetadataKeysV4Service {
  constructor(
    @InjectModel(MetadataKeyClass.name)
    private metadataKeyModel: Model<MetadataKeyDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async update(dto: CreateMetadataKeyDto) {
    const doc = await this.metadataKeyModel.updateOne(dto);
    return doc;
  }
  async findOne(id: string) {
    const doc = await this.metadataKeyModel.findOne({ id }).lean();
    return doc;
  }

  async findAll(
    filter: FilterQuery<MetadataKeyDocument>,
    user?: JWTUser,
  ): Promise<MetadataKeyClass[]> {
    const whereFilter: FilterQuery<MetadataKeyDocument> = filter.where ?? {};
    const fieldsProjection: string[] = filter.fields ?? {};
    const limits: QueryOptions<MetadataKeyDocument> = filter.limits ?? {
      limit: 100,
      skip: 0,
      sort: { createdAt: "desc" },
    };

    const pipeline: PipelineStage[] = [{ $match: whereFilter }];
    if (!isEmpty(fieldsProjection)) {
      const projection = parsePipelineProjection(fieldsProjection);
      pipeline.push({ $project: projection });
    }

    if (!isEmpty(limits.sort)) {
      const sort = parsePipelineSort(limits.sort);
      pipeline.push({ $sort: sort });
    }

    pipeline.push({ $skip: limits.skip || 0 });

    pipeline.push({ $limit: limits.limit || 100 });

    const data = await this.metadataKeyModel
      .aggregate<MetadataKeyClass>(pipeline)
      .exec();

    return data;
  }
}
