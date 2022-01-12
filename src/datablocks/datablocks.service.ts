import { Injectable } from "@nestjs/common";
import { CreateDatablockDto } from "./dto/create-datablock.dto";
import { UpdateDatablockDto } from "./dto/update-datablock.dto";

@Injectable()
export class DatablocksService {
  create(createDatablockDto: CreateDatablockDto) {
    return "This action adds a new datablock";
  }

  findAll() {
    return `This action returns all datablocks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} datablock`;
  }

  update(id: number, updateDatablockDto: UpdateDatablockDto) {
    return `This action updates a #${id} datablock`;
  }

  remove(id: number) {
    return `This action removes a #${id} datablock`;
  }
}
