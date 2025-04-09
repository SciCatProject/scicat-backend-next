import {
  Controller,
  Get,
  Param,
  UseGuards,
  Body,
  Req,
  Post,
  Delete,
  Query,
  HttpStatus,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
  Patch,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { Attachment, AttachmentDocument } from "./schemas/attachment.schema";
import { Action } from "src/casl/action.enum";
import {
  IAttachmentFields,
  IAttachmentFiltersV4,
} from "./interfaces/attachment-filters.interface";

import { OutputDatasetDto } from "src/datasets/dto/output-dataset.dto";
import { getSwaggerAttachmentFilterContent } from "./types/attachment-filter-contents";
import { AttachmentFilterValidationPipe } from "./pipes/attachment-filter-validation.pipe";
import { CreateAttachmentV4Dto } from "./dto/create-attachment.v4.dto";
import { OutputAttachmentV4Dto } from "./dto/output-attachment.v4.dto";
import { PartialUpdateAttachmentV4Dto } from "./dto/update-attachment.v4.dto";
import { AttachmentsV4Service as AttachmentService } from "./attachments.v4.service";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";

@ApiBearerAuth()
@ApiTags("attachments v4")
@Controller({ path: "attachments", version: "4" })
export class AttachmentsV4Controller {
  constructor(
    private attachmentsService: AttachmentService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}
  addPublicFilter(
    filter: IAttachmentFiltersV4<AttachmentDocument, IAttachmentFields>,
  ) {
    if (!filter.where) {
      filter.where = {};
    }

    filter.where = { ...filter.where, isPublished: true };
  }

  private generateAttachmentInstanceForPermissions(
    attachment: Attachment | CreateAttachmentV4Dto,
  ): Attachment {
    const attachmentInstance = new Attachment();
    attachmentInstance.accessGroups = attachment.accessGroups || [];
    attachmentInstance.ownerGroup = attachment.ownerGroup || "";
    attachmentInstance.aid = attachment.aid || "";
    attachmentInstance.isPublished = attachment.isPublished || false;

    return attachmentInstance;
  }

  private permissionChecker(
    group: Action,
    attachment: Attachment | CreateAttachmentV4Dto | null,
    request: Request,
  ) {
    if (!attachment) {
      return false;
    }

    const attachmentInstance =
      this.generateAttachmentInstanceForPermissions(attachment);

    const user: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.attachmentInstanceAccess(user);

    try {
      switch (group) {
        case Action.AttachmentCreateEndpoint:
          return ability.can(
            Action.AttachmentCreateInstance,
            attachmentInstance,
          );
        case Action.AttachmentReadEndpoint:
          return ability.can(Action.AttachmentReadInstance, attachmentInstance);
        case Action.AttachmentUpdateEndpoint:
          return ability.can(
            Action.AttachmentUpdateInstance,
            attachmentInstance,
          );
        case Action.AttachmentDeleteEndpoint:
          return ability.can(
            Action.AttachmentDeleteInstance,
            attachmentInstance,
          );
        default:
          throw new InternalServerErrorException(
            "Permission for the action is not specified",
          );
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  addAccessBasedFilters(
    user: JWTUser,
    filter: IAttachmentFiltersV4<AttachmentDocument, IAttachmentFields>,
  ): IAttachmentFiltersV4<AttachmentDocument, IAttachmentFields> {
    if (!filter.where) {
      filter.where = {};
    }
    const ability = this.caslAbilityFactory.attachmentInstanceAccess(user);
    const canAccessAny = ability.can(Action.accessAny, Attachment);

    if (!canAccessAny) {
      if (filter.where["$and"]) {
        filter.where["$and"].push({
          $or: [
            { ownerGroup: { $in: user?.currentGroups || [] } },
            { accessGroups: { $in: user?.currentGroups || [] } },
            { sharedWith: { $in: [user?.email || ""] } },
            { isPublished: true },
          ],
        });
      } else {
        filter.where["$and"] = [
          {
            $or: [
              { ownerGroup: { $in: user?.currentGroups || [] } },
              { accessGroups: { $in: user?.currentGroups || [] } },
              { sharedWith: { $in: [user?.email || ""] } },
              { isPublished: true },
            ],
          },
        ];
      }
    }
    return filter;
  }

  private async checkPermissionsForAttachment(
    request: Request,
    id: string,
    group: Action,
  ) {
    const attachment = await this.attachmentsService.findOne({
      _id: id,
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment: ${id} not found`);
    }

    const canDoAction = this.permissionChecker(group, attachment, request);

    if (!canDoAction) {
      throw new ForbiddenException("Unauthorized to this attachment");
    }

    return attachment;
  }

  private checkPermissionsForAttachmentCreate(
    request: Request,
    attachment: CreateAttachmentV4Dto,
    group: Action,
  ) {
    const canDoAction = this.permissionChecker(group, attachment, request);

    if (!canDoAction) {
      throw new ForbiddenException("Unauthorized to create this attachment");
    }

    return attachment;
  }

  // GET /attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) =>
    ability.can(Action.AttachmentReadEndpoint, Attachment),
  )
  @ApiOperation({
    summary: "It returns a list of attachments.",
    description:
      "It returns a list of attachments. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieving attachments",
    required: false,
    type: String,
    content: getSwaggerAttachmentFilterContent(),
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputDatasetDto,
    isArray: true,
    description: "Return the attachments requested",
  })
  @Get()
  findAll(
    @Req() request: Request,
    @Query(
      "filter",
      new AttachmentFilterValidationPipe({
        where: true,
        include: false,
        fields: true,
        limits: true,
      }),
    )
    queryFilter: string,
  ): Promise<OutputAttachmentV4Dto[]> {
    const parsedFilter = JSON.parse(queryFilter ?? "{}");
    const mergedFilters = this.addAccessBasedFilters(
      request.user as JWTUser,
      parsedFilter,
    );

    return this.attachmentsService.findAll(mergedFilters);
  }

  // GET /attachments/public
  @AllowAny()
  @ApiOperation({
    summary: "It returns a list of attachments.",
    description:
      "It returns a list of public attachments. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieving public attachments",
    required: false,
    type: String,
    content: getSwaggerAttachmentFilterContent(),
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputDatasetDto,
    isArray: true,
    description: "Return the attachments requested",
  })
  @Get("/public")
  findAllPublic(
    @Query(
      "filter",
      new AttachmentFilterValidationPipe({
        where: true,
        include: false,
        fields: true,
        limits: true,
      }),
    )
    queryFilter: string,
  ): Promise<OutputAttachmentV4Dto[]> {
    const parsedFilter = JSON.parse(queryFilter ?? "{}");
    this.addPublicFilter(parsedFilter);

    const attachments = this.attachmentsService.findAll(parsedFilter);
    return attachments;
  }

  // GET /attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) =>
    ability.can(Action.AttachmentReadEndpoint, Attachment),
  )
  @ApiOperation({
    summary: "It returns the attachment requested.",
    description:
      "It returns the attachment requested through the id specified.",
  })
  @ApiParam({
    name: "aid",
    description: "Id of the attachment to return",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Attachment,
    description: "Return attachment with id specified",
  })
  @Get("/:aid")
  async findOne(
    @Req() request: Request,
    @Param("aid") aid: string,
  ): Promise<OutputAttachmentV4Dto | null> {
    await this.checkPermissionsForAttachment(
      request,
      aid,
      Action.AttachmentReadEndpoint,
    );
    return this.attachmentsService.findOne({ aid });
  }

  // PATCH /attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) =>
    ability.can(Action.AttachmentUpdateEndpoint, Attachment),
  )
  @ApiOperation({
    summary: "It updates the attachment.",
    description:
      "It updates the attachment specified through the id specified. it updates only the specified fields.",
  })
  @ApiParam({
    name: "aid",
    description: "ID of the attachment to modify",
    type: String,
  })
  @ApiBody({
    type: PartialUpdateAttachmentV4Dto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Attachment,
    description:
      "Update an existing attachment and return its representation in SciCat",
  })
  @Patch("/:aid")
  async findOneAndUpdate(
    @Req() request: Request,
    @Param("aid") aid: string,
    @Body() updateAttachmentDto: PartialUpdateAttachmentV4Dto,
  ): Promise<OutputAttachmentV4Dto | null> {
    await this.checkPermissionsForAttachment(
      request,
      aid,
      Action.AttachmentUpdateEndpoint,
    );
    return this.attachmentsService.findOneAndUpdate(
      { _id: aid },
      updateAttachmentDto,
    );
  }

  // POST /attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) =>
    ability.can(Action.AttachmentCreateEndpoint, Attachment),
  )
  @ApiOperation({
    summary: "It creates a new attachment.",
    description:
      "It creates a new attachment and returns it completed with systems fields.",
  })
  @ApiBody({
    type: CreateAttachmentV4Dto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Attachment,
    description:
      "Create a new attachment and return its representation in SciCat",
  })
  @Post()
  async createAttachment(
    @Req() request: Request,
    @Body() createAttachmentDto: CreateAttachmentV4Dto,
  ): Promise<OutputAttachmentV4Dto> {
    //TODO: check user permission
    this.checkPermissionsForAttachmentCreate(
      request,
      createAttachmentDto,
      Action.AttachmentCreateEndpoint,
    );
    return this.attachmentsService.create(createAttachmentDto);
  }

  // DELETE /attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies("attachments", (ability: AppAbility) =>
    ability.can(Action.AttachmentDeleteEndpoint, Attachment),
  )
  @ApiOperation({
    summary: "It deletes the attachment.",
    description: "It delete the attachment specified through the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the attachment to delete",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "No value is returned",
  })
  @Delete("/:aid")
  async findOneAttachmentAndRemove(
    @Req() request: Request,
    @Param("aid") aid: string,
  ): Promise<unknown> {
    await this.checkPermissionsForAttachment(
      request,
      aid,
      Action.AttachmentDeleteEndpoint,
    );
    return this.attachmentsService.findOneAndDelete({ aid });
  }
}
