import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { Dataset } from './schemas/dataset.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRawDatasetDto } from './dto/create-raw-dataset.dto';
import { CreateDerivedDataset } from './dto/create-derived-dataset.dto';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiBearerAuth()
@ApiExtraModels(CreateDerivedDataset, CreateRawDatasetDto)
@ApiTags('datasets')
@Controller('datasets')
export class DatasetsController {
  constructor(private datasetsService: DatasetsService) {}

  // POST /datasets
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.create(createDatasetDto);
  }

  // GET /datasets
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({
    name: 'filter',
    description: 'Database filters to apply when retrieve all datasets',
  })
  async findAll(@Query('filter') filter: string): Promise<Dataset[]> {
    // convert filter string to object
    const oFilter: any = JSON.parse(filter === undefined ? '{}' : filter);
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
  async findByIdAndUpdate(
    @Param('id') id: string,
    @Body() updateDatasetDto: UpdateDatasetDto,
  ): Promise<Dataset> {
    return this.datasetsService.findByIdAndUpdate(id, updateDatasetDto);
  }

  // PUT /datasets/:id
  // body: full dataset model
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async findByIdReplaceOrCreate(
    @Param('id') id: string,
    @Body() createDatasetDto: CreateDatasetDto,
  ): Promise<Dataset> {
    return this.datasetsService.findByIdAndReplaceOrCreate(
      id,
      createDatasetDto,
    );
  }

  // DELETE /datasets/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.ArchiveManager)
  @Delete(':id')
  async findByIdAndDelete(@Param('id') id: string): Promise<any> {
    return this.datasetsService.findByIdAndDelete(id);
  }
}
