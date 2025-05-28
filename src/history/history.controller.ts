import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { HistoryService } from "./history.service";
import { PoliciesGuard } from "../casl/guards/policies.guard";
import { CheckPolicies } from "../casl/decorators/check-policies.decorator";
import { AppAbility } from "../casl/casl-ability.factory";
import { Action } from "../casl/action.enum";

@ApiBearerAuth()
@ApiTags("history")
@Controller("history")
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies("history", (ability: AppAbility) =>
    ability.can(Action.HistoryRead, "GenericHistory"),
  )
  @Get("collection/:collectionName")
  @ApiOperation({
    summary: "Get history by collection name",
    description:
      "Returns history records for a specific collection. Admin access only.",
  })
  @ApiParam({
    name: "collectionName",
    description: "The name of the collection to get history for",
    type: String,
    required: true,
  })
  @ApiQuery({
    name: "skip",
    description: "Number of records to skip (for pagination)",
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of records to return (for pagination)",
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "History records retrieved successfully",
  })
  async getHistoryByCollection(
    @Param("collectionName") collectionName: string,
    @Query("skip") skip?: number,
    @Query("limit") limit?: number,
  ) {
    const [items, totalCount] = await Promise.all([
      this.historyService.findByCollectionName(collectionName, {
        skip: skip ? Number(skip) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
      this.historyService.countByCollectionName(collectionName),
    ]);

    return {
      items,
      count: items.length,
      totalCount,
      skip: skip ? Number(skip) : 0,
      limit: limit ? Number(limit) : 100,
    };
  }
}
