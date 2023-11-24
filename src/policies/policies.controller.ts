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
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { PoliciesService } from "./policies.service";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePolicyDto } from "./dto/update-policy.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Policy, PolicyDocument } from "./schemas/policy.schema";
import { FilterQuery } from "mongoose";
import { IPolicyFilter } from "./interfaces/policy-filters.interface";
import { HistoryInterceptor } from "src/common/interceptors/history.interceptor";
import { UpdateWherePolicyDto } from "./dto/update-where-policy.dto";
import { IFilters } from "src/common/interfaces/common.interface";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { replaceLikeOperator } from "src/common/utils";
import { FilterPipe } from "src/common/pipes/filter.pipe";

@ApiBearerAuth()
@ApiTags("policies")
@Controller("policies")
export class PoliciesController {
  constructor(
    private readonly policiesService: PoliciesService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  updateMergedFiltersForList(
    request: Request,
    mergedFilters: IFilters<PolicyDocument, IPolicyFilter>,
  ): IFilters<PolicyDocument, IPolicyFilter> {
    const user: JWTUser = request.user as JWTUser;

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, Policy);
      const canViewTheirOwn = ability.can(Action.ListOwn, Policy);
      if (!canViewAll && canViewTheirOwn) {
        if (!mergedFilters.where) {
          mergedFilters.where = {};
        }
        mergedFilters.where["$or"] = [
          { ownerGroup: { $in: user.currentGroups } },
          { accessGroups: { $in: user.currentGroups } },
          { isPublished: true },
        ];
      }
    }

    return mergedFilters;
  }
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
    example: '{"order":"ownerGroup:desc","skip":0,"limit":25}',
  })
  async findAll(
    @Req() request: Request,
    @Headers() headers: Record<string, string>,
    @Query(new FilterPipe()) queryFilter: { filter?: string },
  ): Promise<Policy[]> {
    const parsedQueryFilter = JSON.parse(queryFilter.filter ?? "{}");
    const mergedFilters = replaceLikeOperator(
      this.updateMergedFiltersForList(request, parsedQueryFilter) as Record<
        string,
        unknown
      >,
    ) as IFilters<PolicyDocument, IPolicyFilter>;

    return this.policiesService.findAll(mergedFilters);
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
