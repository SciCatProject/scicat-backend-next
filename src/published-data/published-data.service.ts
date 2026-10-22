import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { FilterQuery, Model } from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { addCreatedByFields, parseLimitFilters } from "src/common/utils";
import { CreatePublishedDataV4Dto } from "./dto/create-published-data.v4.dto";
import { PartialUpdatePublishedDataV4Dto } from "./dto/update-published-data.v4.dto";
import {
  ICount,
  IPublishedDataFilters,
} from "./interfaces/published-data.interface";
import {
  PublishedData,
  PublishedDataDocument,
} from "./schemas/published-data.schema";
import {
  hasAtLeastOneResourceId,
  RESOURCE_ID_FIELD_NAMES,
} from "./pipes/resource-id.validation";

@Injectable({ scope: Scope.REQUEST })
export class PublishedDataService {
  constructor(
    @InjectModel(PublishedData.name)
    private publishedDataModel: Model<PublishedDataDocument>,
    @Inject(REQUEST)
    private request: Request,
    private configService: ConfigService,
  ) {}

  async getConfig(): Promise<Record<string, unknown> | null> {
    const config =
      this.configService.get<Record<string, unknown>>("publishedDataConfig") ||
      null;

    return config;
  }

  /**
   * Validates that at least one ID field is present and non-empty.
   * This provides defense-in-depth validation at the service level.
   *
   * @param datasetPids - Array of dataset persistent identifiers
   * @param proposalIds - Array of proposal persistent identifiers
   * @param sampleIds - Array of sample persistent identifiers
   * @param instrumentIds - Array of instrument persistent identifiers
   * @throws BadRequestException if no ID fields are provided
   */
  private validateAtLeastOneIdField(
    datasetPids?: string[],
    proposalIds?: string[],
    sampleIds?: string[],
    instrumentIds?: string[],
  ): void {
    if (
      !hasAtLeastOneResourceId({
        datasetPids,
        proposalIds,
        sampleIds,
        instrumentIds,
      })
    ) {
      throw new BadRequestException({
        message:
          "At least one of datasetPids, proposalIds, sampleIds, or instrumentIds must contain at least one non-empty element",
        code: "NO_RESOURCE_IDS_PROVIDED",
      });
    }
  }

  async create(
    createPublishedDataDto: CreatePublishedDataV4Dto,
  ): Promise<PublishedData> {
    // Service-level validation (defense-in-depth)
    this.validateAtLeastOneIdField(
      createPublishedDataDto.datasetPids,
      createPublishedDataDto.proposalIds,
      createPublishedDataDto.sampleIds,
      createPublishedDataDto.instrumentIds,
    );

    const username = (this.request.user as JWTUser).username;
    const createdPublished = new this.publishedDataModel(
      addCreatedByFields<CreatePublishedDataV4Dto>(
        createPublishedDataDto,
        username,
      ),
    );

    return createdPublished.save();
  }

  async findAll(filter: IPublishedDataFilters): Promise<PublishedData[]> {
    const { limit, skip, sort } = parseLimitFilters(filter.limits);
    return this.publishedDataModel
      .find(filter.where ?? {})
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .select(filter.fields ?? {})
      .exec();
  }

  async countDocuments(
    filter: FilterQuery<PublishedDataDocument>,
    options?: object,
  ): Promise<ICount> {
    const count = await this.publishedDataModel
      .countDocuments(filter.where ?? {}, options)
      .exec();
    return { count };
  }

  async findOne(
    filter: FilterQuery<PublishedDataDocument>,
  ): Promise<PublishedData | null> {
    return this.publishedDataModel.findOne(filter).exec();
  }

  /**
   * Validates the resource-ID portion of a partial update against an existing
   * document. Legacy documents may be updated without resource IDs, but an
   * update that explicitly changes an ID field must leave at least one ID.
   */
  validateUpdate(
    existing: PublishedData,
    updatePublishedDataDto: PartialUpdatePublishedDataV4Dto,
  ): void {
    const updatesResourceIds = RESOURCE_ID_FIELD_NAMES.some(
      (field) => updatePublishedDataDto[field] !== undefined,
    );

    if (!updatesResourceIds) {
      return;
    }

    this.validateAtLeastOneIdField(
      updatePublishedDataDto.datasetPids ?? existing.datasetPids,
      updatePublishedDataDto.proposalIds ?? existing.proposalIds,
      updatePublishedDataDto.sampleIds ?? existing.sampleIds,
      updatePublishedDataDto.instrumentIds ?? existing.instrumentIds,
    );
  }

  async update(
    filter: FilterQuery<PublishedDataDocument>,
    updatePublishedDataDto: PartialUpdatePublishedDataV4Dto,
  ): Promise<PublishedData | null> {
    const username = (this.request.user as JWTUser).username;

    const existing = await this.publishedDataModel.findOne(filter).exec();

    if (existing) {
      this.validateUpdate(existing, updatePublishedDataDto);
    }

    return this.publishedDataModel
      .findOneAndUpdate(
        filter,
        {
          $set: {
            ...updatePublishedDataDto,
            updatedBy: username,
            updatedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();
  }

  /**
   * Remove a published data document.
   * @param filter - The filter to find the document to remove.
   * @returns The removed document or null if not found.
   */
  async remove(
    filter: FilterQuery<PublishedDataDocument>,
  ): Promise<PublishedData | null> {
    return this.publishedDataModel.findOneAndDelete(filter).exec();
  }
}
