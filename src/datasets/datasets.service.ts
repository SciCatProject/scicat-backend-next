import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { mapScientificQuery } from 'src/common/utils';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { CreateDerivedDatasetDto } from './dto/create-derived-dataset.dto';
import { CreateRawDatasetDto } from './dto/create-raw-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { UpdateDerivedDatasetDto } from './dto/update-derived-dataset.dto';
import { UpdateRawDatasetDto } from './dto/update-raw-dataset.dto';
import {
  IDatasetFacets,
  IDatasetFilters,
} from './interfaces/dataset-filters.interface';
import {
  Dataset,
  DatasetDocument,
  DatasetType,
} from './schemas/dataset.schema';

@Injectable()
export class DatasetsService {
  constructor(
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
  ) {}

  async create(createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    const createdDataset = new this.datasetModel(createDatasetDto);
    return createdDataset.save();
  }

  async findAll(filter: IDatasetFilters): Promise<Dataset[]> {
    let modifiers: QueryOptions = {};
    let filterQuery: FilterQuery<DatasetDocument> = {};

    const derivedDatasetModel =
      this.datasetModel.discriminators[DatasetType.Derived];
    const rawDatasetModel = this.datasetModel.discriminators[DatasetType.Raw];

    if (filter) {
      if (filter.limits) {
        if (filter.limits.limit) {
          modifiers.limit = filter.limits.limit;
        }
        if (filter.limits.skip) {
          modifiers.skip = filter.limits.skip;
        }
        if (filter.limits.order) {
          const [field, direction] = filter.limits.order.split(':');
          const sort = { [field]: direction };
          modifiers = { ...filter.limits, sort };
        }
      }

      if (filter.fields) {
        if (filter.fields.mode) {
          const idField = '_id';
          const currentExpression = JSON.parse(
            JSON.stringify(filter.fields.mode),
          );
          if (idField in currentExpression) {
            currentExpression['_id'] = currentExpression[idField];
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
    return [].concat(derivedDatasets, rawDatasets);
  }

  async fullFacet(filters?: IDatasetFacets): Promise<any[]> {
    const { fields, facets } = filters;
    const pipeline = [];
    const facetMatch = {};
    const allMatch = [];
    Object.keys(fields).forEach((key) => {
      if (facets.indexOf(key) < 0) {
        if (key === 'text') {
          if (typeof fields[key] === 'string') {
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
        } else if (key === '_id') {
          const match = {
            $match: {
              _id: this.searchExpression(key, fields[key]),
            },
          };
          allMatch.push(match);
          pipeline.push(match);
        } else if (key === 'mode') {
          // substitute potential id field in fields
          const idField = '_id';
          const currentExpression = JSON.parse(JSON.stringify(fields[key]));
          if (idField in currentExpression) {
            currentExpression['_id'] = currentExpression[idField];
            delete currentExpression[idField];
          }
          const match = {
            $match: currentExpression,
          };
          allMatch.push(match);
          pipeline.push(match);
        } else if (key === 'userGroups') {
          if (
            fields['userGroups'].indexOf('globalaccess') < 0 &&
            'ownerGroup' in this.datasetModel.schema.paths
          ) {
            const match = {
              $match: {
                $or: [
                  {
                    ownerGroup: this.searchExpression(
                      'ownerGroup',
                      fields['userGroups'],
                    ),
                  },
                  {
                    accessGroups: this.searchExpression(
                      'accessGroups',
                      fields['userGroups'],
                    ),
                  },
                ],
              },
            };
            allMatch.push(match);
            pipeline.push(match);
          }
        } else if (key === 'scientific') {
          const match = {
            $match: mapScientificQuery(fields[key]),
          };
          allMatch.push(match);
          pipeline.push(match);
        } else {
          const match = {};
          match[key] = this.searchExpression(key, fields[key]);
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
    const facetObject = {};
    facets.forEach((facet) => {
      if (
        facet in this.datasetModel.schema.discriminators[DatasetType.Raw].paths
      ) {
        facetObject[facet] = this.createNewFacetPipeline(
          facet,
          this.schemaTypeOf(facet),
          facetMatch,
        );
        return;
      } else if (
        facet in
        this.datasetModel.schema.discriminators[DatasetType.Derived].paths
      ) {
        facetObject[facet] = this.createNewFacetPipeline(
          facet,
          this.schemaTypeOf(facet),
          facetMatch,
        );
        return;
      }

      if (facet.startsWith('datasetlifecycle.')) {
        const lifecycleFacet = facet.split('.')[1];
        facetObject[lifecycleFacet] = this.createNewFacetPipeline(
          lifecycleFacet,
          this.schemaTypeOf(lifecycleFacet),
          facetMatch,
        );
        return;
      } else {
        Logger.warn(
          `Warning: Facet not part of any model: ${facet}`,
          'DatasetsService',
        );
        return;
      }
    });

    facetObject['all'] = [
      {
        $match: facetMatch,
      },
      {
        $count: 'totalSets',
      },
    ];
    pipeline.push({ $facet: facetObject });

    const results = await this.datasetModel.aggregate(pipeline).exec();
    return results;
  }

  async findById(id: string): Promise<Dataset> {
    return this.datasetModel.findById(id).exec();
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
      .findByIdAndUpdate(id, createDatasetDto, { new: true })
      .exec();

    // check if we were able to find the dataset and update it
    if (!existingDataset) {
      // no luck. we need to create a new dataset with the provided id
      const createdDataset = new this.datasetModel(createDatasetDto);
      createdDataset.set('_id', id);
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
      | UpdateDerivedDatasetDto,
  ): Promise<Dataset> {
    const existingDataset = await this.datasetModel.findById(id).exec();

    // check if we were able to find the dataset
    if (!existingDataset) {
      // no luck. we need to create a new dataset
      throw new NotFoundException(`Dataset #${id} not found`);
    }

    const typedDatasetModel =
      this.datasetModel.discriminators[existingDataset.type];

    const patchedDataset = typedDatasetModel
      .findByIdAndUpdate(id, updateDatasetDto, { new: true })
      .exec();

    // we were able to find the dataset and update it
    return patchedDataset;
  }

  // DELETE dataset
  async findByIdAndDelete(id: string): Promise<Dataset> {
    return await this.datasetModel.findByIdAndRemove(id);
  }

  private schemaTypeOf(key: string, value: any = null): string {
    let property = this.datasetModel.schema.path(key);

    if (!property) {
      property =
        this.datasetModel.discriminators[DatasetType.Raw].schema.path(key);
    }

    if (!property) {
      property =
        this.datasetModel.discriminators[DatasetType.Derived].schema.path(key);
    }

    if (!property) {
      if ('begin' in value) {
        return 'Date';
      } else {
        return 'String';
      }
    } else {
      return property.instance;
    }
  }

  private searchExpression(fieldName: string, value: any): any {
    if (fieldName === 'text') {
      return { $search: value };
    }

    const valueType = this.schemaTypeOf(fieldName, value);

    if (valueType === 'String') {
      if (value.constructor === Array) {
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
    } else if (valueType === 'Date') {
      return {
        $gte: new Date(value.begin),
        $lte: new Date(value.end),
      };
    } else if (valueType === 'Boolean') {
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

  createNewFacetPipeline(name: string, type: string, query: any) {
    const pipeline = [];

    if (type === 'Array') {
      pipeline.push({
        $unwind: '$' + name,
      });
    }

    if (query && Object.keys(query).length > 0) {
      const queryCopy = { ...query };
      delete queryCopy[name];

      if (Object.keys(queryCopy).length > 0) {
        pipeline.push({
          $match: queryCopy,
        });
      }
    }

    const group: {
      $group: {
        _id: string | Record<string, any>;
        count: Record<string, number>;
      };
    } = {
      $group: {
        _id: '$' + name,
        count: {
          $sum: 1,
        },
      },
    };

    if (type === 'Date') {
      group.$group._id = {
        year: {
          $year: '$' + name,
        },
        month: {
          $month: '$' + name,
        },
        day: {
          $dayOfMonth: '$' + name,
        },
      };
    }
    pipeline.push(group);

    const sort = {
      $sort: {
        _id: -1,
      },
    };
    pipeline.push(sort);

    return pipeline;
  }
}
