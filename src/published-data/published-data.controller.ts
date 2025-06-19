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
  Req,
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
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
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
  PublishedDataStatus,
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
import { Validator } from "jsonschema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { Request } from "express";

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
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @AllowAny()
  @Get("config")
  async getConfig(): Promise<Record<string, unknown> | null> {
    return this.publishedDataService.getConfig();
  }

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
    @Req() request: Request,
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

    const ability = this.caslAbilityFactory.datasetInstanceAccess(
      request.user as JWTUser,
    );

    if (ability.cannot(Action.accessAny, PublishedData)) {
      publishedDataFilters.where = {
        ...publishedDataFilters.where,
        $or: [
          { status: PublishedDataStatus.PUBLIC },
          { status: PublishedDataStatus.REGISTERED },
          {
            status: PublishedDataStatus.PRIVATE,
            createdBy: (request.user as JWTUser).username,
          },
        ],
      };
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
  async count(
    @Req() request: Request,
    @Query() filter?: { filter: string; fields: string },
  ) {
    const jsonFilters: IPublishedDataFilters = filter?.filter
      ? JSON.parse(filter.filter)
      : {};
    const jsonFields: FilterQuery<PublishedDataDocument> = filter?.fields
      ? JSON.parse(filter.fields)
      : {};

    const ability = this.caslAbilityFactory.datasetInstanceAccess(
      request.user as JWTUser,
    );

    if (ability.cannot(Action.accessAny, PublishedData)) {
      jsonFilters.where = {
        ...jsonFilters.where,
        $or: [
          { status: PublishedDataStatus.PUBLIC },
          { status: PublishedDataStatus.REGISTERED },
          {
            status: PublishedDataStatus.PRIVATE,
            createdBy: (request.user as JWTUser).username,
          },
        ],
      };
    }

    const filters: FilterQuery<PublishedDataDocument> = {
      where: jsonFilters.where,
      fields: jsonFields,
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
  @ApiResponse({
    status: HttpStatus.OK,
    type: PublishedData,
    isArray: false,
    description: "Return updated published data with id specified",
  })
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updatePublishedDataDto: PartialUpdatePublishedDataDto,
  ): Promise<PublishedData | null> {
    const publishedData = await this.publishedDataService.findOne({ doi: id });
    if (publishedData?.status !== PublishedDataStatus.PRIVATE) {
      throw new HttpException(
        `Published data can only be updated if it is in ${PublishedDataStatus.PRIVATE} state.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.publishedDataService.update(
      { doi: id },
      updatePublishedDataDto,
    );
  }

  // POST /publisheddata/:id/publish
  @UseGuards(PoliciesGuard)
  @CheckPolicies("publisheddata", (ability: AppAbility) =>
    ability.can(Action.Update, PublishedData),
  )
  @ApiResponse({
    status: HttpStatus.OK,
    type: PublishedData,
    isArray: false,
    description: "Return published data with id specified after publishing",
  })
  @Post("/:id/publish")
  async publish(@Param("id") id: string): Promise<PublishedData | null> {
    const publishedData = await this.publishedDataService.findOne({ doi: id });
    if (publishedData?.status !== PublishedDataStatus.PRIVATE) {
      throw new HttpException(
        `Published data can only be published if it is in ${PublishedDataStatus.PRIVATE} state.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.validateMetadata(publishedData.metadata);

    // Make datasets in publishedData datasetPids array public
    const datasetPids = publishedData.datasetPids;
    await Promise.all(
      datasetPids.map(async (pid) => {
        await this.datasetsService.findByIdAndUpdate(pid, {
          isPublished: true,
        });
      }),
    );

    return this.publishedDataService.update(
      { doi: id },
      { status: PublishedDataStatus.PUBLIC },
    );
  }

  async validateMetadata(metadata?: object) {
    const validator = new Validator();
    const metadataConfig = await this.getConfig();
    if (!metadataConfig?.metadataSchema) {
      throw new HttpException(
        "Published data schema is not defined in the configuration.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const validationResult = validator.validate(
      metadata,
      metadataConfig.metadataSchema,
    );

    if (!validationResult.valid) {
      throw new HttpException(
        validationResult.errors.map((error) => error.stack),
        HttpStatus.BAD_REQUEST,
      );
    }
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
        status: PublishedDataStatus.REGISTERED,
      };

      publishedData.registeredTime = data.registeredTime;
      publishedData.status = data.status;

      await this.validateMetadata(publishedData.metadata);

      // const xml = formRegistrationXML(publishedData);
      const jsonData = doiRegistrationJSON(publishedData);

      await Promise.all(
        publishedData.datasetPids.map(async (pid) => {
          await this.datasetsService.findByIdAndUpdate(pid, {
            isPublished: true,
            datasetlifecycle: { publishedOn: data.registeredTime },
          });
        }),
      );
      // const fullDoi = publishedData.doi;
      // const registerMetadataUri = this.configService.get<string>(
      //   "registerMetadataUri",
      // );
      const registerDoiUri = this.configService.get<string>("registerDoiUri");
      // const OAIServerUri = this.configService.get<string>("oaiProviderRoute");

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

      const authorization = `${doiProviderCredentials.username}:${doiProviderCredentials.password}`;

      // const registerDataciteMetadataOptions = {
      //   method: "PUT",
      //   data: xml,
      //   url: `${registerMetadataUri}/${fullDoi}`,
      //   headers: {
      //     "content-type": "application/xml;charset=UTF-8",
      //   },
      //   auth: doiProviderCredentials,
      // };

      // const encodeDoi = encodeURIComponent(encodeURIComponent(fullDoi)); //Needed to make sure that the "/" between DOI prefix and ID stays encoded in datacite
      // const registerDataciteDoiOptions = {
      //   method: "PUT",
      //   data: `#Content-Type:text/plain;charset=UTF-8\ndoi= ${fullDoi}\nurl=${this.configService.get<string>(
      //     "publicURLprefix",
      //   )}${encodeDoi}`,
      //   url: `${registerDoiUri}/${fullDoi}`,
      //   headers: {
      //     "content-type": "text/plain;charset=UTF-8",
      //   },
      //   auth: doiProviderCredentials,
      // };
      const registerDataciteDoiOptions = {
        method: "POST",
        url: `${registerDoiUri}`,
        headers: {
          accept: "application/vnd.api+json",
          "content-type": "application/json",
          authorization: `Basic ${Buffer.from(authorization).toString("base64")}`,
        },
        data: jsonData,
      };

      // const syncOAIPublication = {
      //   method: "POST",
      //   body: publishedData,
      //   json: true,
      //   uri: OAIServerUri,
      //   headers: {
      //     "content-type": "application/json;charset=UTF-8",
      //   },
      //   auth: doiProviderCredentials,
      // };

      // if (this.configService.get<string>("site") !== "PSI") {
      //   console.log("posting to datacite");
      //   console.log(registerDataciteMetadataOptions);
      //   console.log(registerDataciteDoiOptions);

      //   let res;
      //   try {
      //     res = await firstValueFrom(
      //       this.httpService.request({
      //         ...registerDataciteMetadataOptions,
      //         method: "PUT",
      //       }),
      //     );
      //   } catch (err: any) {
      //     handleAxiosRequestError(err, "PublishedDataController.register");
      //     throw new HttpException(
      //       `Error occurred: ${err}`,
      //       err.response.status || HttpStatus.FAILED_DEPENDENCY,
      //     );
      //   }

      //   try {
      //     await firstValueFrom(
      //       this.httpService.request({
      //         ...registerDataciteDoiOptions,
      //         method: "PUT",
      //       }),
      //     );
      //   } catch (err: any) {
      //     handleAxiosRequestError(err, "PublishedDataController.register");
      //     throw new HttpException(
      //       `Error occurred: ${err}`,
      //       err.response.status || HttpStatus.FAILED_DEPENDENCY,
      //     );
      //   }

      //   try {
      //     await this.publishedDataService.update(
      //       { doi: publishedData.doi },
      //       data,
      //     );
      //   } catch (error) {
      //     console.error(error);
      //   }

      //   return res ? { doi: res.data } : null;
      // } else if (!this.configService.get<string>("oaiProviderRoute")) {
      //   try {
      //     await this.publishedDataService.update(
      //       { doi: publishedData.doi },
      //       data,
      //     );
      //   } catch (error) {
      //     console.error(error);
      //   }

      //   console.warn(
      //     "results not pushed to oaiProvider as oaiProviderRoute route is not specified in the env variables",
      //   );

      //   throw new HttpException(
      //     "results not pushed to oaiProvider as oaiProviderRoute route is not specified in the env variables",
      //     HttpStatus.OK,
      //   );
      // } else {

      try {
        await firstValueFrom(
          this.httpService.request(registerDataciteDoiOptions),
        );
      } catch (err: any) {
        console.log("Error in registerDataciteDoiOptions", err);

        handleAxiosRequestError(err, "PublishedDataController.register");
        throw new HttpException(
          `Error occurred: ${err}`,
          err.response.status || HttpStatus.FAILED_DEPENDENCY,
        );
      }

      const res = await this.publishedDataService.update(
        { doi: publishedData.doi },
        { status: PublishedDataStatus.REGISTERED },
      );

      return res;
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
    const publishedData = await this.publishedDataService.findOne({ doi: id });
    if (publishedData?.status !== PublishedDataStatus.PRIVATE) {
      throw new HttpException(
        `Published data can only be updated if it is in ${PublishedDataStatus.PRIVATE} state.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const OAIServerUri = this.configService.get<string>("oaiProviderRoute");

    let returnValue = null;
    if (OAIServerUri) {
      returnValue = await this.publishedDataService.resyncOAIPublication(
        id,
        data,
        OAIServerUri,
      );
    }

    try {
      await this.publishedDataService.update({ doi: id }, data);
    } catch (error: any) {
      throw new HttpException(
        `Error occurred: ${error}`,
        error.response?.status || HttpStatus.FAILED_DEPENDENCY,
      );
    }

    return returnValue;
  }
}

function doiRegistrationJSON(publishedData: PublishedData): object {
  const { title, abstract, metadata, doi } = publishedData;
  const {
    creators,
    contributors,
    resourceType,
    publisher,
    publicationYear,
    subjects,
    descriptions,
    relatedItems,
    relatedIdentifiers,
    language,
    dates,
    sizes,
    formats,
    geoLocations,
    fundingReferences,
    landingPage,
  } = metadata || {};

  const descriptionsArray = [
    { description: abstract, descriptionType: "Abstract" },
    ...((descriptions as []) || []),
  ];

  const registrationData = {
    data: {
      type: "dois",
      attributes: {
        event: "publish",
        doi: doi,
        titles: [
          {
            lang: "en",
            title: title,
          },
        ],
        descriptions: descriptionsArray,
        publicationYear: publicationYear,
        subjects: subjects,
        creators: creators,
        publisher: publisher,
        contributors: contributors,
        types: { resourceTypeGeneral: "Dataset", resourceType: resourceType },
        relatedItems: relatedItems,
        relatedIdentifiers: relatedIdentifiers,
        language: language,
        dates: dates,
        sizes: sizes,
        formats: formats,
        geoLocations: geoLocations,
        fundingReferences: fundingReferences,
        url: `https://${landingPage}${encodeURIComponent(doi)}`,
      },
    },
  };

  return registrationData;
}

// function formRegistrationXML(publishedData: PublishedData): string {
//   const { title, abstract, metadata } = publishedData;
//   const { creators, resourceType, publisher, publicationYear } = metadata || {};
//   const doi = publishedData.doi;
//   if (!creators || !Array.isArray(creators)) {
//     return "";
//   }

//   const uniqueCreator = uniqBy(creators, "name");

//   const creatorElements = uniqueCreator.map((author) => {
//     const names = author.split(" ");
//     const firstName = names[0];
//     const lastName = names.slice(1).join(" ");
//     const affiliation = metadata?.affiliation || "";

//     return `
//             <creator>
//                 <creatorName>${lastName}, ${firstName}</creatorName>
//                 <givenName>${firstName}</givenName>
//                 <familyName>${lastName}</familyName>
//                 <affiliation>${affiliation}</affiliation>
//             </creator>
//         `;
//   });

//   return `<?xml version="1.0" encoding="UTF-8"?>
//         <resource xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://datacite.org/schema/kernel-4" xsi:schemaLocation="http://datacite.org/schema/kernel-4 https://schema.datacite.org/meta/kernel-4.4/metadata.xsd">
//             <identifier identifierType="doi">${doi}</identifier>
//             <creators>
//                 ${creatorElements.join("\n")}
//             </creators>
//             <titles>
//                 <title>${title}</title>
//             </titles>
//             <publisher>${publisher}</publisher>
//             <publicationYear>${publicationYear}</publicationYear>
//             <descriptions>
//                 <description xml:lang="en-us" descriptionType="Abstract">${abstract}</description>
//             </descriptions>
//             <resourceType resourceTypeGeneral="Dataset">${resourceType}</resourceType>
//         </resource>
//     `;
// }
