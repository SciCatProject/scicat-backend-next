import { Controller, Body, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { SearchDto } from "./dto/search.dto";
import { SearchService } from "./elastic-search.service";

@ApiBearerAuth()
@ApiTags("search-service")
@Controller("search-service")
export class SearchServiceController {
  constructor(private readonly service: SearchService) {}

  @HttpCode(HttpStatus.CREATED)
  @AllowAny()
  // @ApiConsumes("application/json")
  @Post("/search")
  @ApiBody({
    type: SearchDto,
  })
  //@UseGuards(new JWTAuthGuard())
  async fetchESResults(@Body() searchDto: SearchDto) {
    return this.service.search(searchDto);
  }

  // @HttpCode(HttpStatus.CREATED)
  // @ApiConsumes("application/json")
  // @Post(
  //   '/sync',
  // )
}
