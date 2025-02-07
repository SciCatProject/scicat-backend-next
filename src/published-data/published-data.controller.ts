/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  HttpException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { CreatePublishedDataDto } from "./dto/create-published-data.dto";
import {
  PartialUpdatePublishedDataDto,
  UpdatePublishedDataDto,
} from "./dto/update-published-data.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import {
  PublishedData,
  PublishedDataDocument,
} from "./schemas/published-data.schema";
import {
  ICount,
  FormPopulateData,
  IPublishedDataFilters,
  IRegister,
} from "./interfaces/published-data.interface";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { RegisteredInterceptor } from "./interceptors/registered.interceptor";
import { FilterQuery, QueryOptions } from "mongoose";
import { DatasetsService } from "src/datasets/datasets.service";
import { ProposalsService } from "src/proposals/proposals.service";
import { AttachmentsService } from "src/attachments/attachments.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { handleAxiosRequestError } from "src/common/utils";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";

@ApiBearerAuth()
@ApiTags("published data")
@Controller("publisheddata")
export class PublishedDataController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly configService: ConfigService,
    private readonly datasetsService: DatasetsService,
    private readonly httpService: HttpService,
    private readonly proposalsService: ProposalsService,
    private readonly publishedDataService: PublishedDataService,
  ) {}

  // POST /publisheddata
  @UseGuards(PoliciesGuard)
  @CheckPolicies("publisheddata", (ability: AppAbility) =>
    ability.can(Action.Create, PublishedData),
  )
  @Post()
  async create(
    @Body() createPublishedDataDto: CreatePublishedDataDto,
  ): Promise<PublishedData> {
    return this.publishedDataService.create(createPublishedDataDto);
  }

  // GET /publisheddata
  @AllowAny()
  @UseInterceptors(RegisteredInterceptor)
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all published data",
    required: false,
  })
  @ApiQuery({
    name: "limits",
    description: "Database limits to apply when retrieve all published data",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PublishedData,
    isArray: true,
    description: "Results with a published documents array",
  })
  async findAll(
    @Query("filter") filter?: string,
    @Query("limits") limits?: string,
    @Query("fields") fields?: string,
  ) {
    const publishedDataFilters: IPublishedDataFilters = JSON.parse(
      filter ?? "{}",
    );
    const publishedDataLimits: {
      skip: number;
      limit: number;
      order: string;
    } = JSON.parse(limits ?? "{}");
    const publishedDataFields = JSON.parse(fields ?? "{}");

    if (!publishedDataFilters.limits) {
      publishedDataFilters.limits = publishedDataLimits;
    }
    if (!publishedDataFilters.fields) {
      publishedDataFilters.fields = publishedDataFields;
    }

    return this.publishedDataService.findAll(publishedDataFilters);
  }

  // GET /publisheddata/count
  @AllowAny()
  @UseInterceptors(RegisteredInterceptor)
  @Get("/count")
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve published data count",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ICount,
    isArray: false,
    description: "Results with a count of the published documents",
  })
  async count(@Query() filter?: { filter: string; fields: string }) {
    const jsonFilters: IPublishedDataFilters = filter?.filter
      ? JSON.parse(filter.filter)
      : {};
    const jsonFields: FilterQuery<PublishedDataDocument> = filter?.fields
      ? JSON.parse(filter.fields)
      : {};

    const filters: FilterQuery<PublishedDataDocument> = {
      ...jsonFilters.where,
      ...jsonFields,
    };

    const options: QueryOptions = {
      limit: jsonFilters?.limits?.limit,
      skip: jsonFilters?.limits?.skip,
    };

    return this.publishedDataService.countDocuments(filters, options);
  }

  // GET /publisheddata/formpopulate
  @UseGuards(PoliciesGuard)
  @CheckPolicies("publisheddata", (ability: AppAbility) =>
    ability.can(Action.Read, PublishedData),
  )
  @Get("/formpopulate")
  @ApiQuery({
    name: "pid",
    description: "Dataset pid used to fetch form data.",
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FormPopulateData,
    isArray: false,
    description: "Return form populate data",
  })
  async formPopulate(@Query("pid") pid: string) {
    const formData: FormPopulateData = {};
    const dataset = (await this.datasetsService.findOne({
      where: { pid },
    })) as unknown as DatasetClass;

    let proposalId;
    if (dataset) {
      formData.resourceType = dataset.type;
      formData.description = dataset.description;
      if ("proposalIds" in dataset) {
        proposalId = dataset.proposalIds![0];
      }
    }

    let proposal;
    if (proposalId) {
      proposal = await this.proposalsService.findOne({ proposalId });
    }

    if (proposal) {
      formData.title = proposal.title;
      formData.abstract = proposal.abstract;
    }

    const attachment = await this.attachmentsService.findOne({
      datasetId: pid,
    });

    if (attachment) {
      formData.thumbnail = attachment.thumbnail;
    }

    return formData;
  }

  // GET /publisheddata/:id
  @AllowAny()
  @ApiOperation({
    summary: "It returns the published data requested.",
    description:
      "It returns the published data requested through the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the published data to return",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PublishedData,
    isArray: false,
    description: "Return published data with id specified",
  })
  @Get("/:id")
  async findOne(@Param("id") id: string): Promise<PublishedData | null> {
    return this.publishedDataService.findOne({ doi: id });
  }

  // PATCH /publisheddata/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies("publisheddata", (ability: AppAbility) =>
    ability.can(Action.Update, PublishedData),
  )
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updatePublishedDataDto: PartialUpdatePublishedDataDto,
  ): Promise<PublishedData | null> {
    return this.publishedDataService.update(
      { doi: id },
      updatePublishedDataDto,
    );
  }

  // DELETE /publisheddata/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies("publisheddata", (ability: AppAbility) =>
    ability.can(Action.Delete, PublishedData),
  )
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.publishedDataService.remove({ doi: id });
  }

  // POST /publisheddata/:id/register
  @UseGuards(PoliciesGuard)
  @CheckPolicies("publisheddata", (ability: AppAbility) =>
    ability.can(Action.Update, PublishedData),
  )
  @Post("/:id/register")
  async register(@Param("id") id: string): Promise<IRegister | null> {
    const publishedData = await this.publishedDataService.findOne({ doi: id });

    if (publishedData) {
      const data = {
        registeredTime: new Date(),
        status: "registered",
      };

      publishedData.registeredTime = data.registeredTime;
      publishedData.status = data.status;

      const xml = formRegistrationXML(publishedData);

      await Promise.all(
        publishedData.pidArray.map(async (pid) => {
          await this.datasetsService.findByIdAndUpdate(pid, {
            isPublished: true,
            datasetlifecycle: { publishedOn: data.registeredTime },
          });
        }),
      );
      const fullDoi = publishedData.doi;
      const registerMetadataUri = this.configService.get<string>(
        "registerMetadataUri",
      );
      const registerDoiUri = this.configService.get<string>("registerDoiUri");
      const OAIServerUri = this.configService.get<string>("oaiProviderRoute");

      let doiProviderCredentials = {
        username: "removed",
        password: "removed",
      };

      const username = this.configService.get<string>("doiUsername");
      const password = this.configService.get<string>("doiPassword");

      if (username && password) {
        doiProviderCredentials = {
          username,
          password,
        };
      }

      const registerDataciteMetadataOptions = {
        method: "PUT",
        data: xml,
        url: `${registerMetadataUri}/${fullDoi}`,
        headers: {
          "content-type": "application/xml;charset=UTF-8",
        },
        auth: doiProviderCredentials,
      };

      const encodeDoi = encodeURIComponent(encodeURIComponent(fullDoi)); //Needed to make sure that the "/" between DOI prefix and ID stays encoded in datacite
      const registerDataciteDoiOptions = {
        method: "PUT",
        data: `#Content-Type:text/plain;charset=UTF-8\ndoi= ${fullDoi}\nurl=${this.configService.get<string>(
          "publicURLprefix",
        )}${encodeDoi}`,
        url: `${registerDoiUri}/${fullDoi}`,
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
        auth: doiProviderCredentials,
      };

      const syncOAIPublication = {
        method: "POST",
        body: publishedData,
        json: true,
        uri: OAIServerUri,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        auth: doiProviderCredentials,
      };

      if (this.configService.get<string>("site") !== "PSI") {
        console.log("posting to datacite");
        console.log(registerDataciteMetadataOptions);
        console.log(registerDataciteDoiOptions);

        let res;
        try {
          res = await firstValueFrom(
            this.httpService.request({
              ...registerDataciteMetadataOptions,
              method: "PUT",
            }),
          );
        } catch (err: any) {
          handleAxiosRequestError(err, "PublishedDataController.register");
          throw new HttpException(
            `Error occurred: ${err}`,
            err.response.status || HttpStatus.FAILED_DEPENDENCY,
          );
        }

        try {
          await firstValueFrom(
            this.httpService.request({
              ...registerDataciteDoiOptions,
              method: "PUT",
            }),
          );
        } catch (err: any) {
          handleAxiosRequestError(err, "PublishedDataController.register");
          throw new HttpException(
            `Error occurred: ${err}`,
            err.response.status || HttpStatus.FAILED_DEPENDENCY,
          );
        }

        try {
          await this.publishedDataService.update(
            { doi: publishedData.doi },
            data,
          );
        } catch (error) {
          console.error(error);
        }

        return res ? { doi: res.data } : null;
      } else if (!this.configService.get<string>("oaiProviderRoute")) {
        try {
          await this.publishedDataService.update(
            { doi: publishedData.doi },
            data,
          );
        } catch (error) {
          console.error(error);
        }

        console.warn(
          "results not pushed to oaiProvider as oaiProviderRoute route is not specified in the env variables",
        );

        throw new HttpException(
          "results not pushed to oaiProvider as oaiProviderRoute route is not specified in the env variables",
          HttpStatus.OK,
        );
      } else {
        let res;
        try {
          res = await firstValueFrom(
            this.httpService.request({
              ...syncOAIPublication,
              method: "POST",
            }),
          );
        } catch (err: any) {
          handleAxiosRequestError(err, "PublishedDataController.register");
          throw new HttpException(
            `Error occurred: ${err}`,
            err.response.status || HttpStatus.FAILED_DEPENDENCY,
          );
        }

        try {
          await this.publishedDataService.update(
            { doi: publishedData.doi },
            data,
          );
        } catch (error) {
          console.error(error);
        }

        return res ? { doi: res.data } : null;
      }
    }

    throw new NotFoundException();
  }

  // POST /publisheddata/:id/resync
  @UseGuards(PoliciesGuard)
  @CheckPolicies("publisheddata", (ability: AppAbility) =>
    ability.can(Action.Update, PublishedData),
  )
  @ApiOperation({
    summary: "Edits published data.",
    description:
      "It edits published data and resyncs with OAI Provider if it is defined.",
  })
  @ApiParam({
    name: "id",
    description: "The DOI of the published data.",
    type: String,
  })
  @ApiBody({
    description:
      "The edited data that will be updated in the database and with OAI Provider if defined.",
    type: UpdatePublishedDataDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    isArray: false,
    description:
      "Return the result of resync with OAI Provider if defined, or null.",
  })
  @Post("/:id/resync")
  async resync(
    @Param("id") id: string,
    @Body() data: UpdatePublishedDataDto,
  ): Promise<IRegister | null> {
    const { ...publishedData } = data;

    const OAIServerUri = this.configService.get<string>("oaiProviderRoute");

    let returnValue = null;
    if (OAIServerUri) {
      returnValue = await this.publishedDataService.resyncOAIPublication(
        id,
        publishedData,
        OAIServerUri,
      );
    }

    try {
      await this.publishedDataService.update({ doi: id }, publishedData);
    } catch (error: any) {
      throw new HttpException(
        `Error occurred: ${error}`,
        error.response?.status || HttpStatus.FAILED_DEPENDENCY,
      );
    }

    return returnValue;
  }
}

function formRegistrationXML(publishedData: PublishedData): string {
  const {
    affiliation,
    publisher,
    publicationYear,
    title,
    abstract,
    resourceType,
    creator,
  } = publishedData;
  const doi = publishedData.doi;
  const uniqueCreator = creator.filter(
    (author, i) => creator.indexOf(author) === i,
  );

  const creatorElements = uniqueCreator.map((author) => {
    const names = author.split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ");

    return `
            <creator>
                <creatorName>${lastName}, ${firstName}</creatorName>
                <givenName>${firstName}</givenName>
                <familyName>${lastName}</familyName>
                <affiliation>${affiliation}</affiliation>
            </creator>
        `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
        <resource xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://datacite.org/schema/kernel-4" xsi:schemaLocation="http://datacite.org/schema/kernel-4 https://schema.datacite.org/meta/kernel-4.4/metadata.xsd">
            <identifier identifierType="doi">${doi}</identifier>
            <creators>
                ${creatorElements.join("\n")}
            </creators>
            <titles>
                <title>${title}</title>
            </titles>
            <publisher>${publisher}</publisher>
            <publicationYear>${publicationYear}</publicationYear>
            <descriptions>
                <description xml:lang="en-us" descriptionType="Abstract">${abstract}</description>
            </descriptions>
            <resourceType resourceTypeGeneral="Dataset">${resourceType}</resourceType>
        </resource>
    `;
}
