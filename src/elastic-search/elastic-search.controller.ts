import { Controller, Body, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import { SearchDto } from "./dto/search.dto";
import { ElasticSearchService } from "./elastic-search.service";

@ApiBearerAuth()
@ApiTags("search-service")
@Controller("search-service")
export class ElasticSearchServiceController {
  constructor(private readonly elasticSearchService: ElasticSearchService) {}

  @HttpCode(HttpStatus.CREATED)
  @AllowAny()
  @Post("/search")
  @ApiBody({
    type: SearchDto,
  })

  //@UseGuards(new JWTAuthGuard())
  async fetchESResults(@Body() searchDto: IDatasetFields) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.elasticSearchService.search(searchDto);
  }

  // @HttpCode(HttpStatus.CREATED)
  // @ApiConsumes("application/json")
  // @Post(
  //   '/sync',
  // )
}
