import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { OrigdatablocksService } from "./origdatablocks.service";
import { CreateOrigdatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigdatablockDto } from "./dto/update-origdatablock.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("origdatablocks")
@Controller("origdatablocks")
export class OrigdatablocksController {
  constructor(private readonly origdatablocksService: OrigdatablocksService) {}

  @Post()
  create(@Body() createOrigdatablockDto: CreateOrigdatablockDto) {
    return this.origdatablocksService.create(createOrigdatablockDto);
  }

  @Get()
  findAll() {
    return this.origdatablocksService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.origdatablocksService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateOrigdatablockDto: UpdateOrigdatablockDto,
  ) {
    return this.origdatablocksService.update(+id, updateOrigdatablockDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.origdatablocksService.remove(+id);
  }
}
