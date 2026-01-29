import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  MetadataKeyClass,
  MetadataKeyDocument,
} from "./schemas/metadatakey.schema";
import { Model } from "mongoose";
import { REQUEST } from "@nestjs/core";
import { CreateMetadataKeyDto } from "./dto/create-metadata-key.dto";

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

  async findAll(filter: any) {
    return null;
  }
}
