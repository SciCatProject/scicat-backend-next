import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { MetricsService } from "./metrics.service";

@ApiTags("metrics")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  //TODO: correct checkpolies and api description
  @Get("/find")
  @ApiOperation({ summary: "Get metrics" })
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
    return this.metricsService.find(
      parsedQuery,
      parsedProjection,
      parsedOption,
    );
  }
}
