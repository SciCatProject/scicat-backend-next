import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";
import { Sample, SampleDocument } from "./schemas/sample.schema";

@Injectable()
export class SamplesService {
  constructor(
    @InjectModel(Sample.name) private sampleModel: Model<SampleDocument>,
  ) {}

  async create(createSampleDto: CreateSampleDto): Promise<Sample> {
    const createdSample = new this.sampleModel(createSampleDto);
    return createdSample.save();
  }

  async findAll(filter: FilterQuery<SampleDocument>): Promise<Sample[]> {
    return this.sampleModel.find(filter).exec();
  }

  async findOne(filter: FilterQuery<SampleDocument>): Promise<Sample | null> {
    return this.sampleModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<SampleDocument>,
    updateSampleDto: UpdateSampleDto,
  ): Promise<Sample | null> {
    return this.sampleModel
      .findOneAndUpdate(filter, updateSampleDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<SampleDocument>): Promise<unknown> {
    return this.sampleModel.findOneAndRemove(filter).exec();
  }
}
