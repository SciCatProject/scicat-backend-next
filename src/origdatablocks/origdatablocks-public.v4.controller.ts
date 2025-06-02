import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
} from "@nestjs/common";
import { OrigDatablocksService } from "./origdatablocks.service";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  OrigDatablock,
  OrigDatablockDocument,
} from "./schemas/origdatablock.schema";
import {
  IOrigDatablockFields,
  IOrigDatablockFiltersV4,
} from "./interfaces/origdatablocks.interface";
import { getSwaggerOrigDatablockFilterContent } from "./origdatablock-filter-content";
import { OrigDatablockLookupKeysEnum } from "./origdatablock-lookup";
import { IncludeValidationPipe } from "./pipes/include-validation.pipe";
import { FilterValidationPipe } from "./pipes/filter-validation.pipe";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";

@ApiTags("origdatablocks v4")
@Controller({ path: "origdatablocks/public", version: "4" })
export class OrigDatablocksPublicV4Controller {
  constructor(
    private readonly origDatablocksService: OrigDatablocksService
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

  // GET /origdatablocks/public
  @AllowAny()
  @Get()
  @ApiOperation({
    summary: "It returns a list of public origdatablocks.",
    description:
      "It returns a list of public original datablocks. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving the public origdatablocks",
    required: false,
    type: String,
    content: getSwaggerOrigDatablockFilterContent(),
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OrigDatablock,
    isArray: true,
    description: "Return the origdatablocks requested",
  })
  async findAllPublic(
    @Query("filter", new FilterValidationPipe(), new IncludeValidationPipe())
    queryFilter: string,
  ) {
    const parsedFilter = JSON.parse(queryFilter ?? "{}");

    this.addPublicFilter(parsedFilter);

    // TODO: Update service to complete query
    const origdatablocks = await this.origDatablocksService.findAll(parsedFilter);

    return origdatablocks;
  }

  // GET /origdatablocks/public/:id
  @AllowAny()
  @Get("/:pid")
  @ApiParam({
    name: "pid",
    description: "Id of the public origdatablock to return",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OrigDatablock,
    isArray: false,
    description: "Return public origdatablock with pid specified",
  })
  @ApiQuery({
    name: "include",
    enum: OrigDatablockLookupKeysEnum,
    type: String,
    required: false,
    isArray: true,
  })
  async findByIdPublic(
    @Param("pid") id: string,
    @Query("include", new IncludeValidationPipe())
    include: OrigDatablockLookupKeysEnum[] | OrigDatablockLookupKeysEnum,
  ) {
    const includeArray = Array.isArray(include)
      ? include
      : include && Array(include);

    //TODO: Update to findOneComplete in service
    const origdatablock = await this.origDatablocksService.findOne({
      where: { pid: id, isPublished: true },
      include: includeArray,
    });

    return origdatablock;
  }
}
