import { Injectable } from "@nestjs/common";
import { CreateLogbookDto } from "./dto/create-logbook.dto";
import { UpdateLogbookDto } from "./dto/update-logbook.dto";

@Injectable()
export class LogbooksService {
  create(createLogbookDto: CreateLogbookDto) {
    return "This action adds a new logbook";
  }

  findAll() {
    return `This action returns all logbooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logbook`;
  }

  update(id: number, updateLogbookDto: UpdateLogbookDto) {
    return `This action updates a #${id} logbook`;
  }

  remove(id: number) {
    return `This action removes a #${id} logbook`;
  }
}
