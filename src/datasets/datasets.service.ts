import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import {
  FilterQuery,
  Model,
  PipelineStage,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  createNewFacetPipeline,
  extractMetadataKeys,
  mapScientificQuery,
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
import { DerivedDataset } from "./schemas/derived-dataset.schema";
import { RawDataset } from "./schemas/raw-dataset.schema";

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
    const { limit, skip, sort } = parseLimitFilters<
      DerivedDataset | RawDataset
    >(filter.limits);

    return this.datasetModel
      .find(whereFilter)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(
    filter: IFilters<DatasetDocument, IDatasetFields>,
  ): Promise<Dataset[] | null> {
    const modifiers: QueryOptions = {};
    let filterQuery: FilterQuery<DatasetDocument> = {};

    if (!this.datasetModel.discriminators) {
      throw new InternalServerErrorException();
    }

    const derivedDatasetModel =
      this.datasetModel.discriminators[DatasetType.Derived];
    const rawDatasetModel = this.datasetModel.discriminators[DatasetType.Raw];

    if (filter) {
      const { limit, skip, sort } = parseLimitFilters(filter.limits);
      modifiers.limit = limit;
      modifiers.skip = skip;
      modifiers.sort = sort;

      if (filter.fields) {
        if (filter.fields.mode) {
          const idField = "pid";
          const currentExpression = JSON.parse(
            JSON.stringify(filter.fields.mode),
          );
          if (idField in currentExpression) {
            currentExpression["pid"] = currentExpression[idField];
            delete currentExpression[idField];
          }
          filterQuery = currentExpression;
        }
        if (filter.fields.text) {
          filterQuery.$text = { $search: filter.fields.text };
        }
        if (filter.fields.creationTime) {
          const { begin, end } = filter.fields.creationTime;
          filterQuery.creationTime = {
            $gte: new Date(begin),
            $lte: new Date(end),
          };
        }
        if (filter.fields.creationLocation) {
          filterQuery.creationLocation = {
            $in: filter.fields.creationLocation,
          };
        }
        if (filter.fields.ownerGroup) {
          filterQuery.ownerGroup = { $in: filter.fields.ownerGroup };
        }
        if (filter.fields.keywords) {
          filterQuery.keywords = { $in: filter.fields.keywords };
        }
        if (filter.fields.isPublished) {
          filterQuery.isPublished = {
            $eq: filter.fields.isPublished,
          };
        }
        if (filter.fields.scientific) {
          filterQuery = {
            ...filterQuery,
            ...mapScientificQuery(filter.fields.scientific),
          };
        }
        if (filter.fields.type) {
          filterQuery.type = { $in: filter.fields.type };
          const [type] = filter.fields.type;

          switch (type) {
            case DatasetType.Derived: {
              return derivedDatasetModel
                .find(filterQuery, null, modifiers)
                .exec();
            }
            case DatasetType.Raw: {
              return rawDatasetModel.find(filterQuery, null, modifiers).exec();
            }
          }
        }
      }
    }

    const derivedDatasets = await derivedDatasetModel
      .find(filterQuery, null, modifiers)
      .exec();
    const rawDatasets = await rawDatasetModel
      .find(filterQuery, null, modifiers)
      .exec();
    let datasets = ([] as Dataset[]).concat(derivedDatasets, rawDatasets);

    if (modifiers.sort) {
      const sortField = Object.keys(modifiers.sort)[0] as keyof Dataset;
      const order = modifiers.sort[sortField];
      datasets = datasets.sort((a, b) => {
        if (order === "asc") {
          return a[sortField] < b[sortField]
            ? 1
            : a[sortField] > b[sortField]
            ? -1
            : 0;
        } else {
          return a[sortField] < b[sortField]
            ? -1
            : a[sortField] > b[sortField]
            ? 1
            : 0;
        }
      });
    }

    return datasets.slice(0, modifiers.limit);
  }

  async fullFacet(
    filters: IFacets<IDatasetFields>,
  ): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];
    const pipeline = [];
    const facetMatch: Record<string, unknown> = {};
    const allMatch = [];
    Object.keys(fields).forEach((key) => {
      if (facets.indexOf(key) < 0) {
        if (key === "text") {
          if (typeof fields[key] === "string") {
            const match = {
              $match: {
                $or: [
                  {
                    $text: this.searchExpression(key, String(fields[key])),
                  },
                ],
              },
            };
            pipeline.unshift(match);
          }
        } else if (key === "_id") {
          const match = {
            $match: {
              _id: this.searchExpression(key, fields[key]),
            },
          };
          allMatch.push(match);
          pipeline.push(match);
        } else if (key === "mode") {
          // substitute potential id field in fields
          const idField = "pid";
          const currentExpression = JSON.parse(JSON.stringify(fields[key]));
          if (idField in currentExpression) {
            currentExpression["pid"] = currentExpression[idField];
            delete currentExpression[idField];
          }
          const match = {
            $match: currentExpression,
          };
          allMatch.push(match);
          pipeline.push(match);
        } else if (key === "userGroups") {
          if (
            fields.userGroups &&
            fields.userGroups.indexOf("globalaccess") < 0 &&
            "ownerGroup" in this.datasetModel.schema.paths
          ) {
            const match = {
              $match: {
                $or: [
                  {
                    ownerGroup: this.searchExpression(
                      "ownerGroup",
                      fields["userGroups"],
                    ),
                  },
                  {
                    accessGroups: this.searchExpression(
                      "accessGroups",
                      fields["userGroups"],
                    ),
                  },
                ],
              },
            };
            allMatch.push(match);
            pipeline.push(match);
          }
        } else if (key === "scientific") {
          const match = {
            $match: mapScientificQuery(fields[key] ?? []),
          };
          allMatch.push(match);
          pipeline.push(match);
        } else {
          const match: Record<string, unknown> = {};
          match[key] = this.searchExpression(key, fields[key] as unknown);
          const m = {
            $match: match,
          };
          allMatch.push(m);
          pipeline.push(m);
        }
      } else {
        facetMatch[key] = this.searchExpression(key, fields[key]);
      }
    });

    // append all facet pipelines
    const facetObject: Record<string, PipelineStage[]> = {};
    facets.forEach((facet) => {
      if (!this.datasetModel.schema.discriminators) {
        return;
      }
      if (
        facet in this.datasetModel.schema.discriminators[DatasetType.Raw].paths
      ) {
        facetObject[facet] = createNewFacetPipeline(
          facet,
          this.schemaTypeOf(facet),
          facetMatch,
        );
        return;
      } else if (
        facet in
        this.datasetModel.schema.discriminators[DatasetType.Derived].paths
      ) {
        facetObject[facet] = createNewFacetPipeline(
          facet,
          this.schemaTypeOf(facet),
          facetMatch,
        );
        return;
      }

      if (facet.startsWith("datasetlifecycle.")) {
        const lifecycleFacet = facet.split(".")[1];
        facetObject[lifecycleFacet] = createNewFacetPipeline(
          lifecycleFacet,
          this.schemaTypeOf(lifecycleFacet),
          facetMatch,
        );
        return;
      } else {
        Logger.warn(
          `Warning: Facet not part of any model: ${facet}`,
          "DatasetsService",
        );
        return;
      }
    });

    facetObject["all"] = [
      {
        $match: facetMatch,
      },
      {
        $count: "totalSets",
      },
    ];
    pipeline.push({ $facet: facetObject });

    const results = await this.datasetModel
      .aggregate(pipeline as PipelineStage[])
      .exec();
    return results;
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

    if (!this.datasetModel.discriminators) {
      throw new InternalServerErrorException();
    }

    const typedDatasetModel =
      this.datasetModel.discriminators[existingDataset.type];

    const patchedDataset = typedDatasetModel
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

    const metadataKeys = extractMetadataKeys<RawDataset | DerivedDataset>(
      datasets as unknown as (RawDataset | DerivedDataset)[],
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

  private schemaTypeOf(key: string, value: unknown = null): string {
    let property = this.datasetModel.schema.path(key);

    if (!this.datasetModel.discriminators) {
      throw new InternalServerErrorException();
    }

    if (!property) {
      property =
        this.datasetModel.discriminators[DatasetType.Raw].schema.path(key);
    }

    if (!property) {
      property =
        this.datasetModel.discriminators[DatasetType.Derived].schema.path(key);
    }

    if (!property) {
      if ("begin" in (value as Record<string, unknown>)) {
        return "Date";
      } else {
        return "String";
      }
    } else {
      return property.instance;
    }
  }

  private searchExpression(fieldName: string, value: unknown): unknown {
    if (fieldName === "text") {
      return { $search: value };
    }

    const valueType = this.schemaTypeOf(fieldName, value);

    if (valueType === "String") {
      if (Array.isArray(value)) {
        if (value.length == 1) {
          return value[0];
        } else {
          return {
            $in: value,
          };
        }
      } else {
        return value;
      }
    } else if (valueType === "Date") {
      return {
        $gte: new Date((value as Record<string, string | Date>).begin),
        $lte: new Date((value as Record<string, string | Date>).end),
      };
    } else if (valueType === "Boolean") {
      return {
        $eq: value,
      };
    } else if (Array.isArray(value)) {
      return {
        $in: value,
      };
    } else {
      return value;
    }
  }

  // this should update the history in all affected documents
  async keepHistory(req: Request) {
    // 4 different cases: (ctx.where:single/multiple instances)*(ctx.data: update of data/replacement of data)
    if (req.query.where && req.body.data) {
      // do not keep history for status updates from jobs, because this can take much too long for large jobs
      if (req.body.data.$set) {
        return;
      }

      const datasets = await this.findAll({
        where: req.query.where as FilterQuery<DatasetDocument>,
      });

      const dataCopy = JSON.parse(JSON.stringify(req.body.data));
      await Promise.all(
        datasets.map(async (dataset) => {
          req.body.data = JSON.parse(JSON.stringify(dataCopy));
          if (req.body.data && req.body.data.datasetlifecycle) {
            const changes = JSON.parse(
              JSON.stringify(req.body.data.datasetlifecycle),
            );
            req.body.data.datasetlifecycle = JSON.parse(
              JSON.stringify(dataset.datasetlifecycle),
            );
            for (const k in changes) {
              req.body.data.datasetlifecycle[k] = changes[k];
            }

            const initialDataset = await this.initialDatasetsService.findById(
              dataset.pid,
            );

            if (!initialDataset) {
              await this.initialDatasetsService.create(dataset);
              await this.updateHistory(req, dataset, dataCopy);
            } else {
              await this.updateHistory(req, dataset, dataCopy);
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
    if (req.body.data.history) {
      delete req.body.data.history;
    }

    if (!req.body.data.size && !req.body.data.packedSize) {
      const updatedFields: Omit<UpdateDatasetDto, "updatedAt" | "updatedBy"> =
        data;
      const historyItem: Record<string, unknown> = {};
      Object.keys(updatedFields).forEach((updatedField) => {
        historyItem[updatedField as keyof UpdateDatasetDto] = {
          currentValue: data[updatedField as keyof UpdateDatasetDto],
          previousValue: dataset[updatedField as keyof UpdateDatasetDto],
        };
      });
      dataset.history.push(
        JSON.parse(JSON.stringify(historyItem).replace(/\$/g, "")),
      );
      await this.findByIdAndUpdate(dataset.pid, { history: dataset.history });
      const logbookEnabled = this.configService.get<boolean>("logbook.enabled");
      if (logbookEnabled) {
        const user = (req.user as JWTUser).username.replace("ldap.", "");
        const datasetPid = dataset.pid;
        const proposalId =
          dataset.type === DatasetType.Raw
            ? (dataset as unknown as RawDataset).proposalId
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
