import { Injectable } from "@nestjs/common";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";

@Injectable()
export class SamplesService {
  create(createSampleDto: CreateSampleDto) {
    return "This action adds a new sample";
  }

  findAll() {
    return `This action returns all samples`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sample`;
  }

  update(id: number, updateSampleDto: UpdateSampleDto) {
    return `This action updates a #${id} sample`;
  }

  remove(id: number) {
    return `This action removes a #${id} sample`;
  }
}
