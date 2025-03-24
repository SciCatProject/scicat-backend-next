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
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { PartialUpdateAttachmentDto } from "./dto/update-attachment.dto";
import { PartialUpdateAttachmentObsoleteDto } from "./dto-obsolete/update-attachment-obsolete.dto";
import { CreateAttachmentObsoleteDto } from "./dto-obsolete/create-attachment-obsolete.dto";
import { AttachmentRelationTargetType } from "./types/relationship-filter.enum";

@Injectable({ scope: Scope.REQUEST })
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(
    createAttachmentDto: CreateAttachmentObsoleteDto | CreateAttachmentDto,
  ): Promise<Attachment> {
    const username = (this.request?.user as JWTUser).username;

    const convertedDto =
      this.convertObsoleteDtoToCurrentSchema(createAttachmentDto);
    const createdAttachment = new this.attachmentModel(
      addCreatedByFields(convertedDto, username),
    );
    return createdAttachment.save();
  }

  async findAll(
    filter: FilterQuery<AttachmentDocument>,
  ): Promise<Attachment[]> {
    const convertedFilter =
      this.convertObsoleteWhereFilterToCurrentSchema(filter);

    return await this.findAllComplete({ where: convertedFilter });
  }
  async findAllComplete(
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

    pipeline.push({ $limit: limits.limit || 10 });

    pipeline.push({ $skip: limits.skip || 0 });

    const data = await this.attachmentModel
      .aggregate<Attachment>(pipeline)
      .exec();

    return data;
  }

  async findOne(
    filter: FilterQuery<AttachmentDocument>,
    projection?: Record<string, unknown>,
  ): Promise<Attachment | null> {
    const convertedFilter =
      this.convertObsoleteWhereFilterToCurrentSchema(filter);
    return this.attachmentModel
      .findOne(convertedFilter, projection ?? {})
      .exec();
  }

  async findOneAndUpdate(
    filter: FilterQuery<AttachmentDocument>,
    updateAttachmentDto:
      | PartialUpdateAttachmentObsoleteDto
      | PartialUpdateAttachmentDto,
  ): Promise<Attachment | null> {
    const username = (this.request?.user as JWTUser).username;
    const convertedFilter =
      this.convertObsoleteWhereFilterToCurrentSchema(filter);
    const convertedDto =
      this.convertObsoleteDtoToCurrentSchema(updateAttachmentDto);

    const result = await this.attachmentModel
      .findOneAndUpdate(
        convertedFilter,
        addUpdatedByField(convertedDto, username),
        { new: true },
      )
      .exec();

    return result;
  }

  async findOneAndDelete(
    filter: FilterQuery<AttachmentDocument>,
  ): Promise<unknown> {
    const convertedFilter =
      this.convertObsoleteWhereFilterToCurrentSchema(filter);
    return this.attachmentModel.findOneAndDelete(convertedFilter).exec();
  }

  convertObsoleteWhereFilterToCurrentSchema(
    filter: FilterQuery<AttachmentDocument>,
  ): FilterQuery<AttachmentDocument> {
    let whereFilter: FilterQuery<AttachmentDocument> = {};

    if ("sampleId" in filter) {
      whereFilter = {
        "relationships.targetIds": { $in: [filter.sampleId] },
        "relationships.targetType": AttachmentRelationTargetType.SAMPLE,
      };
    } else if ("datasetId" in filter) {
      whereFilter = {
        "relationships.targetIds": { $in: [filter.datasetId] },
        "relationships.targetType": AttachmentRelationTargetType.DATASET,
      };
    } else if ("proposalId" in filter) {
      whereFilter = {
        "relationships.targetIds": { $in: [filter.proposalId] },
        "relationships.targetType": AttachmentRelationTargetType.PROPOSAL,
      };
    } else {
      // If no legacy keys are present, return the original filter.
      return filter;
    }

    const idConditions: FilterQuery<AttachmentDocument> = {};

    if ("id" in filter) {
      // if _id is provided, use it to filter by _id.
      idConditions["_id"] = filter["id"];
    }

    if (Object.keys(idConditions).length > 0) {
      if (Object.keys(whereFilter).length === 0) {
        return idConditions;
      }
      return { $and: [whereFilter, idConditions] };
    }

    return whereFilter;
  }

  private convertObsoleteDtoToCurrentSchema(
    attachmentDto:
      | CreateAttachmentObsoleteDto
      | CreateAttachmentDto
      | PartialUpdateAttachmentObsoleteDto
      | PartialUpdateAttachmentDto,
  ): CreateAttachmentDto | PartialUpdateAttachmentDto {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const converted = { ...attachmentDto } as any;

    if ("datasetId" in converted && converted.datasetId) {
      converted.relationships = [
        {
          targetIds: [converted.datasetId],
          targetType: AttachmentRelationTargetType.DATASET,
          relationType: "is attached to",
        },
      ];
      delete converted.datasetId;
    } else if ("sampleId" in converted && converted.sampleId) {
      converted.relationships = [
        {
          targetIds: [converted.sampleId],
          targetType: AttachmentRelationTargetType.SAMPLE,
          relationType: "is attached to",
        },
      ];
      delete converted.sampleId;
    } else if ("proposalId" in converted && converted.proposalId) {
      converted.relationships = [
        {
          targetIds: [converted.proposalId],
          targetType: AttachmentRelationTargetType.PROPOSAL,
          relationType: "is attached to",
        },
      ];
      delete converted.proposalId;
    }

    return converted;
  }
}
