import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  addCreatedByFields,
  addUpdatedByField,
  createFullfacetPipeline,
  createFullqueryFilter,
  extractMetadataKeys,
  parseLimitFilters,
} from "src/common/utils";
import { ElasticSearchService } from "src/elastic-search/elastic-search.service";
import { InitialDatasetsService } from "src/initial-datasets/initial-datasets.service";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { DatasetType } from "./dataset-type.enum";
import { CreateDatasetDto } from "./dto/create-dataset.dto";
import {
  PartialUpdateDatasetDto,
  UpdateDatasetDto,
} from "./dto/update-dataset.dto";
import {
  PartialUpdateDerivedDatasetDto,
  UpdateDerivedDatasetDto,
} from "./dto/update-derived-dataset.dto";
import {
  PartialUpdateRawDatasetDto,
  UpdateRawDatasetDto,
} from "./dto/update-raw-dataset.dto";
import { IDatasetFields } from "./interfaces/dataset-filters.interface";
import { DatasetClass, DatasetDocument } from "./schemas/dataset.schema";

@Injectable({ scope: Scope.REQUEST })
export class DatasetsService {
  private ESClient: ElasticSearchService | null;
  constructor(
    private configService: ConfigService,
    @InjectModel(DatasetClass.name)
    private datasetModel: Model<DatasetDocument>,
    private initialDatasetsService: InitialDatasetsService,
    private logbooksService: LogbooksService,
    @Inject(ElasticSearchService)
    private elasticSearchService: ElasticSearchService,
    @Inject(REQUEST) private request: Request,
  ) {
    if (this.elasticSearchService.connected) {
      this.ESClient = this.elasticSearchService;
    }
  }

  async create(createDatasetDto: CreateDatasetDto): Promise<DatasetDocument> {
    const username = (this.request.user as JWTUser).username;
    const createdDataset = new this.datasetModel(
      // insert created and updated fields
      addCreatedByFields(createDatasetDto, username),
    );
    if (this.ESClient) {
      await this.ESClient.updateInsertDocument(
        createdDataset.toObject() as DatasetDocument,
      );
    }
    return createdDataset.save();
  }

  async findAll(
    filter: IFilters<DatasetDocument, IDatasetFields>,
  ): Promise<DatasetClass[]> {
    const whereFilter: FilterQuery<DatasetDocument> = filter.where ?? {};
    const fieldsProjection: FilterQuery<DatasetDocument> = filter.fields ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);
    const datasetPromise = this.datasetModel
      .find(whereFilter, fieldsProjection)
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const datasets = await datasetPromise.exec();

    return datasets;
  }

  async fullquery(
    filter: IFilters<DatasetDocument, IDatasetFields>,
    extraWhereClause: FilterQuery<DatasetDocument> = {},
  ): Promise<DatasetClass[] | null> {
    let datasets;

    const filterQuery: FilterQuery<DatasetDocument> =
      createFullqueryFilter<DatasetDocument>(
        this.datasetModel,
        "pid",
        filter.fields as FilterQuery<DatasetDocument>,
      );

    const whereClause: FilterQuery<DatasetDocument> = {
      ...filterQuery,
      ...extraWhereClause,
    };
    const modifiers: QueryOptions = parseLimitFilters(filter.limits);

    const isFieldsEmpty = Object.keys(whereClause).length === 0;

    // NOTE: if Elastic search DB is empty we should use default mongo query
    const canPerformElasticSearchQueries = await this.isElasticSearchDBEmpty();

    if (!this.ESClient || isFieldsEmpty || !canPerformElasticSearchQueries) {
      datasets = await this.datasetModel
        .find(whereClause, null, modifiers)
        .exec();
    } else {
      const esResult = await this.ESClient.search(
        filter.fields as IDatasetFields,
        modifiers.limit,
        modifiers.skip,
        modifiers.sort,
      );

      datasets = await this.datasetModel
        .find({ _id: { $in: esResult.data } })
        .sort(modifiers.sort)
        .exec();
    }

    return datasets;
  }

  async fullFacet(
    filters: IFacets<IDatasetFields>,
  ): Promise<Record<string, unknown>[]> {
    let data;

    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];

    // NOTE: if fields contains no value, we should use mongo query to optimize performance.
    // however, fields always contain "mode" key, so we need to check if there's more than one key
    const isFieldsEmpty = Object.keys(fields).length === 1;

    // NOTE: if Elastic search DB is empty we should use default mongo query
    const canPerformElasticSearchQueries = await this.isElasticSearchDBEmpty();

    if (!this.ESClient || isFieldsEmpty || !canPerformElasticSearchQueries) {
      const pipeline = createFullfacetPipeline<DatasetDocument, IDatasetFields>(
        this.datasetModel,
        "pid",
        fields,
        facets,
        "",
      );

      data = await this.datasetModel.aggregate(pipeline).exec();
    } else {
      const facetResult = await this.ESClient.aggregate(fields);

      data = facetResult;
    }
    return data;
  }

  async updateAll(
    filter: FilterQuery<DatasetDocument>,
    updateDatasetDto: Record<string, unknown>,
  ): Promise<unknown> {
    return this.datasetModel.updateMany(filter, updateDatasetDto, {}).exec();
  }

  async findOne(
    filter: FilterQuery<DatasetDocument>,
  ): Promise<DatasetClass | null> {
    const whereFilter: FilterQuery<DatasetDocument> = filter.where ?? {};
    const fieldsProjection: FilterQuery<DatasetDocument> = filter.fields ?? {};

    return this.datasetModel.findOne(whereFilter, fieldsProjection).exec();
  }

  async count(
    filter: FilterQuery<DatasetDocument>,
  ): Promise<{ count: number }> {
    const whereFilter: FilterQuery<DatasetDocument> = filter.where ?? {};
    let count = 0;
    if (this.ESClient && !filter.where) {
      const totalDocCount = await this.datasetModel.countDocuments();

      const { totalCount } = await this.ESClient.search(
        whereFilter as IDatasetFields,
        totalDocCount,
      );
      count = totalCount;
    } else {
      count = await this.datasetModel.countDocuments(whereFilter).exec();
    }

    return { count };
  }

  // PUT dataset
  // we update the full dataset if exist or create a new one if it does not
  async findByIdAndReplace(
    id: string,
    updateDatasetDto:
      | UpdateDatasetDto
      | UpdateRawDatasetDto
      | UpdateDerivedDatasetDto,
  ): Promise<DatasetClass> {
    const username = (this.request.user as JWTUser).username;
    const existingDataset = await this.datasetModel.findOne({ pid: id }).exec();

    if (!existingDataset) {
      throw new NotFoundException();
    }
    // TODO: This might need a discussion.
    // NOTE: _id, pid and some other fields should not be touched in any case.
    const updatedDatasetInput = {
      ...updateDatasetDto,
      pid: existingDataset.pid,
      createdBy: existingDataset.createdBy,
      createdAt: existingDataset.createdAt,
      history: existingDataset.history,
    };
    const updatedDataset = await this.datasetModel
      .findOneAndReplace(
        { pid: id },
        addUpdatedByField(updatedDatasetInput, username),
        {
          new: true,
        },
      )
      .exec();

    // check if we were able to find the dataset and update it
    if (!updatedDataset) {
      throw new NotFoundException(`Dataset #${id} not found`);
    }

    if (this.ESClient) {
      await this.ESClient.updateInsertDocument(
        updatedDataset.toObject() as DatasetDocument,
      );
    }
    // we were able to find the dataset and update it
    return updatedDataset;
  }

  // PATCH dataset
  // we update only the fields that have been modified on an existing dataset
  async findByIdAndUpdate(
    id: string,
    updateDatasetDto:
      | PartialUpdateDatasetDto
      | PartialUpdateRawDatasetDto
      | PartialUpdateDerivedDatasetDto
      | UpdateQuery<DatasetDocument>,
  ): Promise<DatasetClass | null> {
    const existingDataset = await this.datasetModel.findOne({ pid: id }).exec();
    // check if we were able to find the dataset
    if (!existingDataset) {
      // no luck. we need to create a new dataset
      throw new NotFoundException(`Dataset #${id} not found`);
    }

    const username = (this.request.user as JWTUser).username;

    // NOTE: When doing findByIdAndUpdate in mongoose it does reset the subdocuments to default values if no value is provided
    // https://stackoverflow.com/questions/57324321/mongoose-overwriting-data-in-mongodb-with-default-values-in-subdocuments
    const patchedDataset = await this.datasetModel
      .findOneAndUpdate(
        { pid: id },
        addUpdatedByField(
          updateDatasetDto as UpdateQuery<DatasetDocument>,
          username,
        ),
        { new: true },
      )
      .exec();

    if (this.ESClient) {
      await this.ESClient.updateInsertDocument(
        patchedDataset?.toObject() as DatasetDocument,
      );
    }

    // we were able to find the dataset and update it
    return patchedDataset;
  }

  // DELETE dataset
  async findByIdAndDelete(id: string): Promise<DatasetClass | null> {
    if (this.ESClient) {
      await this.ESClient.deleteDocument(id);
    }
    return await this.datasetModel.findOneAndDelete({ pid: id });
  }
  // GET datasets without _id which is used for elastic search data synchronization
  async getDatasetsWithoutId() {
    try {
      const datasets = this.datasetModel.find({}, { _id: 0 }).lean().exec();
      return datasets;
    } catch (error) {
      throw new NotFoundException();
    }
  }
  // Get metadata keys
  async metadataKeys(
    filters: IFilters<DatasetDocument, IDatasetFields>,
  ): Promise<string[]> {
    const blacklist = [
      new RegExp(".*_date"),
      new RegExp("runNumber"),
      new RegExp("Entrych*."),
      new RegExp("entryCh*."),
      new RegExp("FMC-PICO*."),
      new RegExp("BW_measurement*."),
      new RegExp("Linearity_measurement*."),
      new RegExp("Pulse_measurement*."),
    ];

    // ensure that no more than MAXLIMIT someCollections are read for metadata key extraction
    let MAXLIMIT;
    if (this.configService.get<number>("metadataParentInstancesReturnLimit")) {
      MAXLIMIT = this.configService.get<number>(
        "metadataParentInstancesReturnLimit",
      );

      let lm;

      if (filters.limits) {
        lm = JSON.parse(JSON.stringify(filters.limits));
      } else {
        lm = {};
      }

      if (MAXLIMIT && lm.limit) {
        if (lm.limit > MAXLIMIT) {
          lm.limit = MAXLIMIT;
        }
      } else {
        lm.limit = MAXLIMIT;
      }
      filters.limits = lm;
    }

    const datasets = await this.fullquery(filters);

    const metadataKeys = extractMetadataKeys<DatasetClass>(
      datasets as unknown as DatasetClass[],
      "scientificMetadata",
    ).filter((key) => !blacklist.some((regex) => regex.test(key)));

    const metadataKey = filters.fields ? filters.fields.metadataKey : undefined;
    const returnLimit = this.configService.get<number>(
      "metadataKeysReturnLimit",
    );

    if (metadataKey && metadataKey.length > 0) {
      const filterKey = metadataKey.toLowerCase();
      return metadataKeys
        .filter((key) => key.toLowerCase().includes(filterKey))
        .slice(0, returnLimit);
    } else {
      return metadataKeys.slice(0, returnLimit);
    }
  }

  // this should update the history in all affected documents
  async keepHistory(req: Request) {
    // 4 different cases: (ctx.where:single/multiple instances)*(ctx.data: update of data/replacement of data)
    if (req.query.where && req.body) {
      // do not keep history for status updates from jobs, because this can take much too long for large jobs
      if (req.body.$set) {
        return;
      }

      const datasets = await this.findAll({
        where: JSON.parse(
          req.query.where as string,
        ) as FilterQuery<DatasetDocument>,
      });

      const dataCopy = JSON.parse(JSON.stringify(req.body));
      await Promise.all(
        datasets.map(async (dataset) => {
          req.body = JSON.parse(JSON.stringify(dataCopy));
          if (req.body && req.body.datasetlifecycle) {
            const changes = JSON.parse(
              JSON.stringify(req.body.datasetlifecycle),
            );
            req.body.datasetlifecycle = JSON.parse(
              JSON.stringify(dataset.datasetlifecycle),
            );
            for (const k in changes) {
              req.body.datasetlifecycle[k] = changes[k];
            }

            const initialDataset = await this.initialDatasetsService.findById(
              dataset.pid,
            );

            if (!initialDataset) {
              await this.initialDatasetsService.create({ _id: dataset.pid });
              await this.updateHistory(req, dataset as DatasetClass, dataCopy);
            } else {
              await this.updateHistory(req, dataset as DatasetClass, dataCopy);
            }
          }
        }),
      );
    }

    // single dataset, update
    if (!req.query.where && req.body.data) {
      Logger.warn(
        "Single dataset update case without where condition is currently not treated: " +
          req.body.data,
        "DatasetsService.keepHistory",
      );
      return;
    }

    // single dataset, update
    if (!req.query.where && !req.body.data) {
      return;
    }

    // single dataset, update
    if (req.query.where && !req.body.data) {
      return;
    }
  }

  async updateHistory(
    req: Request,
    dataset: DatasetClass,
    data: UpdateDatasetDto,
  ) {
    if (req.body.history) {
      delete req.body.history;
    }

    if (!req.body.size && !req.body.packedSize) {
      const updatedFields: Omit<UpdateDatasetDto, "updatedAt" | "updatedBy"> =
        data;
      const historyItem: Record<string, unknown> = {};
      Object.keys(updatedFields).forEach((updatedField) => {
        historyItem[updatedField as keyof UpdateDatasetDto] = {
          currentValue: data[updatedField as keyof UpdateDatasetDto],
          previousValue: dataset[updatedField as keyof UpdateDatasetDto],
        };
      });
      dataset.history = dataset.history ?? [];
      dataset.history.push({
        updatedBy: (req.user as JWTUser).username,
        ...JSON.parse(JSON.stringify(historyItem).replace(/\$/g, "")),
      });
      await this.findByIdAndUpdate(dataset.pid, { history: dataset.history });
      const logbookEnabled = this.configService.get<boolean>("logbook.enabled");
      if (logbookEnabled) {
        const user = (req.user as JWTUser).username.replace("ldap.", "");
        const datasetPid = dataset.pid;
        const proposalId =
          dataset.type === DatasetType.Raw
            ? (dataset as unknown as DatasetClass).proposalId
            : undefined;
        if (proposalId) {
          await Promise.all(
            Object.keys(updatedFields).map(async (updatedField) => {
              const message = `${user} updated "${updatedField}" of dataset with PID ${datasetPid}`;
              await this.logbooksService.sendMessage(proposalId, { message });
            }),
          );
        }
      }
    }
  }

  async isElasticSearchDBEmpty() {
    if (!this.ESClient) return;
    const count = await this.ESClient.getCount();
    return count.count > 0;
  }
}
