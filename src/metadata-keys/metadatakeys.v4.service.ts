import { Inject, Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import {
  MetadataKeyClass,
  MetadataKeyDocument,
} from "./schemas/metadatakey.schema";
import { Model } from "mongoose";
import { REQUEST } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class MetadataKeysV4Service {
  constructor(
    private configService: ConfigService,
    @InjectModel(MetadataKeyClass.name)
    private metadataKeyModel: Model<MetadataKeyDocument>,
    @Inject(REQUEST) private request: Request,
  ) {}
}
