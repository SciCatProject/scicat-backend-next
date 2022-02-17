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
  InternalServerErrorException,
} from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { CreatePublishedDataDto } from "./dto/create-published-data.dto";
import { UpdatePublishedDataDto } from "./dto/update-published-data.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
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
  IFormPopulateData,
  IPublishedDataFilters,
  IRegister,
} from "./interfaces/published-data.interface";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { RegisteredInterceptor } from "./interceptors/registered.interceptor";
import { FilterQuery } from "mongoose";
import { DatasetsService } from "src/datasets/datasets.service";
import { RawDataset } from "src/datasets/schemas/raw-dataset.schema";
import { ProposalsService } from "src/proposals/proposals.service";
import { AttachmentsService } from "src/attachments/attachments.service";
import { existsSync, readFileSync } from "fs";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { handleAxiosRequestError } from "src/common/utils";

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
  @CheckPolicies((ability: AppAbility) =>
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
  async findAll(@Query("filter") filter?: string): Promise<PublishedData[]> {
    const publishedDataFilters: IPublishedDataFilters = JSON.parse(
      filter ?? "{}",
    );
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
  async count(
    @Query() filter?: { filter: string; fields: string },
  ): Promise<ICount> {
    const jsonFilters: IPublishedDataFilters =
      filter && filter.filter ? JSON.parse(filter.filter) : {};
    const jsonFields: FilterQuery<PublishedDataDocument> =
      filter && filter.fields ? JSON.parse(filter.fields) : {};
    const whereFilters: FilterQuery<PublishedDataDocument> = {
      ...(jsonFilters && jsonFilters.where ? jsonFilters.where : {}),
      ...jsonFields,
    } ?? {
      ...jsonFields,
    };
    const publishedDataFilters: IPublishedDataFilters = {
      where: whereFilters,
    };
    if (jsonFilters && jsonFilters.limits) {
      publishedDataFilters.limits = jsonFilters.limits;
    }
    return this.publishedDataService.count(publishedDataFilters);
  }

  // GET /publisheddata/formpopulate
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, PublishedData),
  )
  @Get("/formpopulate")
  @ApiQuery({
    name: "pid",
    description: "Dataset pid used to fetch form data.",
    required: true,
  })
  async formPopulate(@Query("pid") pid: string) {
    const formData: IFormPopulateData = {};
    const dataset = await this.datasetsService.findOne({ pid });

    let proposalId;
    if (dataset) {
      formData.resourceType = dataset?.type;
      formData.description = dataset?.description;
      proposalId = (dataset as unknown as RawDataset).proposalId;
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
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, PublishedData),
  )
  @Get("/:id")
  async findOne(@Param("id") id: string): Promise<PublishedData | null> {
    return this.publishedDataService.findOne({ doi: id });
  }

  // PATCH /publisheddata/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, PublishedData),
  )
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updatePublishedDataDto: UpdatePublishedDataDto,
  ): Promise<PublishedData | null> {
    return this.publishedDataService.update(
      { doi: id },
      updatePublishedDataDto,
    );
  }

  // DELETE /publisheddata/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, PublishedData),
  )
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.publishedDataService.remove({ doi: id });
  }

  // POST /publisheddata/:id/register
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
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

      const path = "./src/config/doiconfig.local.json";

      if (existsSync(path)) {
        doiProviderCredentials = JSON.parse(readFileSync(path).toString());
      }

      const registerDataciteMetadataOptions = {
        method: "PUT",
        data: xml,
        url: registerMetadataUri,
        headers: {
          "content-type": "application/xml;charset=UTF-8",
        },
        auth: doiProviderCredentials,
      };

      const encodeDoi = encodeURIComponent(encodeURIComponent(fullDoi)); //Needed to make sure that the "/" between DOI prefix and ID stays encoded in datacite
      const registerDataciteDoiOptions = {
        method: "PUT",
        data: [
          "#Content-Type:text/plain;charset=UTF-8",
          `doi= ${fullDoi}`,
          `url= ${this.configService.get<string>(
            "publicURLprefix",
          )}${encodeDoi}`,
        ].join("\n"),
        url: registerDoiUri,
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
            this.httpService.request<IRegister>({
              ...registerDataciteMetadataOptions,
              method: "PUT",
            }),
          );
        } catch (err) {
          handleAxiosRequestError(err);
          return null;
        }

        try {
          await firstValueFrom(
            this.httpService.request({
              ...registerDataciteDoiOptions,
              method: "PUT",
            }),
          );
        } catch (err) {
          handleAxiosRequestError(err);
          return null;
        }

        try {
          await this.publishedDataService.update(
            { doi: publishedData.doi },
            data,
          );
        } catch (error) {
          console.error(error);
        }

        return res ? res.data : null;
      } else if (!this.configService.get<string>("oaiProviderRoute")) {
        throw new InternalServerErrorException(
          "oaiProviderRoute not specified in config",
        );
      } else {
        let res;
        try {
          res = await firstValueFrom(
            this.httpService.request<IRegister>({
              ...syncOAIPublication,
              method: "POST",
            }),
          );
        } catch (err) {
          handleAxiosRequestError(err);
          return null;
        }

        try {
          await this.publishedDataService.update(
            { doi: publishedData.doi },
            data,
          );
        } catch (error) {
          console.error(error);
        }

        return res ? res.data : null;
      }
    }
    return null;
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
        <resource xmlns="http://datacite.org/schema/kernel-4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4/metadata.xsd">
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
