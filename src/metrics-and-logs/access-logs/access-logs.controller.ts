import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AccessLogsService } from "./access-logs.service";
@ApiTags("access-logs")
@Controller("access-logs")
export class AccessLogsController {
  constructor(private readonly accessLogsService: AccessLogsService) {}

  //TODO: use correct checkpolies
  // @UseGuards(PoliciesGuard)
  @Get("/find")
  @ApiOperation({ summary: "Get access logs" })
  @ApiQuery({
    name: "query",
    description: `{ "endpoint": { "$regex": "20.500.12269", "$options": "i" } } \n
{ "userId": "example" } \n
{ "$or": [ { "userId": "example" }, { "endpoint": { "$regex": "20.500.12269", "$options": "i" } } ] }`,
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "projection",
    description: '{"userId": 1, "endpoint": 1, "createdAt": 1}',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "options",
    description:
      "{ limit: 10, skip: 5, sort: { createdAt: -1 }, maxTimeMS: 1000, hint: { createdAt: 1 } }",
    required: false,
    type: String,
  })
  async find(
    @Query("query") query: string,
    @Query("projection")
    projection?: string,
    @Query("options") options?: string,
  ) {
    const parsedQuery = query ? JSON.parse(query) : {};
    const parsedOption = options ? JSON.parse(options) : {};
    const parsedProjection = projection ? JSON.parse(projection) : null;
    return this.accessLogsService.find(
      parsedQuery,
      parsedProjection,
      parsedOption,
    );
  }
}
