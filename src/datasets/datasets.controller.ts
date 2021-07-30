import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { Dataset } from './schemas/dataset.schema';

@ApiTags('datasets')
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

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Dataset> {
    return this.datasetsService.findById(id);
  }
}
