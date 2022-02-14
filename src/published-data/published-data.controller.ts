import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { CreatePublishedDataDto } from "./dto/create-published-data.dto";
import { UpdatePublishedDataDto } from "./dto/update-published-data.dto";

@Controller("published-data")
export class PublishedDataController {
  constructor(private readonly publishedDataService: PublishedDataService) {}

  @Post()
  create(@Body() createPublishedDataDto: CreatePublishedDataDto) {
    return this.publishedDataService.create(createPublishedDataDto);
  }

  @Get()
  findAll() {
    return this.publishedDataService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.publishedDataService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updatePublishedDataDto: UpdatePublishedDataDto,
  ) {
    return this.publishedDataService.update(+id, updatePublishedDataDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.publishedDataService.remove(+id);
  }
}
