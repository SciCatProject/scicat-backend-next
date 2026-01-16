import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
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
import { MetadataKeyClass } from "./schemas/metadatakey.schema";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { AuthenticatedPoliciesGuard } from "src/casl/guards/auth-check.guard";
import { OutputMetadataKeyDto } from "./dto/output-metadata-key.dto";
import {
  PartialUpdateMetadataKeyDto,
  UpdateMetadataKeyDto,
} from "./dto/update-metadata-key.dto";

@ApiBearerAuth()
@ApiTags("metadata keys v4")
@Controller({ path: "metadatakeys", version: "4" })
export class MetadataKeysV4Controller {
  constructor(
    private metadatakeysService: MetadataKeysV4Service,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @UseGuards(AuthenticatedPoliciesGuard)
  @Post()
  @ApiOperation({
    summary: "Create a new metadata key",
    description:
      "Creates a metadata key record and returns the stored document.",
  })
  @ApiBody({
    description: "Input fields for the metadata key to be created",
    required: true,
    type: CreateMetadataKeyDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: OutputMetadataKeyDto,
    description: "Created metadata key document",
  })
  create(@Body() dto: CreateMetadataKeyDto) {
    return this.metadatakeysService.create(dto);
  }

  // @UseGuards(PoliciesGuard)
  // @Get(":id")
  // @ApiOperation({ summary: "Get metadata key by id" })
  // @ApiParam({ name: "id", schema: { type: "string" } })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: OutputMetadataKeyDto,
  // })
  // @ApiNotFoundResponse({ description: "Metadata key not found" })
  // async getOne(@Param("id") id: string) {
  //   const doc = await this.metadatakeysService.getById(id);
  //   if (!doc) throw new NotFoundException(`Metadata key '${id}' not found`);
  //   return doc;
  // }

  // @UseGuards(PoliciesGuard)
  // @Put(":id")
  // @ApiOperation({ summary: "Replace metadata key by id" })
  // @ApiParam({ name: "id", schema: { type: "string" } })
  // @ApiBody({ required: true, type: UpdateMetadataKeyDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: MetadataKeyClass,
  // })
  // @ApiNotFoundResponse({ description: "Metadata key not found" })
  // async replace(@Param("id") id: string, @Body() dto: UpdateMetadataKeyDto) {
  //   const doc = await this.metadatakeysService.findByIdAndReplace(id, dto);
  //   if (!doc) throw new NotFoundException(`Metadata key '${id}' not found`);
  //   return doc;
  // }

  // @UseGuards(PoliciesGuard)
  // @Patch(":id")
  // @ApiOperation({ summary: "Patch metadata key by id" })
  // @ApiParam({ name: "id", schema: { type: "string" } })
  // @ApiBody({ required: true, type: PartialUpdateMetadataKeyDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: MetadataKeyClass,
  // })
  // @ApiNotFoundResponse({ description: "Metadata key not found" })
  // async patch(
  //   @Param("id") id: string,
  //   @Body() dto: PartialUpdateMetadataKeyDto,
  // ) {
  //   const doc = await this.metadatakeysService.findByIdAndUpdate(id, dto);
  //   if (!doc) throw new NotFoundException(`Metadata key '${id}' not found`);
  //   return doc;
  // }
}
