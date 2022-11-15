import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PoliciesService } from "./policies.service";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePolicyDto } from "./dto/update-policy.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Policy, PolicyDocument } from "./schemas/policy.schema";
import { FilterQuery } from "mongoose";
import { IPolicyFilter } from "./interfaces/policy-filters.interface";
import { HistoryInterceptor } from "src/common/interceptors/history.interceptor";

@ApiBearerAuth()
@ApiTags("policies")
@Controller("policies")
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Policy))
  @Post()
  async create(@Body() createPolicyDto: CreatePolicyDto): Promise<Policy> {
    return this.policiesService.create(createPolicyDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Policy))
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all policies",
    required: false,
  })
  async findAll(@Query("filter") filter?: string): Promise<Policy[]> {
    const parsedFilter: IPolicyFilter = JSON.parse(filter ?? "{}");
    return this.policiesService.findAll(parsedFilter);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Policy))
  @Get("/count")
  async count(@Query("where") where?: string): Promise<{ count: number }> {
    const parsedWhere: FilterQuery<PolicyDocument> = JSON.parse(where ?? "{}");
    return this.policiesService.count(parsedWhere);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Policy))
  @ApiQuery({
    name: "ownerGrouplist",
    description: "Stringified array of owner groups",
    required: true,
  })
  @ApiQuery({
    name: "data",
    description: "Policy JSON object",
    required: true,
  })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Policy))
  @UseInterceptors(HistoryInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post("/updateWhere")
  async updateWhere(
    @Query("ownerGroupList") ownerGroupList: string,
    @Query("data") data: string,
    @Req() req: Request,
  ) {
    const parsedData: UpdatePolicyDto = JSON.parse(data);
    return this.policiesService.updateWhere(ownerGroupList, parsedData, req);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Policy))
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Policy | null> {
    return this.policiesService.findOne({ _id: id });
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Policy))
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ): Promise<Policy | null> {
    return this.policiesService.update({ _id: id }, updatePolicyDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Policy))
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.policiesService.remove({ _id: id });
  }
}
