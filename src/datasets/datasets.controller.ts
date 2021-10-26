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
  UseInterceptors,
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
import { CreateRawDatasetDto } from './dto/create-raw-dataset.dto';
import { CreateDerivedDatasetDto } from './dto/create-derived-dataset.dto';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { Action } from 'src/casl/action.enum';
import { IDatasetFilters } from './interfaces/dataset-filters.interface';
import { PublicDatasetsInterceptor } from './interceptors/public-datasets-interceptor';
import { AllowAny } from 'src/auth/decorators/allow-any.decorator';

@ApiBearerAuth()
@ApiExtraModels(CreateDerivedDatasetDto, CreateRawDatasetDto)
@ApiTags('datasets')
@Controller('datasets')
export class DatasetsController {
  constructor(private datasetsService: DatasetsService) {}

  // POST /datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Dataset))
  @Post()
  async create(@Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.create(createDatasetDto);
  }

  // GET /datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Dataset))
  @Get()
  @ApiQuery({
    name: 'filters',
    description: 'Database filters to apply when retrieve all datasets',
    required: false,
  })
  async findAll(
    @Query() filters?: { fields?: string; limits?: string },
  ): Promise<Dataset[]> {
    const parsedFilters: IDatasetFilters = {
      fields: JSON.parse(filters.fields ?? '{}'),
      limits: JSON.parse(filters.limits ?? '{}'),
    };
    return this.datasetsService.findAll(parsedFilters);
  }

  //GET /fullquery
  @AllowAny()
  @UseInterceptors(PublicDatasetsInterceptor)
  @Get('/fullquery')
  @ApiQuery({
    name: 'filters',
    description: 'Database filter to apply when retrieve all datasets',
    required: false,
  })
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<Dataset[]> {
    console.log({ filters });
    const parsedFilters: IDatasetFilters = {
      fields: JSON.parse(filters.fields ?? '{}'),
      limits: JSON.parse(filters.limits ?? '{}'),
    };
    return this.datasetsService.findAll(parsedFilters);
  }

  // GET /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Dataset))
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Dataset> {
    return this.datasetsService.findById(id);
  }

  // PATCH /datasets/:id
  // body: modified fields
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Dataset))
  @Patch(':id')
  async findByIdAndUpdate(
    @Param('id') id: string,
    @Body()
    updateDatasetDto: UpdateDatasetDto,
  ): Promise<Dataset> {
    return this.datasetsService.findByIdAndUpdate(id, updateDatasetDto);
  }

  // PUT /datasets/:id
  // body: full dataset model
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Dataset))
  @Put(':id')
  async findByIdReplaceOrCreate(
    @Param('id') id: string,
    @Body()
    createDatasetDto: CreateDatasetDto,
  ): Promise<Dataset> {
    return this.datasetsService.findByIdAndReplaceOrCreate(
      id,
      createDatasetDto,
    );
  }

  // DELETE /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Dataset))
  @CheckPolicies(
    (ability: AppAbility) => ability.can(Action.Manage, Dataset),
    (ability: AppAbility) => ability.can(Action.Delete, Dataset),
  )
  @Delete(':id')
  async findByIdAndDelete(@Param('id') id: string): Promise<any> {
    return this.datasetsService.findByIdAndDelete(id);
  }
}
