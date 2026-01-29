import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { MetadataKeysV4Service } from "./metadatakeys.v4.service";
import { CreateMetadataKeyDto } from "./dto/create-metadata-key.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { AuthenticatedPoliciesGuard } from "src/casl/guards/auth-check.guard";
import { OutputMetadataKeyDto } from "./dto/output-metadata-key.dto";

import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { Request } from "express";

@ApiBearerAuth()
@ApiTags("metadata keys v4")
@Controller({ path: "metadatakeys", version: "4" })
export class MetadataKeysV4Controller {
  constructor(
    private metadatakeysService: MetadataKeysV4Service,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @UseGuards(PoliciesGuard)
  @Get()
  @ApiOperation({ summary: "List metadata keys by text query" })
  @ApiResponse({ status: HttpStatus.OK, type: [OutputMetadataKeyDto] })
  async findAll(@Req() request: Request, @Query("filter") filter: object) {
    const user: JWTUser = request.user as JWTUser;
    return this.metadatakeysService.findAll(filter);
  }
}
