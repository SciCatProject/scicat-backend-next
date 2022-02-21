import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { LogbooksService } from "./logbooks.service";
import { CreateLogbookDto } from "./dto/create-logbook.dto";
import { UpdateLogbookDto } from "./dto/update-logbook.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("logbooks")
@Controller("logbooks")
export class LogbooksController {
  constructor(private readonly logbooksService: LogbooksService) {}

  @Post()
  create(@Body() createLogbookDto: CreateLogbookDto) {
    return this.logbooksService.create(createLogbookDto);
  }

  @Get()
  findAll() {
    return this.logbooksService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.logbooksService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateLogbookDto: UpdateLogbookDto) {
    return this.logbooksService.update(+id, updateLogbookDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.logbooksService.remove(+id);
  }
}
