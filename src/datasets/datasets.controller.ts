import { Body, Controller, Get, Post } from '@nestjs/common';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { Dataset } from './schemas/dataset.schema';

@Controller('datasets')
export class DatasetsController {
  constructor(private datasetsService: DatasetsService) {}

  @Post()
  async create(@Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.create(createDatasetDto);
  }

  @Get()
  async findAll(): Promise<Dataset[]> {
    return this.datasetsService.findAll();
  }
}
