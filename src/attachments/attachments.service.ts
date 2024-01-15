import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { UpdateAttachmentDto } from "./dto/update-attachment.dto";
import { Attachment, AttachmentDocument } from "./schemas/attachment.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { addCreatedByFields, addUpdatedByField } from "src/common/utils";

@Injectable({ scope: Scope.REQUEST })
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    const username = (this.request?.user as JWTUser).username;
    const createdAttachment = new this.attachmentModel(
      addCreatedByFields(createAttachmentDto, username),
    );
    return createdAttachment.save();
  }

  async findAll(
    filter: FilterQuery<AttachmentDocument>,
  ): Promise<Attachment[]> {
    return this.attachmentModel.find(filter).exec();
  }

  async findOne(
    filter: FilterQuery<AttachmentDocument>,
    projection?: Record<string, unknown>,
  ): Promise<Attachment | null> {
    return this.attachmentModel.findOne(filter, projection ?? {}).exec();
  }

  async findOneAndUpdate(
    filter: FilterQuery<AttachmentDocument>,
    updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    const username = (this.request?.user as JWTUser).username;
    return this.attachmentModel
      .findOneAndUpdate(
        filter,
        addUpdatedByField(updateAttachmentDto, username),
        { new: true },
      )
      .exec();
  }

  async findOneAndDelete(
    filter: FilterQuery<AttachmentDocument>,
  ): Promise<unknown> {
    return this.attachmentModel.findOneAndDelete(filter).exec();
  }
}
