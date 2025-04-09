import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { Attachment, AttachmentDocument } from "./schemas/attachment.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import {
  addCreatedByFields,
  addUpdatedByField,
  parsePipelineProjection,
  parsePipelineSort,
} from "src/common/utils";
import { isEmpty } from "lodash";
import { CreateAttachmentV4Dto } from "./dto/create-attachment.v4.dto";
import { PartialUpdateAttachmentV4Dto } from "./dto/update-attachment.v4.dto";

@Injectable({ scope: Scope.REQUEST })
export class AttachmentsV4Service {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(
    createAttachmentDto: CreateAttachmentV4Dto,
  ): Promise<Attachment> {
    const username = (this.request?.user as JWTUser).username;

    const createdAttachment = new this.attachmentModel(
      addCreatedByFields(createAttachmentDto, username),
    );
    return createdAttachment.save();
  }

  async findAll(
    filter: FilterQuery<AttachmentDocument>,
  ): Promise<Attachment[]> {
    const whereFilter: FilterQuery<AttachmentDocument> = filter.where ?? {};
    const fieldsProjection: string[] = filter.fields ?? {};
    const limits: QueryOptions<AttachmentDocument> = filter.limits ?? {
      limit: 10,
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

    pipeline.push({ $limit: limits.limit || 10 });

    const data = await this.attachmentModel
      .aggregate<Attachment>(pipeline)
      .exec();

    return data;
  }

  async findOne(
    filter: FilterQuery<AttachmentDocument>,
    projection?: Record<string, unknown>,
  ): Promise<Attachment | null> {
    return this.attachmentModel.findOne(filter, projection ?? {}).exec();
  }

  async findOneAndUpdate(
    filter: FilterQuery<AttachmentDocument>,
    updateAttachmentDto: PartialUpdateAttachmentV4Dto,
  ): Promise<Attachment | null> {
    const username = (this.request?.user as JWTUser).username;

    const result = await this.attachmentModel
      .findOneAndUpdate(
        filter,
        addUpdatedByField(updateAttachmentDto, username),
        { new: true },
      )
      .exec();

    return result;
  }

  async findOneAndDelete(
    filter: FilterQuery<AttachmentDocument>,
  ): Promise<unknown> {
    return this.attachmentModel.findOneAndDelete(filter).exec();
  }
}
