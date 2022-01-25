import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { SamplesService } from "./samples.service";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";

@Controller("samples")
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Post()
  create(@Body() createSampleDto: CreateSampleDto) {
    return this.samplesService.create(createSampleDto);
  }

  @Get()
  findAll() {
    return this.samplesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.samplesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSampleDto: UpdateSampleDto) {
    return this.samplesService.update(+id, updateSampleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.samplesService.remove(+id);
  }
}
