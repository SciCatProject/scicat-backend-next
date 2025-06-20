import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Action } from "src/casl/action.enum";
import { AppAbility } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { IFilters } from "src/common/interfaces/common.interface";
import { CountApiResponse } from "src/common/types";
import { replaceLikeOperator } from "src/common/utils";
import { DatablocksService } from "./datablocks.service";
import { CreateDatablockDto } from "./dto/create-datablock.dto";
import { PartialUpdateDatablockDto } from "./dto/update-datablock.dto";
import { Datablock, DatablockDocument } from "./schemas/datablock.schema";

@ApiBearerAuth()
@ApiTags("datablocks")
@Controller("datablocks")
export class DatablocksController {
  constructor(private readonly datablocksService: DatablocksService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies("datablocks", (ability: AppAbility) =>
    ability.can(Action.DatablockCreate, Datablock),
  )
  @Post()
  async create(
    @Body() createDatablockDto: CreateDatablockDto,
  ): Promise<Datablock> {
    try {
      const datablock = await this.datablocksService.create(createDatablockDto);
      return datablock;
    } catch (error) {
      Logger.error(error, this.constructor.name);
      throw error;
    }
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("datablocks", (ability: AppAbility) =>
    ability.can(Action.DatablockRead, Datablock),
  )
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving count for datablocks",
    required: false,
    type: String,
    example:
      '{"where": {"datasetId": "20.500.12269/4f8c991e-a879-4e00-9095-5bb13fb02ac4"}}',
  })
  @Get()
  async findAll(@Query("filter") filter?: string): Promise<Datablock[]> {
    const datablockFilter: IFilters<DatablockDocument> = replaceLikeOperator(
      JSON.parse(filter ?? "{}"),
    );
    return this.datablocksService.findAll(datablockFilter);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("datablocks", (ability: AppAbility) =>
    ability.can(Action.DatablockRead, Datablock),
  )
  @Get("/count")
  @ApiOperation({
    summary: "It returns the number of datablocks.",
    description:
      "It returns a number of datablocks matching the where filter if provided.",
  })
  @ApiQuery({
    name: "where",
    deprecated: true,
    description: "Deprecated, use `filter` instead.",
    required: false,
    type: String,
    example:
      '{"where": {"datasetId": "20.500.12269/4f8c991e-a879-4e00-9095-5bb13fb02ac4"}}',
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving count for datablocks",
    required: false,
    type: String,
    example:
      '{"where": {"datasetId": "20.500.12269/4f8c991e-a879-4e00-9095-5bb13fb02ac4"}}',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CountApiResponse,
    description:
      "Return the number of datasets in the following format: { count: integer }",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: ForbiddenException,
    example: {
      message: "Forbidden resource",
      error: "Forbidden",
      statusCode: 403,
    },
    description: "Forbidden resource",
  })
  async count(
    @Req() request: Request,
    @Headers() headers: Record<string, string>,
    @Query("where") where?: string,
    @Query("filter") filter?: string,
  ): Promise<CountApiResponse> {
    if (where) {
      Logger.warn(
        "Use of deprecated query parameter 'where'",
        `${this.constructor.name}.count`,
      );
      filter = where;
    }

    const datablockFilter: IFilters<DatablockDocument> = replaceLikeOperator(
      JSON.parse(filter ?? "{}"),
    );
    return this.datablocksService.count(datablockFilter);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("datablocks", (ability: AppAbility) =>
    ability.can(Action.DatablockRead, Datablock),
  )
  @Get(":id")
  async findById(@Param("id") id: string): Promise<Datablock | null> {
    return this.datablocksService.findOne({ where: { _id: id } });
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("datablocks", (ability: AppAbility) =>
    ability.can(Action.DatablockUpdate, Datablock),
  )
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateDatablockDto: PartialUpdateDatablockDto,
  ): Promise<Datablock | null> {
    try {
      const datablock = await this.datablocksService.update(
        { _id: id },
        updateDatablockDto,
      );
      return datablock;
    } catch (error) {
      Logger.error(error, this.constructor.name);
      throw error;
    }
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("datablocks", (ability: AppAbility) =>
    ability.can(Action.DatablockDelete, Datablock),
  )
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.datablocksService.remove({ _id: id });
  }
}
