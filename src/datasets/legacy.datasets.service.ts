import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { IFilters } from "../common/interfaces/common.interface";
import { DatasetClass, DatasetDocument } from "./schemas/dataset.schema";
import { IDatasetFields } from "./interfaces/dataset-filters.interface";
import { Request } from "express";
import { JWTUser } from "../auth/interfaces/jwt-user.interface";
import { Action } from "../casl/action.enum";
import { CaslAbilityFactory } from "../casl/casl-ability.factory";
import {
  ConvertedDatasetInputType,
  ConvertedDatasetOutputType,
} from "./datatypes";
import { CreateRawDatasetObsoleteDto } from "./dto/create-raw-dataset-obsolete.dto";
import {
  PartialUpdateRawDatasetObsoleteDto,
  UpdateRawDatasetObsoleteDto,
} from "./dto/update-raw-dataset-obsolete.dto";
import { CreateDerivedDatasetObsoleteDto } from "./dto/create-derived-dataset-obsolete.dto";
import {
  PartialUpdateDerivedDatasetObsoleteDto,
  UpdateDerivedDatasetObsoleteDto,
} from "./dto/update-derived-dataset-obsolete.dto";
import { CreateDatasetDto } from "./dto/create-dataset.dto";
import {
  PartialUpdateDatasetDto,
  UpdateDatasetDto,
} from "./dto/update-dataset.dto";
import { DatasetsService } from "./datasets.service";
import { ConfigService } from "@nestjs/config";
import { OutputDatasetObsoleteDto } from "./dto/output-dataset-obsolete.dto";

@Injectable({ scope: Scope.REQUEST })
export class LegacyDatasetsService {
  private datasetCreationValidationEnabled;
  private datasetCreationValidationRegex;

  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private datasetsService: DatasetsService,
    private configService: ConfigService,
  ) {
    this.datasetCreationValidationEnabled = this.configService.get<boolean>(
      "datasetCreationValidationEnabled",
    );
    this.datasetCreationValidationRegex = this.configService.get<string>(
      "datasetCreationValidationRegex",
    );
  }

  getFilters(
    headers: Record<string, string>,
    queryFilter: { filter?: string },
  ) {
    let filters: IFilters<DatasetDocument, IDatasetFields> = {};
    // NOTE: If both headers and query filters are present return error because we don't want to support this scenario.
    if (queryFilter?.filter && (headers?.filter || headers?.where)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message:
            "Using two different types(query and headers) of filters is not supported and can result with inconsistencies",
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      try {
        if (queryFilter?.filter) {
          filters = JSON.parse(queryFilter.filter);
        } else if (headers?.filter) {
          filters = JSON.parse(headers.filter);
        } else if (headers?.where) {
          filters = JSON.parse(headers.where);
        }
      } catch (err) {
        const error = err as Error;
        throw new BadRequestException(
          `Invalid JSON in filter: ${error.message}`,
        );
      }
    }
    return filters;
  }

  updateMergedFiltersForList(
    request: Request,
    mergedFilters: IFilters<DatasetDocument, IDatasetFields>,
  ): IFilters<DatasetDocument, IDatasetFields> {
    const user: JWTUser = request.user as JWTUser;

    const ability = this.caslAbilityFactory.datasetInstanceAccess(user);
    const canViewAny = ability.can(Action.DatasetReadAny, DatasetClass);
    const canViewOwner = ability.can(Action.DatasetReadManyOwner, DatasetClass);
    const canViewAccess = ability.can(
      Action.DatasetReadManyAccess,
      DatasetClass,
    );
    const canViewPublic = ability.can(
      Action.DatasetReadManyPublic,
      DatasetClass,
    );

    if (!mergedFilters.where) {
      mergedFilters.where = {};
    }

    if (!canViewAny) {
      if (canViewAccess) {
        if (mergedFilters.where["$and"]) {
          mergedFilters.where["$and"].push({
            $or: [
              { ownerGroup: { $in: user.currentGroups } },
              { accessGroups: { $in: user.currentGroups } },
              { sharedWith: { $in: [user.email] } },
              { isPublished: true },
            ],
          });
        } else {
          mergedFilters.where["$and"] = [
            {
              $or: [
                { ownerGroup: { $in: user.currentGroups } },
                { accessGroups: { $in: user.currentGroups } },
                { sharedWith: { $in: [user.email] } },
                { isPublished: true },
              ],
            },
          ];
        }
      } else if (canViewOwner) {
        mergedFilters.where = {
          ...mergedFilters.where,
          ownerGroup: { $in: user.currentGroups },
        };
      } else if (canViewPublic) {
        mergedFilters.where = { isPublished: true };
      }
    }

    mergedFilters.where = this.convertObsoleteWhereFilterToCurrentSchema(
      mergedFilters.where,
    );

    return mergedFilters;
  }

  convertObsoleteWhereFilterToCurrentSchema(
    whereFilter: Record<string, unknown>,
  ): IFilters<DatasetDocument, IDatasetFields> {
    if ("proposalId" in whereFilter) {
      whereFilter.proposalIds = whereFilter.proposalId;
      delete whereFilter.proposalId;
    }
    if ("sampleId" in whereFilter) {
      whereFilter.sampleIds = whereFilter.sampleId;
      delete whereFilter.sampleId;
    }
    if ("instrumentId" in whereFilter) {
      whereFilter.instrumentIds = whereFilter.instrumentId;
      delete whereFilter.instrumentId;
    }
    if ("investigator" in whereFilter) {
      if (typeof whereFilter.investigator === "string") {
        whereFilter.principalInvestigators = {
          $in: [whereFilter.investigator],
        };
      } else {
        whereFilter.principalInvestigators = whereFilter.investigator;
      }

      delete whereFilter.investigator;
    }
    if ("principalInvestigator" in whereFilter) {
      if (typeof whereFilter.investigator === "string") {
        whereFilter.principalInvestigators = {
          $in: [whereFilter.principalInvestigator],
        };
      } else {
        whereFilter.principalInvestigators = whereFilter.principalInvestigator;
      }
      delete whereFilter.principalInvestigator;
    }

    return whereFilter;
  }

  convertObsoleteToCurrentSchema(
    inputObsoleteDataset: ConvertedDatasetInputType,
  ): ConvertedDatasetOutputType {
    const propertiesModifier: Record<string, unknown> = {};

    if ("proposalId" in inputObsoleteDataset) {
      propertiesModifier.proposalIds = [
        (inputObsoleteDataset as CreateRawDatasetObsoleteDto).proposalId,
      ];
    }
    if (
      inputObsoleteDataset instanceof CreateRawDatasetObsoleteDto ||
      inputObsoleteDataset instanceof UpdateRawDatasetObsoleteDto ||
      inputObsoleteDataset instanceof PartialUpdateRawDatasetObsoleteDto
    ) {
      if ("sampleId" in inputObsoleteDataset) {
        propertiesModifier.sampleIds = [
          (inputObsoleteDataset as CreateRawDatasetObsoleteDto).sampleId,
        ];
      }
      if ("instrumentId" in inputObsoleteDataset) {
        propertiesModifier.instrumentIds = [
          (inputObsoleteDataset as CreateRawDatasetObsoleteDto).instrumentId,
        ];
      }
      if ("principalInvestigator" in inputObsoleteDataset) {
        propertiesModifier.principalInvestigators = [
          (inputObsoleteDataset as CreateRawDatasetObsoleteDto)
            .principalInvestigator,
        ];
      }
    } else if (
      inputObsoleteDataset instanceof CreateDerivedDatasetObsoleteDto ||
      inputObsoleteDataset instanceof UpdateDerivedDatasetObsoleteDto ||
      inputObsoleteDataset instanceof PartialUpdateDerivedDatasetObsoleteDto
    ) {
      if ("investigator" in inputObsoleteDataset) {
        propertiesModifier.principalInvestigators = [
          (inputObsoleteDataset as CreateDerivedDatasetObsoleteDto)
            .investigator,
        ];
      }
    }

    let outputDataset:
      | CreateDatasetDto
      | UpdateDatasetDto
      | PartialUpdateDatasetDto = {};
    if (
      inputObsoleteDataset instanceof CreateRawDatasetObsoleteDto ||
      inputObsoleteDataset instanceof CreateDerivedDatasetObsoleteDto ||
      inputObsoleteDataset instanceof CreateDatasetDto
    ) {
      outputDataset = {
        ...(inputObsoleteDataset as CreateDatasetDto),
        ...propertiesModifier,
      } as CreateDatasetDto;
    } else if (
      inputObsoleteDataset instanceof UpdateRawDatasetObsoleteDto ||
      inputObsoleteDataset instanceof UpdateDerivedDatasetObsoleteDto ||
      inputObsoleteDataset instanceof UpdateDatasetDto
    ) {
      outputDataset = {
        ...(inputObsoleteDataset as UpdateDatasetDto),
        ...propertiesModifier,
      } as UpdateDatasetDto;
    } else if (
      inputObsoleteDataset instanceof PartialUpdateRawDatasetObsoleteDto ||
      inputObsoleteDataset instanceof PartialUpdateDerivedDatasetObsoleteDto ||
      inputObsoleteDataset instanceof PartialUpdateDatasetDto
    ) {
      outputDataset = {
        ...(inputObsoleteDataset as PartialUpdateDatasetDto),
        ...propertiesModifier,
      } as PartialUpdateDatasetDto;
    }

    return outputDataset;
  }

  async checkPermissionsForDatasetExtended(
    request: Request,
    id: string,
    group: Action,
  ) {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    const user: JWTUser = request.user as JWTUser;

    if (!dataset) {
      throw new NotFoundException(`dataset: ${id} not found`);
    }

    const datasetInstance =
      await this.generateDatasetInstanceForPermissions(dataset);

    const ability = this.caslAbilityFactory.datasetInstanceAccess(user);

    let canDoAction = false;

    if (group == Action.DatasetRead) {
      canDoAction =
        ability.can(Action.DatasetReadAny, DatasetClass) ||
        ability.can(Action.DatasetReadOneOwner, datasetInstance) ||
        ability.can(Action.DatasetReadOneAccess, datasetInstance) ||
        ability.can(Action.DatasetReadOnePublic, datasetInstance);
    } else if (group == Action.DatasetAttachmentRead) {
      canDoAction =
        ability.can(Action.DatasetAttachmentReadAny, DatasetClass) ||
        ability.can(Action.DatasetAttachmentReadOwner, datasetInstance) ||
        ability.can(Action.DatasetAttachmentReadAccess, datasetInstance) ||
        ability.can(Action.DatasetAttachmentReadPublic, datasetInstance);
    } else if (group == Action.DatasetAttachmentCreate) {
      canDoAction =
        ability.can(Action.DatasetAttachmentCreateAny, DatasetClass) ||
        ability.can(Action.DatasetAttachmentCreateOwner, datasetInstance);
    } else if (group == Action.DatasetAttachmentUpdate) {
      canDoAction =
        ability.can(Action.DatasetAttachmentUpdateAny, DatasetClass) ||
        ability.can(Action.DatasetAttachmentUpdateOwner, datasetInstance);
    } else if (group == Action.DatasetAttachmentDelete) {
      canDoAction =
        ability.can(Action.DatasetAttachmentDeleteAny, DatasetClass) ||
        ability.can(Action.DatasetAttachmentDeleteOwner, datasetInstance);
    } else if (group == Action.DatasetOrigdatablockRead) {
      canDoAction =
        ability.can(Action.DatasetOrigdatablockReadAny, DatasetClass) ||
        ability.can(Action.DatasetOrigdatablockReadOwner, datasetInstance) ||
        ability.can(Action.DatasetOrigdatablockReadAccess, datasetInstance) ||
        ability.can(Action.DatasetOrigdatablockReadPublic, datasetInstance);
    } else if (group == Action.DatasetOrigdatablockCreate) {
      canDoAction =
        ability.can(Action.DatasetOrigdatablockCreateAny, DatasetClass) ||
        ability.can(Action.DatasetOrigdatablockCreateOwner, datasetInstance);
    } else if (group == Action.DatasetOrigdatablockUpdate) {
      canDoAction =
        ability.can(Action.DatasetOrigdatablockUpdateAny, DatasetClass) ||
        ability.can(Action.DatasetOrigdatablockUpdateOwner, datasetInstance);
    } else if (group == Action.DatasetOrigdatablockDelete) {
      canDoAction =
        ability.can(Action.DatasetOrigdatablockDeleteAny, DatasetClass) ||
        ability.can(Action.DatasetOrigdatablockDeleteOwner, datasetInstance);
    } else if (group == Action.DatasetDatablockRead) {
      canDoAction =
        ability.can(Action.DatasetOrigdatablockReadAny, DatasetClass) ||
        ability.can(Action.DatasetDatablockReadOwner, datasetInstance) ||
        ability.can(Action.DatasetDatablockReadAccess, datasetInstance) ||
        ability.can(Action.DatasetDatablockReadPublic, datasetInstance);
    } else if (group == Action.DatasetDatablockCreate) {
      canDoAction =
        ability.can(Action.DatasetDatablockCreateAny, DatasetClass) ||
        ability.can(Action.DatasetDatablockCreateOwner, datasetInstance);
    } else if (group == Action.DatasetDatablockUpdate) {
      canDoAction =
        ability.can(Action.DatasetDatablockUpdateAny, DatasetClass) ||
        ability.can(Action.DatasetDatablockUpdateOwner, datasetInstance);
    } else if (group == Action.DatasetDatablockDelete) {
      canDoAction =
        ability.can(Action.DatasetDatablockDeleteAny, DatasetClass) ||
        ability.can(Action.DatasetDatablockDeleteOwner, datasetInstance);
    } else if (group == Action.DatasetLogbookRead) {
      canDoAction =
        ability.can(Action.DatasetLogbookReadAny, DatasetClass) ||
        ability.can(Action.DatasetLogbookReadOwner, datasetInstance);
    }
    if (!canDoAction) {
      throw new ForbiddenException("Unauthorized access");
    }

    return dataset;
  }

  async generateDatasetInstanceForPermissions(
    dataset:
      | CreateRawDatasetObsoleteDto
      | CreateDerivedDatasetObsoleteDto
      | CreateDatasetDto
      | DatasetClass,
  ): Promise<DatasetClass> {
    const datasetInstance = new DatasetClass();
    datasetInstance._id = "";
    datasetInstance.pid = dataset.pid || "";
    datasetInstance.accessGroups = dataset.accessGroups || [];
    datasetInstance.ownerGroup = dataset.ownerGroup;
    datasetInstance.sharedWith = dataset.sharedWith;
    datasetInstance.isPublished = dataset.isPublished || false;

    return datasetInstance;
  }

  async checkPermissionsForDatasetObsolete(request: Request, id: string) {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    const user: JWTUser = request.user as JWTUser;

    if (!dataset) {
      throw new NotFoundException(`dataset: ${id} not found`);
    }

    const datasetInstance =
      await this.generateDatasetInstanceForPermissions(dataset);

    const ability = this.caslAbilityFactory.datasetInstanceAccess(user);
    const canView =
      ability.can(Action.DatasetReadAny, DatasetClass) ||
      ability.can(Action.DatasetReadOneOwner, datasetInstance) ||
      ability.can(Action.DatasetReadOneAccess, datasetInstance) ||
      ability.can(Action.DatasetReadOnePublic, datasetInstance);

    if (!canView) {
      throw new ForbiddenException("Unauthorized access");
    }

    return dataset;
  }

  async checkPermissionsForObsoleteDatasetCreate(
    request: Request,
    dataset:
      | CreateRawDatasetObsoleteDto
      | CreateDerivedDatasetObsoleteDto
      | CreateDatasetDto,
  ) {
    const user: JWTUser = request.user as JWTUser;

    // NOTE: We need DatasetClass instance because casl module can not recognize the type from dataset mongo database model. If other fields are needed can be added later.
    const datasetInstance =
      await this.generateDatasetInstanceForPermissions(dataset);
    // instantiate the casl matrix for the user
    const ability = this.caslAbilityFactory.datasetInstanceAccess(user);
    // check if he/she can create this dataset
    const canCreate =
      ability.can(Action.DatasetCreateAny, DatasetClass) ||
      ability.can(Action.DatasetCreateOwnerNoPid, datasetInstance) ||
      ability.can(Action.DatasetCreateOwnerWithPid, datasetInstance);

    if (!canCreate) {
      throw new ForbiddenException("Unauthorized to create this dataset");
    }

    // now checks if we need to validate the pid
    if (
      this.datasetCreationValidationEnabled &&
      this.datasetCreationValidationRegex &&
      dataset.pid
    ) {
      const re = new RegExp(this.datasetCreationValidationRegex);

      if (!re.test(dataset.pid)) {
        throw new BadRequestException(
          "PID is not following required standards",
        );
      }
    }

    return dataset;
  }

  convertCurrentToObsoleteSchema(
    inputDataset: DatasetClass | null,
  ): OutputDatasetObsoleteDto {
    const propertiesModifier: Record<string, unknown> = {};
    if (inputDataset) {
      if ("proposalIds" in inputDataset && inputDataset.proposalIds?.length) {
        propertiesModifier.proposalId = inputDataset.proposalIds[0];
      }
      if ("sampleIds" in inputDataset && inputDataset.sampleIds?.length) {
        propertiesModifier.sampleId = inputDataset.sampleIds[0];
      }
      if (
        "instrumentIds" in inputDataset &&
        inputDataset.instrumentIds?.length
      ) {
        propertiesModifier.instrumentId = inputDataset.instrumentIds[0];
      }

      if (
        "principalInvestigators" in inputDataset &&
        inputDataset.principalInvestigators?.length
      ) {
        propertiesModifier.principalInvestigator =
          inputDataset.principalInvestigators[0];
      }

      if (inputDataset.type == "derived") {
        if (
          "investigator" in inputDataset &&
          inputDataset.principalInvestigators?.length
        ) {
          propertiesModifier.investigator =
            inputDataset.principalInvestigators[0];
        }
      }
    }

    const outputDataset: OutputDatasetObsoleteDto = {
      ...(inputDataset as DatasetDocument).toObject(),
      ...propertiesModifier,
    };

    return outputDataset;
  }
}
