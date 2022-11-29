import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  createFullfacetPipeline,
  createFullqueryFilter,
  extractMetadataKeys,
  parseLimitFilters,
} from "src/common/utils";
import { InitialDatasetsService } from "src/initial-datasets/initial-datasets.service";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { DatasetType } from "./dataset-type.enum";
import { CreateDatasetDto } from "./dto/create-dataset.dto";
import { CreateDerivedDatasetDto } from "./dto/create-derived-dataset.dto";
import { CreateRawDatasetDto } from "./dto/create-raw-dataset.dto";
import { UpdateDatasetDto } from "./dto/update-dataset.dto";
import { UpdateDerivedDatasetDto } from "./dto/update-derived-dataset.dto";
import { UpdateRawDatasetDto } from "./dto/update-raw-dataset.dto";
import { IDatasetFields } from "./interfaces/dataset-filters.interface";
import { Dataset, DatasetDocument } from "./schemas/dataset.schema";
/* import {
  DerivedDataset,
  DerivedDatasetDocument,
} from "./schemas/derived-dataset.schema";
import { RawDataset, RawDatasetDocument } from "./schemas/raw-dataset.schema";
 */

@Injectable()
export class DatasetsService {
  constructor(
    private configService: ConfigService,
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
    private initialDatasetsService: InitialDatasetsService,
    private logbooksService: LogbooksService,
  ) {}

  async create(createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    const createdDataset = new this.datasetModel(createDatasetDto);
    return createdDataset.save();
  }

  async findAll(
    filter: IFilters<DatasetDocument, IDatasetFields>,
  ): Promise<Dataset[]> {
    const whereFilter: FilterQuery<DatasetDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    /* const t2 = await this.datasetModel
      .find()
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
 */
    const t1 = this.datasetModel
      .find(whereFilter)
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const t3 = await t1.exec();

    return t3;
  }

  async fullquery(
    filter: IFilters<DatasetDocument, IDatasetFields>,
  ): Promise<Dataset[] | null> {
    const filterQuery: FilterQuery<DatasetDocument> =
      createFullqueryFilter<DatasetDocument>(
        this.datasetModel,
        "pid",
        filter.fields as FilterQuery<DatasetDocument>,
      );
    const modifiers: QueryOptions = parseLimitFilters(filter.limits);

    const datasets = await this.datasetModel
      .find(filterQuery, null, modifiers)
      .exec();

    return datasets;
  }

  async fullFacet(
    filters: IFacets<IDatasetFields>,
  ): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];

    const pipeline = createFullfacetPipeline<DatasetDocument, IDatasetFields>(
      this.datasetModel,
      "pid",
      fields,
      facets,
    );

    return await this.datasetModel.aggregate(pipeline).exec();
  }

  async updateAll(
    filter: FilterQuery<DatasetDocument>,
    updateDatasetDto: Record<string, unknown>,
  ): Promise<unknown> {
    return this.datasetModel
      .updateMany(filter, updateDatasetDto, { new: true })
      .exec();
  }

  async findOne(
    filters: FilterQuery<DatasetDocument>,
  ): Promise<Dataset | null> {
    return this.datasetModel.findOne(filters).exec();
  }

  async count(where: FilterQuery<DatasetDocument>): Promise<{ count: number }> {
    const count = await this.datasetModel.count(where).exec();
    return { count };
  }

  // PUT dataset
  // we update the full dataset if exist or create a new one if it does not
  async findByIdAndReplaceOrCreate(
    id: string,
    createDatasetDto:
      | CreateDatasetDto
      | CreateRawDatasetDto
      | CreateDerivedDatasetDto,
  ): Promise<Dataset> {
    const existingDataset = await this.datasetModel
      .findOneAndUpdate(
        { pid: id },
        createDatasetDto as UpdateQuery<DatasetDocument>,
        { new: true },
      )
      .exec();

    // check if we were able to find the dataset and update it
    if (!existingDataset) {
      // no luck. we need to create a new dataset with the provided id
      const createdDataset = new this.datasetModel(createDatasetDto);
      createdDataset.set("pid", id);
      return await createdDataset.save();
    }

    // we were able to find the dataset and update it
    return existingDataset;
  }

  // PATCH dataset
  // we update only the fields that have been modified on an existing dataset
  async findByIdAndUpdate(
    id: string,
    updateDatasetDto:
      | UpdateDatasetDto
      | UpdateRawDatasetDto
      | UpdateDerivedDatasetDto
      | UpdateQuery<DatasetDocument>,
  ): Promise<Dataset | null> {
    const existingDataset = await this.datasetModel.findOne({ pid: id }).exec();
    // check if we were able to find the dataset
    if (!existingDataset) {
      // no luck. we need to create a new dataset
      throw new NotFoundException(`Dataset #${id} not found`);
    }

    const patchedDataset = this.datasetModel
      .findOneAndUpdate(
        { pid: id },
        updateDatasetDto as UpdateQuery<DatasetDocument>,
        { new: true },
      )
      .exec();

    // we were able to find the dataset and update it
    return patchedDataset;
  }

  // DELETE dataset
  async findByIdAndDelete(id: string): Promise<Dataset | null> {
    return await this.datasetModel.findOneAndRemove({ pid: id });
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

    const datasets = await this.findAll(filters);

    const metadataKeys = extractMetadataKeys<Dataset>(
      datasets as unknown as Dataset[],
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
              await this.updateHistory(req, dataset as Dataset, dataCopy);
            } else {
              await this.updateHistory(req, dataset as Dataset, dataCopy);
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

  async updateHistory(req: Request, dataset: Dataset, data: UpdateDatasetDto) {
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
            ? (dataset as unknown as Dataset).proposalId
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
}
