import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { mapScientificQuery } from 'src/common/utils';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { CreateDerivedDatasetDto } from './dto/create-derived-dataset.dto';
import { CreateRawDatasetDto } from './dto/create-raw-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { UpdateDerivedDatasetDto } from './dto/update-derived-dataset.dto';
import { UpdateRawDatasetDto } from './dto/update-raw-dataset.dto';
import { IDatasetFilters } from './interfaces/dataset-filters.interface';
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

      if (filter.query) {
        if (filter.query.mode) {
          const idField = '_id';
          const currentExpression = JSON.parse(
            JSON.stringify(filter.query.mode),
          );
          if (idField in currentExpression) {
            currentExpression['_id'] = currentExpression[idField];
            delete currentExpression[idField];
          }
          filterQuery = currentExpression;
        }
        if (filter.query.text) {
          filterQuery.$text = { $search: filter.query.text };
        }
        if (filter.query.creationTime) {
          const { begin, end } = filter.query.creationTime;
          filterQuery.creationTime = {
            $gte: new Date(begin),
            $lte: new Date(end),
          };
        }
        if (filter.query.creationLocation) {
          filterQuery.creationLocation = { $in: filter.query.creationLocation };
        }
        if (filter.query.ownerGroup) {
          filterQuery.ownerGroup = { $in: filter.query.ownerGroup };
        }
        if (filter.query.keywords) {
          filterQuery.keywords = { $in: filter.query.keywords };
        }
        if (filter.query.scientific) {
          filterQuery = {
            ...filterQuery,
            ...mapScientificQuery(filter.query.scientific),
          };
        }
        if (filter.query.type) {
          filterQuery.type = { $in: filter.query.type };
          const [type] = filter.query.type;

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
}
