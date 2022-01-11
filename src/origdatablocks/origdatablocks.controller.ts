import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { OrigdatablockService } from "./origdatablocks.service";
import { CreateOrigdatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigdatablockDto } from "./dto/update-origdatablock.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("origdatablocks")
@Controller("origdatablocks")
export class OrigdatablockController {
  constructor(private readonly origdatablockService: OrigdatablockService) {}

  @Post()
  create(@Body() createOrigdatablockDto: CreateOrigdatablockDto) {
    return this.origdatablockService.create(createOrigdatablockDto);
  }

  @Get()
  findAll() {
    return this.origdatablockService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.origdatablockService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateOrigdatablockDto: UpdateOrigdatablockDto,
  ) {
    return this.origdatablockService.update(+id, updateOrigdatablockDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.origdatablockService.remove(+id);
  }
}
