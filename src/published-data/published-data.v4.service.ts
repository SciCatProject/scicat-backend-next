/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Inject,
  Injectable,
  Scope,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import {
  parseLimitFilters,
  addCreatedByFields,
  addUpdatedByField,
  createFullqueryFilter,
} from "src/common/utils";
import {
  ICount,
  IPublishedDataFilters,
} from "./interfaces/published-data.interface";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { HttpService } from "@nestjs/axios";
import { IRegister } from "./interfaces/published-data.interface";
import { existsSync, readFileSync } from "fs";
import { firstValueFrom } from "rxjs";
import { handleAxiosRequestError } from "src/common/utils";
import { ConfigService } from "@nestjs/config";
import {
  PublishedDataV4,
  PublishedDataV4Document,
} from "./schemas/published-data.v4.schema";
import {
  PartialUpdatePublishedDataV4Dto,
  UpdatePublishedDataV4Dto,
} from "./dto/update-published-data.v4.dto";
import { CreatePublishedDataV4Dto } from "./dto/create-published-data.v4.dto";

@Injectable({ scope: Scope.REQUEST })
export class PublishedDataV4Service {
  private doiConfigPath = "./src/config/doiconfig.local.json";

  constructor(
    @InjectModel(PublishedDataV4.name)
    private publishedDataModel: Model<PublishedDataV4Document>,
    private readonly httpService: HttpService,
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

  async create(
    createPublishedDataDto: CreatePublishedDataV4Dto,
  ): Promise<PublishedDataV4> {
    const username = (this.request.user as JWTUser).username;
    const createdPublished = new this.publishedDataModel(
      addCreatedByFields<CreatePublishedDataV4Dto>(
        createPublishedDataDto,
        username,
      ),
    );

    if (createdPublished.metadata) {
      createdPublished.metadata.publicationYear = new Date().getFullYear();
    }

    return createdPublished.save();
  }

  async findAll(filter: IPublishedDataFilters): Promise<PublishedDataV4[]> {
    const whereFilter: FilterQuery<PublishedDataV4Document> =
      filter.where ?? {};
    const fields = filter.fields ?? {};
    const filterQuery: FilterQuery<PublishedDataV4Document> =
      createFullqueryFilter<PublishedDataV4Document>(
        this.publishedDataModel,
        "doi",
        fields,
      );
    const whereClause: FilterQuery<PublishedDataV4Document> = {
      ...filterQuery,
      ...whereFilter,
    };
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    return this.publishedDataModel
      .find(whereClause)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async countDocuments(
    filter: FilterQuery<PublishedDataV4Document>,
    options?: object,
  ): Promise<ICount> {
    const whereFilter: FilterQuery<PublishedDataV4Document> =
      filter.where ?? {};
    const fields = filter.fields ?? {};
    const filterQuery: FilterQuery<PublishedDataV4Document> =
      createFullqueryFilter<PublishedDataV4Document>(
        this.publishedDataModel,
        "doi",
        fields,
      );
    const whereClause: FilterQuery<PublishedDataV4Document> = {
      ...filterQuery,
      ...whereFilter,
    };

    const count = await this.publishedDataModel
      .countDocuments(whereClause, options)
      .exec();
    return { count };
  }

  async findOne(
    filter: FilterQuery<PublishedDataV4Document>,
  ): Promise<PublishedDataV4 | null> {
    return this.publishedDataModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<PublishedDataV4Document>,
    updatePublishedDataDto: PartialUpdatePublishedDataV4Dto,
  ): Promise<PublishedDataV4 | null> {
    const username = (this.request.user as JWTUser).username;
    return this.publishedDataModel
      .findOneAndUpdate(
        filter,
        addUpdatedByField(updatePublishedDataDto, username),
        {
          new: true,
        },
      )
      .exec();
  }

  async remove(filter: FilterQuery<PublishedDataV4Document>): Promise<unknown> {
    return this.publishedDataModel.findOneAndDelete(filter).exec();
  }

  async resyncOAIPublication(
    id: string,
    publishedData: UpdatePublishedDataV4Dto,
    OAIServerUri: string,
  ): Promise<IRegister | null> {
    let doiProviderCredentials;

    // this can be improved on by validating doiProviderCredentials
    if (existsSync(this.doiConfigPath)) {
      doiProviderCredentials = JSON.parse(
        readFileSync(this.doiConfigPath).toString(),
      );
    } else {
      throw new HttpException(
        "doiConfigPath file not found",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const resyncOAIPublication = {
      method: "PUT",
      body: publishedData,
      json: true,
      uri: OAIServerUri + "/" + encodeURIComponent(encodeURIComponent(id)),
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      auth: doiProviderCredentials,
    };

    try {
      const res = await firstValueFrom(
        this.httpService.request({
          ...resyncOAIPublication,
          method: "PUT",
        }),
      );
      return res ? res.data : null;
    } catch (error: any) {
      handleAxiosRequestError(error, "PublishedDataController.resync");
      throw new HttpException(
        `Error occurred: ${error}`,
        error.response?.status || HttpStatus.FAILED_DEPENDENCY,
      );
    }
  }
}
