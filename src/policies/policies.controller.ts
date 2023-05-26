/* eslint-disable @typescript-eslint/quotes */
import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PoliciesService } from "./policies.service";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePolicyDto } from "./dto/update-policy.dto";
import { ApiBearerAuth, ApiHeaders, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Policy, PolicyDocument } from "./schemas/policy.schema";
import { FilterQuery } from "mongoose";
import { IPolicyFilter } from "./interfaces/policy-filters.interface";
import { HistoryInterceptor } from "src/common/interceptors/history.interceptor";
import { UpdateWherePolicyDto } from "./dto/update-where-policy.dto";

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
  @ApiHeaders([
    {
      name: "filter",
      description: "Database filters to apply when retrieve all policies",
      required: false,
      schema: {
        example: '{"order":"ownerGroup:desc","skip":0,"limit":25}',
      },
    },
  ])
  async findAll(@Headers("filter") filter?: string): Promise<Policy[]> {
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
  @UseInterceptors(HistoryInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post("/updateWhere")
  async updateWhere(@Body() updateWherePolicyDto: UpdateWherePolicyDto) {
    return this.policiesService.updateWhere(
      updateWherePolicyDto.ownerGroupList,
      updateWherePolicyDto.data,
    );
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
