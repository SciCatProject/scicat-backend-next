import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDatasetDto } from './dto/create-dataset.dto';
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
}
