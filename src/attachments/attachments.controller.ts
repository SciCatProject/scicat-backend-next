import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Body,
  Req,
  Post,
  Put,
  Delete,
} from "@nestjs/common";
import { ApiBearerAuth, ApiExtraModels, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AttachmentsService } from "./attachments.service";
import { PartialUpdateAttachmentDto } from "./dto/update-attachment.dto";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";

@ApiBearerAuth()
@ApiTags("attachments v4")
@Controller({ path: "attachments", version: "4" })
export class AttachmentsController {
  constructor(
    private attachmentsService: AttachmentsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  // GET /attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) => true)
  @Get()
  findAll(@Req() request: Request): Promise<any> {
    //TODO: allow filtering by relations
    return this.attachmentsService.findAll({});
  }

  // GET /attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) => true)
  @Get("/:aid")
  async findOne(@Param("aid") aid: string): Promise<any> {
    //TODO: check user permission
    return this.attachmentsService.findOne({ aid });
  }

  // PUT /attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) => true)
  @Put("/:aid")
  async findOneAndUpdate(
    @Param("aid") aid: string,
    @Body() updateAttachmentDto: PartialUpdateAttachmentDto,
  ): Promise<any> {
    //TODO: check user permission
    return this.attachmentsService.findOneAndUpdate(
      { aid },
      updateAttachmentDto,
    );
  }

  // POST /attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) => true)
  @ApiExtraModels(CreateAttachmentDto)
  @Post("/:aid")
  async createAttachment(
    @Req() request: Request,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<any> {
    //TODO: check user permission
    return this.attachmentsService.create(createAttachmentDto);
  }

  // DELETE /attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) => true)
  @ApiExtraModels(CreateAttachmentDto)
  @Delete("/:aid")
  async findOneAttachmentAndRemove(
    @Req() request: Request,
    @Param("aid") aid: string,
  ): Promise<any> {
    //TODO: check user permission
    return this.attachmentsService.findOneAndDelete({ aid });
  }
}
