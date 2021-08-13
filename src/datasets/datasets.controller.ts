import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Patch, 
  Put, 
  Delete, 
  Req,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  json,
  Request
} from 'express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { Dataset } from './schemas/dataset.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
//import { Query } from 'mongoose';

@ApiTags('datasets')
@Controller('datasets')
export class DatasetsController {
  constructor(
    private datasetsService: DatasetsService
  ) {}

  // POST /datasets
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.create(createDatasetDto);
  }

  // GET /datasets
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({
    name: 'filter',
    description: 'Database filters to apply when retrieve all datasets'
  })
  async findAll(@Query('filter') filter: string, @Req() request: Request): Promise<Dataset[]> {
    // convert filter string to object
    const oFilter: object = JSON.parse( (filter === undefined) ? '{}' : filter );
    return this.datasetsService.findAll(oFilter);
  }

  // GET /datasets/:id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Dataset> {
    return this.datasetsService.findById(id);
  }

  // PATCH /datasets/:id
  // body: modified fields
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async findByIdAndUpdate(@Param('id') id: string, @Body() updateDatasetDto: UpdateDatasetDto): Promise<Dataset> {
    return this.datasetsService.findByIdAndUpdate(id, updateDatasetDto);
  }

  // PUT /datasets/:id
  // body: full dataset model
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async findByIdReplaceOrCreate(@Param('id') id: string, @Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.findByIdAndReplaceOrCreate(id, createDatasetDto);
  }

  // DELETE /datasets/:id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async findByIdAndDelete(@Param('id') id: string): Promise<any> {
    return this.datasetsService.findByIdAndDelete(id);
  };
}
