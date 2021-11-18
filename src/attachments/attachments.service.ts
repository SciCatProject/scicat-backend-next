import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { UpdateAttachmentDto } from "./dto/update-attachment.dto";
import { Attachment, AttachmentDocument } from "./schemas/attachment.schema";

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    const createdAttachment = new this.attachmentModel(createAttachmentDto);
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
