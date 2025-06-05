import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { JWTUser } from "../auth/interfaces/jwt-user.interface";
import { Action } from "../casl/action.enum";
import { AppAbility, CaslAbilityFactory } from "../casl/casl-ability.factory";
import { CheckPolicies } from "../casl/decorators/check-policies.decorator";
import { PoliciesGuard } from "../casl/guards/policies.guard";
import { HistoryService } from "./history.service";

@ApiBearerAuth()
@ApiTags("history")
@Controller("history")
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly caslFactory: CaslAbilityFactory,
  ) {}

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
    @Req() request: Request,
    @Query("skip") skip?: number,
    @Query("limit") limit?: number,
  ) {
    // Check if the user has permission to access this specific collection's history
    const ability = this.caslFactory.historyEndpointAccess(
      request.user as JWTUser,
    );

    // Check permissions using the correct third parameter format based on your CASL setup
    if (
      !ability.can(Action.HistoryRead, "GenericHistory", collectionName) &&
      !ability.can(Action.HistoryRead, "GenericHistory", "ALL")
    ) {
      throw new ForbiddenException(
        `You don't have permission to access history for ${collectionName} collection`,
      );
    }

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
