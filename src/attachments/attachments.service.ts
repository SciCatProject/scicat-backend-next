import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { UpdateAttachmentDto } from "./dto/update-attachment.dto";
import { Attachment, AttachmentDocument } from "./schemas/attachment.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { addCreateFields } from "src/common/utils";

@Injectable({ scope: Scope.REQUEST })
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    const username = (this.request?.user as JWTUser).username;
    const ts = new Date();
    const createdAttachment = new this.attachmentModel(
      addCreateFields(createAttachmentDto, username, ts),
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
    return this.attachmentModel
      .findOneAndUpdate(filter, updateAttachmentDto, { new: true })
      .exec();
  }

  async findOneAndRemove(
    filter: FilterQuery<AttachmentDocument>,
  ): Promise<unknown> {
    return this.attachmentModel.findOneAndRemove(filter).exec();
  }
}
