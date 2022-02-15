import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { CreatePublishedDataDto } from "./dto/create-published-data.dto";
import { UpdatePublishedDataDto } from "./dto/update-published-data.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { PublishedData } from "./schemas/published-data.schema";
import { IPublishedDataFilters } from "./interfaces/published-data-filters.interface";

@ApiBearerAuth()
@ApiTags("publisheddata")
@Controller("published-data")
export class PublishedDataController {
  constructor(private readonly publishedDataService: PublishedDataService) {}

  // POST /publisheddata
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, PublishedData),
  )
  @Post()
  async create(
    @Body() createPublishedDataDto: CreatePublishedDataDto,
  ): Promise<PublishedData> {
    return this.publishedDataService.create(createPublishedDataDto);
  }

  // GET /publisheddata
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, PublishedData),
  )
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all published data",
    required: false,
  })
  async findAll(@Query("filter") filters?: string): Promise<PublishedData[]> {
    const publishedDataFilters: IPublishedDataFilters = JSON.parse(
      filters ?? "{}",
    );
    return this.publishedDataService.findAll(publishedDataFilters);
  }

  // GET /publisheddata/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, PublishedData),
  )
  @Get("/:id")
  async findOne(@Param("id") id: string): Promise<PublishedData | null> {
    return this.publishedDataService.findOne({ doi: id });
  }

  // PATCH /publisheddata/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, PublishedData),
  )
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updatePublishedDataDto: UpdatePublishedDataDto,
  ): Promise<PublishedData | null> {
    return this.publishedDataService.update(
      { doi: id },
      updatePublishedDataDto,
    );
  }

  // DELETE /pubvlisheddata/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, PublishedData),
  )
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.publishedDataService.remove({ doi: id });
  }
}
