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
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import { OrigDatablocksService } from "./origdatablocks.service";
import { CreateOrigDatablockDto } from "./dto/create-origdatablock.dto";
import { PartialUpdateOrigDatablockDto } from "./dto/update-origdatablock.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import {
  OrigDatablock,
  OrigDatablockDocument,
} from "./schemas/origdatablock.schema";
import { IFilters } from "src/common/interfaces/common.interface";
import {
  IOrigDatablockFields,
  IOrigDatablockFiltersV4,
} from "./interfaces/origdatablocks.interface";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DatasetsService } from "src/datasets/datasets.service";
import { PartialUpdateDatasetDto } from "src/datasets/dto/update-dataset.dto";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { CreateRawDatasetObsoleteDto } from "src/datasets/dto/create-raw-dataset-obsolete.dto";
import { CreateDerivedDatasetObsoleteDto } from "src/datasets/dto/create-derived-dataset-obsolete.dto";
import { IsValidResponse } from "src/common/types";
import { getSwaggerOrigDatablockFilterContent } from "./origdatablock-filter-content";
import { OrigDatablockLookupKeysEnum } from "./origdatablock-lookup";
import { IncludeValidationPipe } from "./pipes/include-validation.pipe";
import { FilterValidationPipe } from "./pipes/filter-validation.pipe";

@ApiTags("origdatablocks v4")
@Controller({ path: "origdatablocks/public", version: "4" })
export class OrigDatablocksPublicV4Controller {
  constructor(
    private readonly origDatablocksService: OrigDatablocksService,
    private readonly datasetsService: DatasetsService,
  ) {}

  addPublicFilter(
    filter: IOrigDatablockFiltersV4<
      OrigDatablockDocument,
      IOrigDatablockFields
    >,
  ) {
    if (!filter.where) {
      filter.where = {};
    }

    filter.where = { ...filter.where, isPublished: true };
  }
  //TODO: Add endpoints
}
