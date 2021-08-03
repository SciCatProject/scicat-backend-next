import { Body, Controller, Get, Param, Post, Patch, Put, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { Dataset } from './schemas/dataset.schema';

@ApiTags('datasets')
@Controller('datasets')
export class DatasetsController {
  constructor(private datasetsService: DatasetsService) {}

  // POST /datasets
  @Post()
  async create(@Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.create(createDatasetDto);
  }

  // GET /datasets
  @Get()
  async findAll(): Promise<Dataset[]> {
    return this.datasetsService.findAll();
  }

  // GET /datasets/:id
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Dataset> {
    return this.datasetsService.findById(id);
  }

  // PATCH /datasets/:id
  // body: modified fields
  @Patch(':id')
  async findByIdAndUpdate(@Param('id') id: string, @Body() updateDatasetDto: UpdateDatasetDto): Promise<Dataset> {
    return this.datasetsService.findByIdAndUpdate(id, updateDatasetDto);
  }

  // PUT /datasets/:id
  // body: full dataset model
  @Put(':id')
  async findByIdReplaceOrCreate(@Param('id') id: string, @Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.findByIdAndReplaceOrCreate(id, createDatasetDto);
  }

  // DELETE /datasets/:id
  @Delete(':id')
  async findByIdAndDelete(@Param('id') id: string): Promise<any> {
    return this.datasetsService.findByIdAndDelete(id);
  };
}
