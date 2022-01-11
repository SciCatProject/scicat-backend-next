import { Injectable } from "@nestjs/common";
import { CreateOrigdatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigdatablockDto } from "./dto/update-origdatablock.dto";

@Injectable()
export class OrigdatablocksService {
  create(createOrigdatablockDto: CreateOrigdatablockDto) {
    return "This action adds a new origdatablock";
  }

  findAll() {
    return `This action returns all origdatablock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} origdatablock`;
  }

  update(id: number, updateOrigdatablockDto: UpdateOrigdatablockDto) {
    return `This action updates a #${id} origdatablock`;
  }

  remove(id: number) {
    return `This action removes a #${id} origdatablock`;
  }
}
