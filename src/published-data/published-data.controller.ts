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
import { CreatePublishedDatumDto } from "./dto/create-published-data.dto";
import { UpdatePublishedDatumDto } from "./dto/update-published-data.dto";

@Controller("published-data")
export class PublishedDataController {
  constructor(private readonly publishedDataService: PublishedDataService) {}

  @Post()
  create(@Body() createPublishedDatumDto: CreatePublishedDatumDto) {
    return this.publishedDataService.create(createPublishedDatumDto);
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
    @Body() updatePublishedDatumDto: UpdatePublishedDatumDto,
  ) {
    return this.publishedDataService.update(+id, updatePublishedDatumDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.publishedDataService.remove(+id);
  }
}
