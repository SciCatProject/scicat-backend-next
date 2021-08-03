import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { Dataset, DatasetDocument } from './schemas/dataset.schema';

@Injectable()
export class DatasetsService {
  constructor(
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
  ) {}

  async create(createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    const createdDataset = new this.datasetModel(createDatasetDto);
    return createdDataset.save();
  }

  async findAll(): Promise<Dataset[]> {
    return this.datasetModel.find().exec();
  }

  async findById(id: string): Promise<Dataset> {
    return this.datasetModel.findById(id).exec();
  }

  // PUT dataset
  // we update the full dataset if exist or create a new one if it does not
  async findByIdAndReplaceOrCreate(id: string, createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    const existingDataset = await this.datasetModel.findByIdAndUpdate(
      id,
      createDatasetDto
    ).exec();

    // check if we were able to find the dataset and update it
    if (!existingDataset) {
      // no luck. we need to create a new dataset with the provided id
      const createdDataset = new this.datasetModel(createDatasetDto);
      createdDataset.set('_id',id);
      return await createdDataset.save();
    }
    
    // we were able to find the dataset and update it
    return existingDataset;
  }

  // PATCH dataset
  // we update only the fields that have been modified on an existing dataset
  async findByIdAndUpdate(id: string, updateDatasetDto: UpdateDatasetDto): Promise<Dataset> {
    const existingDataset = await this.datasetModel.findByIdAndUpdate(
      id,
      updateDatasetDto
    ).exec();

    // check if we were able to find the dataset and update it
    if (!existingDataset) {
      // no luck. we need to create a new dataset
      throw new NotFoundException(`Dataset #${id} not found`);
    }
    
    // we were able to find the dataset and update it
    return existingDataset;

  }

  // DELETE dataset
  async findByIdAndDelete(id: string): Promise<Dataset> {
    return await this.datasetModel.findByIdAndRemove(id);
  }
}
