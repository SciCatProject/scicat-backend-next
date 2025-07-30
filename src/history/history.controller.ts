import {
  BadRequestException,
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
import { FilterQuery } from "mongoose";
import { JWTUser } from "../auth/interfaces/jwt-user.interface";
import { Action } from "../casl/action.enum";
import { AppAbility, CaslAbilityFactory } from "../casl/casl-ability.factory";
import { CheckPolicies } from "../casl/decorators/check-policies.decorator";
import { AuthenticatedPoliciesGuard } from "../casl/guards/auth-check.guard";
import { GenericHistoryDocument } from "../common/schemas/generic-history.schema";
import { HistoryService } from "./history.service";

@ApiBearerAuth()
@ApiTags("history")
@Controller("history")
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly caslFactory: CaslAbilityFactory,
  ) {}

  /**
   * Maps history subsystem names to their corresponding CASL action permissions
   * @private
   */
  private readonly subsystemActionMap = {
    Dataset: Action.HistoryReadDataset,
    Proposal: Action.HistoryReadProposal,
    Sample: Action.HistoryReadSample,
    Instrument: Action.HistoryReadInstrument,
    PublishedData: Action.HistoryReadPublishedData,
    Policy: Action.HistoryReadPolicy,
    Datablock: Action.HistoryReadDatablock,
    Attachment: Action.HistoryReadAttachment,
  };

  @UseGuards(AuthenticatedPoliciesGuard)
  @CheckPolicies("history", (ability: AppAbility) =>
    ability.can(Action.HistoryReadEndpoint, "GenericHistory"),
  )
  @Get()
  @ApiOperation({
    summary: "Find history records with flexible filtering",
    description:
      "Returns history records that match the provided filter criteria.",
  })
  @ApiQuery({
    name: "filter",
    description: "JSON filter object for querying history records",
    type: String,
    required: true,
    example: '{"subsystem":"Dataset","documentId":"12345"}',
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
  async findHistory(
    @Req() request: Request,
    @Query("filter") filterStr: string,
    @Query("skip") skip?: number,
    @Query("limit") limit?: number,
  ) {
    // Parse the filter JSON
    let filter: FilterQuery<GenericHistoryDocument>;
    try {
      filter = JSON.parse(filterStr);
    } catch (error) {
      throw new BadRequestException("Invalid filter JSON format: " + error);
    }

    // Get the user's instance-level permissions
    const ability = this.caslFactory.historyInstanceAccess(
      request.user as JWTUser,
    );

    if (!filter.subsystem) {
      // For admin users who can access all collections
      const adminAbility = this.caslFactory.historyEndpointAccess(
        request.user as JWTUser,
      );

      if (!adminAbility.can(Action.HistoryReadEndpoint, "GenericHistory")) {
        throw new BadRequestException(
          "subsystem is required in filter for non-admin users",
        );
      }
    } else {
      const requiredAction =
        this.subsystemActionMap[
          filter.subsystem as keyof typeof this.subsystemActionMap
        ];

      if (!requiredAction || !ability.can(requiredAction, "GenericHistory")) {
        throw new ForbiddenException(
          `You don't have permission to access history for ${filter.subsystem} collection`,
        );
      }
    }

    // Apply the filters and pagination
    const [items, totalCount] = await Promise.all([
      this.historyService.find(filter, {
        skip: skip ? Number(skip) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
      this.historyService.count(filter),
    ]);

    return {
      items,
      count: items.length,
      totalCount,
      skip: skip ? Number(skip) : 0,
      limit: limit ? Number(limit) : 100,
    };
  }

  @UseGuards(AuthenticatedPoliciesGuard)
  @CheckPolicies("history", (ability: AppAbility) =>
    ability.can(Action.HistoryReadEndpoint, "GenericHistory"),
  )
  @Get("count")
  @ApiOperation({
    summary: "Count history records with flexible filtering",
    description:
      "Returns the count of history records that match the provided filter criteria.",
  })
  @ApiQuery({
    name: "filter",
    description: "JSON filter object for counting history records",
    type: String,
    required: true,
    example: '{"subsystem":"Dataset","operation":"delete"}',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "History count retrieved successfully",
  })
  async countHistory(
    @Req() request: Request,
    @Query("filter") filterStr: string,
  ) {
    // Parse the filter JSON
    let filter: FilterQuery<GenericHistoryDocument>;
    try {
      filter = JSON.parse(filterStr);
    } catch (error) {
      throw new BadRequestException("Invalid filter JSON format: " + error);
    }

    // Ensure subsystem is provided for permission check
    if (!filter.subsystem) {
      throw new BadRequestException(
        "subsystem is required in filter for permission verification",
      );
    }

    // Get the user's instance-level permissions
    const ability = this.caslFactory.historyInstanceAccess(
      request.user as JWTUser,
    );

    const requiredAction =
      this.subsystemActionMap[
        filter.subsystem as keyof typeof this.subsystemActionMap
      ];

    if (!requiredAction || !ability.can(requiredAction, "GenericHistory")) {
      throw new ForbiddenException(
        `You don't have permission to access history for ${filter.subsystem} collection`,
      );
    }

    const count = await this.historyService.count(filter);

    return { count };
  }

  // Keep the existing endpoint for backward compatibility
  @UseGuards(AuthenticatedPoliciesGuard)
  @CheckPolicies("history", (ability: AppAbility) =>
    ability.can(Action.HistoryReadEndpoint, "GenericHistory"),
  )
  @Get("collection/:subsystem")
  @ApiOperation({
    summary: "Get history by collection name",
    description:
      "Returns history records for a specific collection. Admin access only.",
  })
  @ApiParam({
    name: "subsystem",
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
    @Param("subsystem") subsystem: string,
    @Req() request: Request,
    @Query("skip") skip?: number,
    @Query("limit") limit?: number,
  ) {
    // Get the user's instance-level permissions
    const ability = this.caslFactory.historyInstanceAccess(
      request.user as JWTUser,
    );

    // Check permissions using the correct third parameter format based on your CASL setup
    const requiredAction =
      this.subsystemActionMap[
        subsystem as keyof typeof this.subsystemActionMap
      ];

    if (!requiredAction || !ability.can(requiredAction, "GenericHistory")) {
      throw new ForbiddenException(
        `You don't have permission to access history for ${subsystem} collection`,
      );
    }

    const [items, totalCount] = await Promise.all([
      this.historyService.findBySubsystem(subsystem, {
        skip: skip ? Number(skip) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
      this.historyService.countBySubsystem(subsystem),
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
